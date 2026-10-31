import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Get all categories with item counts
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(f.id) as item_count
      FROM categories c
      LEFT JOIN food_items f ON f.category_id = c.id AND f.is_available = 1
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `).all();

    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// Get food items with filters, search, and sorting
router.get('/food-items', (req, res) => {
  const { category, search, veg, sort, bestseller, available } = req.query;

  try {
    let sql = `
      SELECT f.*, c.name as category_name, c.slug as category_slug
      FROM food_items f
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filter available only by default unless specified
    if (available === 'all') {
      // do not filter by is_available
    } else {
      sql += ' AND f.is_available = 1';
    }

    if (category && category !== 'all') {
      sql += ' AND (c.slug = ? OR c.name = ?)';
      params.push(category, category);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      sql += ' AND (f.name LIKE ? OR f.description LIKE ? OR c.name LIKE ?)';
      params.push(term, term, term);
    }

    if (veg !== undefined && veg !== '' && veg !== 'all') {
      if (veg === 'veg' || veg === '1' || veg === 'true') {
        sql += ' AND f.is_veg = 1';
      } else if (veg === 'non-veg' || veg === '0' || veg === 'false') {
        sql += ' AND f.is_veg = 0';
      }
    }

    if (bestseller === '1' || bestseller === 'true') {
      sql += ' AND f.is_bestseller = 1';
    }

    // Sorting
    if (sort === 'price-asc') {
      sql += ' ORDER BY COALESCE(f.discount_price, f.price) ASC';
    } else if (sort === 'price-desc') {
      sql += ' ORDER BY COALESCE(f.discount_price, f.price) DESC';
    } else if (sort === 'rating') {
      sql += ' ORDER BY f.rating DESC';
    } else {
      // Default: bestsellers first, then rating
      sql += ' ORDER BY f.is_bestseller DESC, f.rating DESC, f.name ASC';
    }

    const items = db.prepare(sql).all(...params);
    res.json({ items });
  } catch (err) {
    console.error('Fetch food items error:', err);
    res.status(500).json({ error: 'Failed to fetch food items.' });
  }
});

// Get featured items (bestsellers and special deals)
router.get('/featured', (req, res) => {
  try {
    const bestsellers = db.prepare(`
      SELECT f.*, c.name as category_name
      FROM food_items f
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE f.is_available = 1 AND f.is_bestseller = 1
      ORDER BY f.rating DESC
      LIMIT 6
    `).all();

    const deals = db.prepare(`
      SELECT f.*, c.name as category_name
      FROM food_items f
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE f.is_available = 1 AND f.discount_price IS NOT NULL AND f.discount_price < f.price
      ORDER BY (f.price - f.discount_price) DESC
      LIMIT 4
    `).all();

    res.json({ bestsellers, deals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured food items.' });
  }
});

// Get single food item
router.get('/food-items/:id', (req, res) => {
  try {
    const item = db.prepare(`
      SELECT f.*, c.name as category_name, c.slug as category_slug
      FROM food_items f
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE f.id = ? OR f.slug = ?
    `).get(req.params.id, req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Food item not found.' });
    }

    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food item.' });
  }
});

export default router;
