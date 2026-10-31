import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Get all saved addresses for user
router.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  try {
    const addresses = db.prepare(`
      SELECT * FROM addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `).all(userId);

    res.json({ addresses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses.' });
  }
});

// Add new address
router.post('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { label, full_name, phone, street_address, landmark, city, state, pincode, is_default } = req.body;

  if (!full_name || !phone || !street_address || !city || !pincode) {
    return res.status(400).json({ error: 'Please provide full name, phone, street address, city, and pincode.' });
  }

  try {
    const defaultVal = is_default ? 1 : 0;
    if (defaultVal === 1) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    } else {
      // If it's the first address, make it default automatically
      const count = (db.prepare('SELECT count(*) as count FROM addresses WHERE user_id = ?').get(userId) as any).count;
      if (count === 0) {
        // First address
        const resInsert = db.prepare(`
          INSERT INTO addresses (user_id, label, full_name, phone, street_address, landmark, city, state, pincode, is_default)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `).run(userId, label || 'Home', full_name.trim(), phone.trim(), street_address.trim(), landmark || null, city.trim(), state || 'Delhi NCR', pincode.trim());

        const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(resInsert.lastInsertRowid);
        return res.status(201).json({ message: 'Address saved successfully.', address });
      }
    }

    const resInsert = db.prepare(`
      INSERT INTO addresses (user_id, label, full_name, phone, street_address, landmark, city, state, pincode, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      label || 'Home',
      full_name.trim(),
      phone.trim(),
      street_address.trim(),
      landmark || null,
      city.trim(),
      state || 'Delhi NCR',
      pincode.trim(),
      defaultVal
    );

    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(resInsert.lastInsertRowid);
    res.status(201).json({ message: 'Address saved successfully.', address });
  } catch (err) {
    console.error('Save address error:', err);
    res.status(500).json({ error: 'Failed to save address.' });
  }
});

// Update address
router.put('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const addressId = req.params.id;
  const { label, full_name, phone, street_address, landmark, city, state, pincode, is_default } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?').get(addressId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Address not found.' });
    }

    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    }

    db.prepare(`
      UPDATE addresses SET
        label = COALESCE(?, label),
        full_name = COALESCE(?, full_name),
        phone = COALESCE(?, phone),
        street_address = COALESCE(?, street_address),
        landmark = COALESCE(?, landmark),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        is_default = COALESCE(?, is_default)
      WHERE id = ? AND user_id = ?
    `).run(
      label,
      full_name,
      phone,
      street_address,
      landmark,
      city,
      state,
      pincode,
      is_default ? 1 : 0,
      addressId,
      userId
    );

    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(addressId);
    res.json({ message: 'Address updated successfully.', address });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update address.' });
  }
});

// Set address as default
router.put('/:id/default', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const addressId = req.params.id;

  try {
    db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    const result = db.prepare('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?').run(addressId, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Address not found.' });
    }

    res.json({ message: 'Default address updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update default address.' });
  }
});

// Delete address
router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const addressId = req.params.id;

  try {
    const result = db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(addressId, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Address not found.' });
    }
    res.json({ message: 'Address removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address.' });
  }
});

export default router;
