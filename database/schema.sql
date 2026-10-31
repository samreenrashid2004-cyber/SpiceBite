-- ==============================================================
-- MasalaMunch (SpiceBite) Indian Fast Food Database Schema (SQLite)
-- ==============================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  permissions TEXT DEFAULT 'all',
  last_login DATETIME
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0
);

-- 4. Food Items Table
CREATE TABLE IF NOT EXISTS food_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price REAL NOT NULL,
  discount_price REAL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  is_veg INTEGER DEFAULT 1,
  spice_level TEXT DEFAULT 'Medium',
  image_url TEXT NOT NULL,
  is_available INTEGER DEFAULT 1,
  is_bestseller INTEGER DEFAULT 0,
  rating REAL DEFAULT 4.7,
  rating_count INTEGER DEFAULT 120,
  preparation_time_mins INTEGER DEFAULT 20,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Delhi NCR',
  pincode TEXT NOT NULL,
  is_default INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  food_item_id INTEGER REFERENCES food_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  instructions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, food_item_id)
);

-- 7. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value REAL NOT NULL,
  min_order_amount REAL DEFAULT 0,
  max_discount REAL,
  is_active INTEGER DEFAULT 1,
  expiry_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  subtotal REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  coupon_code TEXT,
  delivery_fee REAL DEFAULT 40,
  tax_amount REAL NOT NULL,
  total_amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  order_status TEXT NOT NULL DEFAULT 'PENDING',
  delivery_notes TEXT,
  estimated_delivery_time TEXT,
  rider_name TEXT,
  rider_phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  food_item_id INTEGER REFERENCES food_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  total_price REAL NOT NULL
);

-- 10. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  transaction_id TEXT UNIQUE,
  amount REAL NOT NULL,
  status TEXT NOT NULL,
  gateway_response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
