import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Create new order with strict server-side calculation
router.post('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    deliveryAddress,
    deliveryNotes,
    items,
    couponCode,
    paymentMethod,
    onlinePaymentDetails,
  } = req.body;

  // Validate contact & delivery info
  if (!customerName || !customerPhone || !customerEmail || !deliveryAddress) {
    return res.status(400).json({ error: 'Please provide customer name, phone, email, and delivery address.' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one food item.' });
  }

  const validMethods = ['COD', 'ONLINE_CARD', 'ONLINE_UPI'];
  const method = validMethods.includes(paymentMethod) ? paymentMethod : 'COD';

  try {
    // 1. Fetch and verify every item from DB to calculate exact subtotal on server
    let subtotal = 0;
    const verifiedItems: {
      food_item_id: number;
      item_name: string;
      item_price: number;
      quantity: number;
      total_price: number;
    }[] = [];

    const getItemStmt = db.prepare(`
      SELECT id, name, price, discount_price, is_available
      FROM food_items
      WHERE id = ?
    `);

    for (const rawItem of items) {
      const foodItemId = Number(rawItem.food_item_id || rawItem.id);
      const qty = Math.max(1, Math.floor(Number(rawItem.quantity) || 1));

      const food = getItemStmt.get(foodItemId) as any;
      if (!food) {
        return res.status(400).json({ error: `Food item #${foodItemId} does not exist.` });
      }

      if (!food.is_available) {
        return res.status(400).json({ error: `Item "${food.name}" is currently sold out.` });
      }

      const unitPrice = food.discount_price ? Number(food.discount_price) : Number(food.price);
      const lineTotal = Math.round(unitPrice * qty * 100) / 100;
      subtotal += lineTotal;

      verifiedItems.push({
        food_item_id: food.id,
        item_name: food.name,
        item_price: unitPrice,
        quantity: qty,
        total_price: lineTotal,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;

    // 2. Validate coupon code on server if supplied
    let discountAmount = 0;
    let appliedCoupon: string | null = null;

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const coupon = db.prepare(`
        SELECT * FROM coupons
        WHERE UPPER(code) = ? AND is_active = 1
      `).get(couponCode.trim().toUpperCase()) as any;

      if (coupon && subtotal >= coupon.min_order_amount) {
        appliedCoupon = coupon.code;
        if (coupon.discount_type === 'percentage') {
          discountAmount = (subtotal * coupon.discount_value) / 100;
          if (coupon.max_discount && discountAmount > coupon.max_discount) {
            discountAmount = coupon.max_discount;
          }
        } else {
          discountAmount = coupon.discount_value;
        }
        discountAmount = Math.min(discountAmount, subtotal);
        discountAmount = Math.round(discountAmount * 100) / 100;
      }
    }

    // 3. Delivery fee: Free for orders >= ₹499, else ₹40
    const deliveryFee = subtotal >= 499 ? 0 : 40;

    // 4. GST 5%
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableAmount * 0.05 * 100) / 100;

    // 5. Total
    const totalAmount = Math.round((taxableAmount + deliveryFee + taxAmount) * 100) / 100;

    // 6. Generate unique order ID e.g. MM-48201
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `MM-${randomDigits}`;

    // Payment status & details
    const isOnline = method === 'ONLINE_CARD' || method === 'ONLINE_UPI';
    const paymentStatus = isOnline ? 'PAID' : 'PENDING';
    const transactionId = isOnline
      ? (onlinePaymentDetails?.transactionId || `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`)
      : null;

    const userId = req.user ? req.user.id : null;

    // Atomic database transaction
    const createOrderTransaction = db.transaction(() => {
      // Insert Order
      const insertOrder = db.prepare(`
        INSERT INTO orders (
          order_number, user_id, customer_name, customer_phone, customer_email,
          delivery_address, subtotal, discount_amount, coupon_code, delivery_fee,
          tax_amount, total_amount, payment_method, payment_status, order_status,
          delivery_notes, estimated_delivery_time, rider_name, rider_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, '30-40 mins', 'Tariq Mehmood', '+92 301 2345678')
      `);

      const orderResult = insertOrder.run(
        orderNumber,
        userId,
        customerName.trim(),
        customerPhone.trim(),
        customerEmail.trim().toLowerCase(),
        deliveryAddress.trim(),
        subtotal,
        discountAmount,
        appliedCoupon,
        deliveryFee,
        taxAmount,
        totalAmount,
        method,
        paymentStatus,
        deliveryNotes ? deliveryNotes.trim() : null
      );

      const orderId = Number(orderResult.lastInsertRowid);

      // Insert Order Items
      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, food_item_id, item_name, item_price, quantity, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const it of verifiedItems) {
        insertItem.run(orderId, it.food_item_id, it.item_name, it.item_price, it.quantity, it.total_price);
      }

      // Record Payment
      db.prepare(`
        INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, gateway_response)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        orderId,
        method,
        transactionId,
        totalAmount,
        isOnline ? 'SUCCESS' : 'PENDING',
        isOnline ? JSON.stringify({ mode: method, status: 'SUCCESS', verified: true }) : JSON.stringify({ mode: 'COD' })
      );

      // If user logged in, clear their cart
      if (userId) {
        db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
      }

      return orderId;
    });

    const orderId = createOrderTransaction();

    // Fetch newly created order
    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    res.status(201).json({
      message: 'Order placed successfully!',
      order: {
        ...createdOrder,
        items: orderItems,
      },
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order. ' + (err.message || '') });
  }
});

// Get user orders history
router.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  try {
    const orders = db.prepare(`
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId) as any[];

    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: getItems.all(order.id),
    }));

    res.json({ orders: ordersWithItems });
  } catch (err) {
    console.error('Fetch user orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Track order by orderNumber (public tracking for convenience)
router.get('/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;

  try {
    const order = db.prepare(`
      SELECT * FROM orders
      WHERE order_number = ?
    `).get(orderNumber) as any;

    if (!order) {
      return res.status(404).json({ error: `Order #${orderNumber} not found.` });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(order.id);

    // Provide milestone tracking timestamps & status steps
    const steps = [
      { key: 'CONFIRMED', label: 'Order Confirmed', description: 'Restaurant has accepted your order' },
      { key: 'PREPARING', label: 'Kitchen Preparing', description: 'Chef is crafting your delicious meal' },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'Rider is on the way to your location' },
      { key: 'DELIVERED', label: 'Delivered', description: 'Enjoy your hot & fresh Indian feast!' },
    ];

    res.json({
      order: {
        ...order,
        items,
        payment,
      },
      steps,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track order.' });
  }
});

export default router;
