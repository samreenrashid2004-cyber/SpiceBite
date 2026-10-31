import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Helper to calculate cart totals
export function calculateCartSummary(userId: number) {
  const items = db.prepare(`
    SELECT 
      ci.id as cart_item_id,
      ci.quantity,
      ci.instructions,
      f.id as food_item_id,
      f.name,
      f.slug,
      f.price,
      f.discount_price,
      f.image_url,
      f.is_veg,
      f.is_available,
      COALESCE(f.discount_price, f.price) as effective_price,
      (ci.quantity * COALESCE(f.discount_price, f.price)) as item_total
    FROM cart_items ci
    JOIN food_items f ON ci.food_item_id = f.id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `).all(userId) as any[];

  const subtotal = items.reduce((sum, item) => sum + (item.is_available ? item.item_total : 0), 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 499 ? 0 : 40) : 0;
  // GST / Taxes (approx 5% standard food tax in India)
  const tax = subtotal > 0 ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const total = subtotal + deliveryFee + tax;

  return {
    items,
    summary: {
      subtotal,
      deliveryFee,
      freeDeliveryThreshold: 499,
      tax,
      total,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
    },
  };
}

// Get user cart
router.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const result = calculateCartSummary(req.user!.id);
    res.json(result);
  } catch (err) {
    console.error('Fetch cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart.' });
  }
});

// Add or update cart item
router.post('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const { foodItemId, quantity, instructions } = req.body;
  const userId = req.user!.id;

  if (!foodItemId) {
    return res.status(400).json({ error: 'Food item ID is required.' });
  }

  const targetQty = Number(quantity);
  if (isNaN(targetQty) || targetQty < 0) {
    return res.status(400).json({ error: 'Valid quantity is required.' });
  }

  // Check item exists
  const foodItem = db.prepare('SELECT id, name, is_available FROM food_items WHERE id = ?').get(foodItemId) as any;
  if (!foodItem) {
    return res.status(404).json({ error: 'Food item not found.' });
  }

  if (!foodItem.is_available && targetQty > 0) {
    return res.status(400).json({ error: `${foodItem.name} is currently out of stock.` });
  }

  try {
    if (targetQty === 0) {
      db.prepare('DELETE FROM cart_items WHERE user_id = ? AND food_item_id = ?').run(userId, foodItemId);
    } else {
      const existing = db.prepare('SELECT id FROM cart_items WHERE user_id = ? AND food_item_id = ?').get(userId, foodItemId);
      if (existing) {
        db.prepare(`
          UPDATE cart_items 
          SET quantity = ?, instructions = COALESCE(?, instructions)
          WHERE user_id = ? AND food_item_id = ?
        `).run(targetQty, instructions || null, userId, foodItemId);
      } else {
        db.prepare(`
          INSERT INTO cart_items (user_id, food_item_id, quantity, instructions)
          VALUES (?, ?, ?, ?)
        `).run(userId, foodItemId, targetQty, instructions || null);
      }
    }

    const updatedCart = calculateCartSummary(userId);
    res.json({
      message: 'Cart updated successfully.',
      ...updatedCart,
    });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Failed to update cart.' });
  }
});

// Remove single item
router.delete('/:foodItemId', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const foodItemId = req.params.foodItemId;

  try {
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND food_item_id = ?').run(userId, foodItemId);
    const updatedCart = calculateCartSummary(userId);
    res.json({
      message: 'Item removed from cart.',
      ...updatedCart,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item.' });
  }
});

// Clear cart
router.delete('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  try {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    res.json({
      message: 'Cart cleared successfully.',
      items: [],
      summary: {
        subtotal: 0,
        deliveryFee: 0,
        freeDeliveryThreshold: 499,
        tax: 0,
        total: 0,
        itemCount: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart.' });
  }
});

// Sync local items into user cart on login
router.post('/sync', requireAuth, (req: AuthenticatedRequest, res) => {
  const { localItems } = req.body;
  const userId = req.user!.id;

  if (Array.isArray(localItems) && localItems.length > 0) {
    const upsertStmt = db.prepare(`
      INSERT INTO cart_items (user_id, food_item_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, food_item_id) DO UPDATE SET
        quantity = quantity + excluded.quantity
    `);

    const syncTransaction = db.transaction((items) => {
      for (const it of items) {
        if (it.food_item_id && it.quantity > 0) {
          upsertStmt.run(userId, it.food_item_id, it.quantity);
        }
      }
    });

    try {
      syncTransaction(localItems);
    } catch (e) {
      console.error('Error syncing cart:', e);
    }
  }

  res.json(calculateCartSummary(userId));
});

export default router;
