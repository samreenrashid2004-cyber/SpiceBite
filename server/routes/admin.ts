import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Protect all admin routes
router.use(requireAdmin);

// Dashboard Metrics
router.get('/metrics', (req: AuthenticatedRequest, res) => {
  try {
    const totalSales = (db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE order_status != 'CANCELLED'
    `).get() as any).total;

    const totalOrders = (db.prepare('SELECT count(*) as count FROM orders').get() as any).count;
    const pendingOrders = (db.prepare(`SELECT count(*) as count FROM orders WHERE order_status IN ('CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY')`).get() as any).count;
    const deliveredOrders = (db.prepare(`SELECT count(*) as count FROM orders WHERE order_status = 'DELIVERED'`).get() as any).count;

    const totalCustomers = (db.prepare(`SELECT count(*) as count FROM users WHERE role = 'customer'`).get() as any).count;
    const totalMenuItems = (db.prepare('SELECT count(*) as count FROM food_items').get() as any).count;
    const outOfStockItems = (db.prepare('SELECT count(*) as count FROM food_items WHERE is_available = 0').get() as any).count;

    // Recent orders
    const recentOrders = db.prepare(`
      SELECT id, order_number, customer_name, total_amount, order_status, payment_method, payment_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 8
    `).all();

    // Top selling items
    const topItems = db.prepare(`
      SELECT oi.item_name, SUM(oi.quantity) as sold_count, SUM(oi.total_price) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_status != 'CANCELLED'
      GROUP BY oi.item_name
      ORDER BY sold_count DESC
      LIMIT 5
    `).all();

    res.json({
      metrics: {
        totalSales,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalCustomers,
        totalMenuItems,
        outOfStockItems,
      },
      recentOrders,
      topItems,
    });
  } catch (err) {
    console.error('Admin metrics error:', err);
    res.status(500).json({ error: 'Failed to fetch admin metrics.' });
  }
});

// All Orders
router.get('/orders', (req: AuthenticatedRequest, res) => {
  const { status, search } = req.query;

  try {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ' AND order_status = ?';
      params.push(status);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      sql += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
      params.push(term, term, term);
    }

    sql += ' ORDER BY created_at DESC';
    const orders = db.prepare(sql).all(...params) as any[];

    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    const ordersWithItems = orders.map((o) => ({
      ...o,
      items: getItems.all(o.id),
    }));

    res.json({ orders: ordersWithItems });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin orders.' });
  }
});

// Update Order Status
router.put('/orders/:id/status', (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, riderName, riderPhone, estimatedDeliveryTime, paymentStatus } = req.body;

  const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status value.' });
  }

  try {
    const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    db.prepare(`
      UPDATE orders SET
        order_status = ?,
        rider_name = COALESCE(?, rider_name),
        rider_phone = COALESCE(?, rider_phone),
        estimated_delivery_time = COALESCE(?, estimated_delivery_time),
        payment_status = COALESCE(?, payment_status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      status,
      riderName || null,
      riderPhone || null,
      estimatedDeliveryTime || null,
      paymentStatus || (status === 'DELIVERED' ? 'PAID' : null),
      id
    );

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

    res.json({
      message: `Order status updated to ${status}.`,
      order: { ...updated, items },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Food Items: Create
router.post('/food-items', (req: AuthenticatedRequest, res) => {
  const {
    name,
    description,
    price,
    discount_price,
    category_id,
    is_veg,
    spice_level,
    image_url,
    is_available,
    is_bestseller,
    preparation_time_mins,
  } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: 'Name, price, and category are required.' });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);

  try {
    const result = db.prepare(`
      INSERT INTO food_items (
        name, slug, description, price, discount_price, category_id,
        is_veg, spice_level, image_url, is_available, is_bestseller,
        preparation_time_mins
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      slug,
      description ? description.trim() : '',
      Number(price),
      discount_price ? Number(discount_price) : null,
      Number(category_id),
      is_veg ? 1 : 0,
      spice_level || 'Medium',
      image_url || '/src/assets/images/tandoori_zinger_burger_1793432674563.jpg',
      is_available !== undefined ? (is_available ? 1 : 0) : 1,
      is_bestseller ? 1 : 0,
      preparation_time_mins ? Number(preparation_time_mins) : 15
    );

    const newItem = db.prepare('SELECT * FROM food_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Food item added successfully.', item: newItem });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add food item: ' + err.message });
  }
});

// Food Items: Update
router.put('/food-items/:id', (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    discount_price,
    category_id,
    is_veg,
    spice_level,
    image_url,
    is_available,
    is_bestseller,
    preparation_time_mins,
  } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM food_items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Food item not found.' });
    }

    db.prepare(`
      UPDATE food_items SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        discount_price = ?,
        category_id = COALESCE(?, category_id),
        is_veg = COALESCE(?, is_veg),
        spice_level = COALESCE(?, spice_level),
        image_url = COALESCE(?, image_url),
        is_available = COALESCE(?, is_available),
        is_bestseller = COALESCE(?, is_bestseller),
        preparation_time_mins = COALESCE(?, preparation_time_mins)
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      description !== undefined ? description.trim() : null,
      price ? Number(price) : null,
      discount_price ? Number(discount_price) : null,
      category_id ? Number(category_id) : null,
      is_veg !== undefined ? (is_veg ? 1 : 0) : null,
      spice_level || null,
      image_url || null,
      is_available !== undefined ? (is_available ? 1 : 0) : null,
      is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : null,
      preparation_time_mins ? Number(preparation_time_mins) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM food_items WHERE id = ?').get(id);
    res.json({ message: 'Food item updated successfully.', item: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update food item: ' + err.message });
  }
});

// Food Items: Delete
router.delete('/food-items/:id', (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM food_items WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Food item not found.' });
    }
    res.json({ message: 'Food item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete food item.' });
  }
});

// Categories: Create
router.post('/categories', (req: AuthenticatedRequest, res) => {
  const { name, description, icon } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  try {
    const maxOrder = (db.prepare('SELECT COALESCE(MAX(display_order), 0) as maxOrder FROM categories').get() as any).maxOrder;
    const result = db.prepare(`
      INSERT INTO categories (name, slug, description, icon, display_order)
      VALUES (?, ?, ?, ?, ?)
    `).run(name.trim(), slug, description || '', icon || 'Utensils', maxOrder + 1);

    const newCat = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Category created.', category: newCat });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create category: ' + err.message });
  }
});

// Coupons: List all
router.get('/coupons', (req: AuthenticatedRequest, res) => {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coupons.' });
  }
});

// Coupons: Create
router.post('/coupons', (req: AuthenticatedRequest, res) => {
  const { code, description, discount_type, discount_value, min_order_amount, max_discount, is_active } = req.body;

  if (!code || !discount_value) {
    return res.status(400).json({ error: 'Coupon code and discount value are required.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      code.trim().toUpperCase(),
      description || '',
      discount_type || 'percentage',
      Number(discount_value),
      Number(min_order_amount || 0),
      max_discount ? Number(max_discount) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    );

    const newCoupon = db.prepare('SELECT * FROM coupons WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Coupon created.', coupon: newCoupon });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create coupon: ' + err.message });
  }
});

// Coupons: Update
router.put('/coupons/:id', (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { code, description, discount_type, discount_value, min_order_amount, max_discount, is_active } = req.body;

  try {
    db.prepare(`
      UPDATE coupons SET
        code = COALESCE(?, code),
        description = COALESCE(?, description),
        discount_type = COALESCE(?, discount_type),
        discount_value = COALESCE(?, discount_value),
        min_order_amount = COALESCE(?, min_order_amount),
        max_discount = ?,
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(
      code ? code.trim().toUpperCase() : null,
      description !== undefined ? description : null,
      discount_type || null,
      discount_value ? Number(discount_value) : null,
      min_order_amount !== undefined ? Number(min_order_amount) : null,
      max_discount ? Number(max_discount) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM coupons WHERE id = ?').get(id);
    res.json({ message: 'Coupon updated.', coupon: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update coupon: ' + err.message });
  }
});

// Coupons: Delete
router.delete('/coupons/:id', (req: AuthenticatedRequest, res) => {
  try {
    db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
    res.json({ message: 'Coupon deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete coupon.' });
  }
});

// Customers list
router.get('/customers', (req: AuthenticatedRequest, res) => {
  try {
    const customers = db.prepare(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.created_at,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.order_status != 'CANCELLED'
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY order_count DESC, u.created_at DESC
    `).all();

    res.json({ customers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers.' });
  }
});

export default router;
