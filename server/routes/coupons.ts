import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Get active public coupons
router.get('/', (req, res) => {
  try {
    const coupons = db.prepare(`
      SELECT id, code, description, discount_type, discount_value, min_order_amount, max_discount
      FROM coupons
      WHERE is_active = 1
      ORDER BY min_order_amount ASC
    `).all();

    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coupons.' });
  }
});

// Apply & validate coupon against subtotal
router.post('/apply', (req, res) => {
  const { code, subtotal } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Coupon code is required.' });
  }

  const cleanCode = code.trim().toUpperCase();
  const orderSubtotal = Number(subtotal) || 0;

  try {
    const coupon = db.prepare(`
      SELECT * FROM coupons
      WHERE UPPER(code) = ? AND is_active = 1
    `).get(cleanCode) as any;

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon code.' });
    }

    if (orderSubtotal < coupon.min_order_amount) {
      return res.status(400).json({
        error: `Cart total must be at least ₹${coupon.min_order_amount} to apply coupon ${coupon.code}. Add ₹${(coupon.min_order_amount - orderSubtotal).toFixed(0)} more!`,
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (orderSubtotal * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    discount = Math.min(discount, orderSubtotal);
    discount = Math.round(discount * 100) / 100;

    res.json({
      valid: true,
      code: coupon.code,
      discount,
      message: `Coupon ${coupon.code} applied! You saved ₹${discount}`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate coupon.' });
  }
});

export default router;
