import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'fastfood.db');
export const db = new Database(dbPath);

// Enable foreign keys and WAL mode for reliability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
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
  `);

  seedInitialData();
}

function seedInitialData() {
  // Check if categories already seeded
  const catCount = db.prepare('SELECT count(*) as count FROM categories').get() as { count: number };
  if (catCount.count === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (name, slug, description, icon, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    const categories = [
      ['Burgers', 'burgers', 'Juicy desi-style loaded gourmet burgers with crispy patties', 'Utensils', 1],
      ['Pizza', 'pizza', 'Cheesy tandoori and tikka stone-baked pan pizzas', 'Pizza', 2],
      ['Zinger Burgers', 'zinger-burgers', 'Super-crispy spiced fillets with secret spicy dressings', 'Flame', 3],
      ['Sandwiches', 'sandwiches', 'Grilled Mumbai masala club sandwiches with mint chutney', 'Sandwich', 4],
      ['Fries', 'fries', 'Crispy potato fries tossed in peri-peri and gunpowder masala', 'CookingPot', 5],
      ['Biryani', 'biryani', 'Authentic fragrant basmati dum biryani with rich saffron aroma', 'Bowl', 6],
      ['Shawarma', 'shawarma', 'Middle-Eastern roasted wraps infused with Indian garlic-chili kick', 'Wrap', 7],
      ['Rolls', 'rolls', 'Classic Kolkata layered kathi rolls with flaky paratha', 'Scroll', 8],
      ['Momos', 'momos', 'Steamed and crispy kurkure momos with fiery Schezwan dip', 'Soup', 9],
      ['Indian Street Food', 'indian-street-food', 'Crispy chaat, samosa pav, and spicy street delicacies', 'Sparkles', 10],
      ['Cold Drinks', 'cold-drinks', 'Chilled spiced masala sodas, nimbu shikanji, and shakes', 'Coffee', 11],
      ['Desserts', 'desserts', 'Hot gulab jamun, royal kulfi, and sizzling brownies', 'Cake', 12]
    ];

    for (const cat of categories) {
      insertCat.run(cat[0], cat[1], cat[2], cat[3], cat[4]);
    }
  }

  // Check food items
  const foodCount = db.prepare('SELECT count(*) as count FROM food_items').get() as { count: number };
  if (foodCount.count === 0) {
    const getCatId = (slug: string) => {
      const row = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug) as { id: number } | undefined;
      return row ? row.id : 1;
    };

    const insertFood = db.prepare(`
      INSERT INTO food_items (
        name, slug, description, price, discount_price, category_id,
        is_veg, spice_level, image_url, is_available, is_bestseller,
        rating, rating_count, preparation_time_mins
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const items = [
      // Zinger Burgers
      [
        'Tandoori Spiced Zinger Burger',
        'tandoori-spiced-zinger-burger',
        'Double-crunch marinated chicken breast tossed in tandoori glaze, spiced mint mayo, crispy onion rings and melted cheddar in a toasted brioche bun.',
        249,
        199,
        getCatId('zinger-burgers'),
        0, // non-veg
        'Spicy',
        '/src/assets/images/tandoori_zinger_burger_1793432674563.jpg',
        1,
        1,
        4.9,
        342,
        15
      ],
      [
        'Fiery Paneer Crispy Zinger',
        'fiery-paneer-crispy-zinger',
        'Crispy golden paneer patty seasoned with Kashmiri red chili and herbs, topped with crunchy shredded iceberg lettuce and tangy peri-peri garlic dressing.',
        219,
        189,
        getCatId('zinger-burgers'),
        1, // veg
        'Medium',
        'https://images.unsplash.com/photo-1550547660-d9450f859349?w=700&auto=format&fit=crop&q=80',
        1,
        1,
        4.8,
        210,
        15
      ],

      // Biryani
      [
        'Royal Hyderabadi Dum Biryani',
        'royal-hyderabadi-dum-biryani',
        'Slow-cooked aged long-grain basmati rice with tender succulent marinated chicken, saffron, caramelised onions, and fresh mint. Served in an authentic handi with cool cucumber raita.',
        349,
        299,
        getCatId('biryani'),
        0,
        'Medium',
        '/src/assets/images/dum_biryani_handi_1793432675798.jpg',
        1,
        1,
        4.95,
        518,
        25
      ],
      [
        'Shahi Lucknowi Paneer Biryani',
        'shahi-lucknowi-paneer-biryani',
        'Fragrant dum biryani with soft grilled cottage cheese cubes, whole royal spices, kewra essence, roasted cashews, and crispy brown onions.',
        289,
        259,
        getCatId('biryani'),
        1,
        'Mild',
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
        1,
        0,
        4.7,
        180,
        20
      ],

      // Momos
      [
        'Signature Steamed Darjeeling Momos',
        'signature-steamed-darjeeling-momos',
        'Delicate thin-skinned steamed dumplings filled with finely chopped garden vegetables, ginger, scallions, and herbs. Served with our fiery roasted red chili garlic chutney.',
        169,
        139,
        getCatId('momos'),
        1,
        'Spicy',
        '/src/assets/images/street_momos_platter_1793432676578.jpg',
        1,
        1,
        4.85,
        425,
        12
      ],
      [
        'Crispy Kurkure Chicken Momos',
        'crispy-kurkure-chicken-momos',
        'Flavour-packed chicken momos coated in crunchy cornflake crumbles, deep-fried to golden perfection, served with garlic mayo and Schezwan dip.',
        199,
        179,
        getCatId('momos'),
        0,
        'Medium',
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&auto=format&fit=crop&q=80',
        1,
        1,
        4.8,
        290,
        15
      ],

      // Rolls
      [
        'Kolkata Paneer Tikka Kathi Roll',
        'kolkata-paneer-tikka-kathi-roll',
        'Smoky chargrilled cottage cheese tossed with capsicum, crunchy red onions, chaat masala, and spicy green chutney, wrapped tightly in a flaky handmade laccha paratha.',
        189,
        159,
        getCatId('rolls'),
        1,
        'Medium',
        '/src/assets/images/paneer_kathi_roll_1793432677428.jpg',
        1,
        1,
        4.9,
        380,
        12
      ],
      [
        'Double Egg Double Chicken Roll',
        'double-egg-double-chicken-roll',
        'Street-style buttery paratha lined with two fresh eggs, layered with spicy shredded roasted chicken, lime juice, and green chilies.',
        229,
        199,
        getCatId('rolls'),
        0,
        'Spicy',
        'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=700&auto=format&fit=crop&q=80',
        1,
        1,
        4.8,
        310,
        14
      ],

      // Burgers
      [
        'Aloo Tikki Supreme Burger',
        'aloo-tikki-supreme-burger',
        'Golden spiced potato and green pea patty seasoned with garam masala, sliced ripe tomatoes, crunchy red onions, and sweet tamarind-mint drizzle.',
        129,
        109,
        getCatId('burgers'),
        1,
        'Mild',
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
        1,
        1,
        4.7,
        260,
        10
      ],
      [
        'Butter Chicken Slider Burger',
        'butter-chicken-slider-burger',
        'Pulled succulent tandoori chicken simmered in rich makhani gravy, folded with crisp cabbage slaw in a soft buttered bun.',
        239,
        209,
        getCatId('burgers'),
        0,
        'Medium',
        'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=700&auto=format&fit=crop&q=80',
        1,
        0,
        4.75,
        195,
        15
      ],

      // Pizza
      [
        'Paneer Makhani Pan Pizza (10")',
        'paneer-makhani-pan-pizza',
        'Stone-baked crust topped with creamy butter makhani sauce, marinated paneer cubes, roasted bell peppers, mozzarella cheese, and dried kasuri methi.',
        379,
        329,
        getCatId('pizza'),
        1,
        'Medium',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80',
        1,
        1,
        4.85,
        312,
        22
      ],
      [
        'Chicken Tikka Sizzler Pizza (10")',
        'chicken-tikka-sizzler-pizza',
        'Loaded with spicy charcoal chicken tikka chunks, jalapenos, crunchy capsicum, red onions, and double mozzarella blend with chili flakes.',
        429,
        379,
        getCatId('pizza'),
        0,
        'Spicy',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&auto=format&fit=crop&q=80',
        1,
        1,
        4.9,
        410,
        22
      ],

      // Sandwiches
      [
        'Mumbai Grilled Masala Sandwich',
        'mumbai-grilled-masala-sandwich',
        'Triple-decker sandwich stuffed with boiled spiced potatoes, beetroot, cucumber, tomatoes, house special sandwich masala, and melting Amul cheese.',
        159,
        139,
        getCatId('sandwiches'),
        1,
        'Medium',
        'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=700&auto=format&fit=crop&q=80',
        1,
        1,
        4.8,
        340,
        12
      ],

      // Fries
      [
        'Peri-Peri Masala Gunpowder Fries',
        'peri-peri-masala-gunpowder-fries',
        'Crispy hand-cut golden fries tossed in aromatic fiery peri-peri seasoning and roasted South Indian gunpowder masala. Served with spicy cheese dip.',
        139,
        119,
        getCatId('fries'),
        1,
        'Spicy',
        'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=700&auto=format&fit=crop&q=80',
        1,
        1,
        4.7,
        280,
        10
      ],

      // Shawarma
      [
        'Spicy Desi Chicken Shawarma',
        'spicy-desi-chicken-shawarma',
        'Slow-roasted Lebanese spiced chicken strips rolled in thin rumali roti with pickled turnips, garlic toum, and a fiery habanero drizzle.',
        199,
        169,
        getCatId('shawarma'),
        0,
        'Spicy',
        'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=700&auto=format&fit=crop&q=80',
        1,
        1,
        4.8,
        295,
        12
      ],

      // Indian Street Food
      [
        'Dahi Puri Chaat Explosion (6 pcs)',
        'dahi-puri-chaat-explosion',
        'Crispy hollow puris filled with spiced potato and sprouts, chilled sweet curd, tangy tamarind chutney, spicy mint water, and nylon sev.',
        149,
        129,
        getCatId('indian-street-food'),
        1,
        'Medium',
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80',
        1,
        1,
        4.9,
        380,
        8
      ],
      [
        'Crispy Punjabi Samosa Pav (2 pcs)',
        'crispy-punjabi-samosa-pav',
        'Deep-fried flaky pastry filled with cumin-spiced potatoes and cashew nuts, tucked into buttery pav with dry garlic coconut chutney.',
        119,
        99,
        getCatId('indian-street-food'),
        1,
        'Medium',
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80',
        1,
        0,
        4.6,
        170,
        10
      ],

      // Cold Drinks
      [
        'Royal Kesar Pista Badam Lassi',
        'royal-kesar-pista-badam-lassi',
        'Thick, velvety churned Punjabi yogurt blended with saffron threads, roasted pistachios, cardamoms, and topped with clotted cream malai.',
        129,
        99,
        getCatId('cold-drinks'),
        1,
        'Mild',
        'https://images.unsplash.com/photo-1556881286-fc6915169721?w=700&auto=format&fit=crop&q=80',
        1,
        1,
        4.85,
        310,
        5
      ],
      [
        'Chatpata Masala Jeera Lemonade',
        'chatpata-masala-jeera-lemonade',
        'Refreshing sparkling lemonade spiked with roasted cumin, black rock salt, fresh mint leaves, and squeezed limes.',
        89,
        69,
        getCatId('cold-drinks'),
        1,
        'Mild',
        'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=700&auto=format&fit=crop&q=80',
        1,
        0,
        4.7,
        140,
        5
      ],

      // Desserts
      [
        'Warm Gulab Jamun with Rabdi (2 pcs)',
        'warm-gulab-jamun-with-rabdi',
        'Soft golden milk-solid dumplings soaked in rose and cardamom sugar syrup, smothered in rich slow-simmered rabdi and toasted almonds.',
        149,
        119,
        getCatId('desserts'),
        1,
        'Mild',
        'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=700&auto=format&fit=crop&q=80',
        1,
        1,
        4.95,
        440,
        5
      ],
      [
        'Matka Malai Kulfi on Stick',
        'matka-malai-kulfi-on-stick',
        'Traditional frozen Indian dairy dessert enriched with saffron, pistachio crumbles, and crushed green cardamom.',
        99,
        79,
        getCatId('desserts'),
        1,
        'Mild',
        'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=700&auto=format&fit=crop&q=80',
        1,
        0,
        4.8,
        210,
        5
      ]
    ];

    for (const item of items) {
      insertFood.run(...item);
    }
  }

  // Check default users (Admin & Customer)
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('Admin@123', salt);
    const customerHash = bcrypt.hashSync('Customer@123', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    const adminResult = insertUser.run(
      'SpiceBite Admin',
      'admin@spicebite.pk',
      adminHash,
      '+92 300 1234567',
      'admin'
    );

    db.prepare('INSERT INTO admins (user_id, permissions) VALUES (?, ?)').run(
      adminResult.lastInsertRowid,
      'all'
    );

    const customerResult = insertUser.run(
      'Hamza Khan',
      'customer@spicebite.pk',
      customerHash,
      '+92 321 9876543',
      'customer'
    );

    // Seed default address for customer (Lahore, Pakistan)
    db.prepare(`
      INSERT INTO addresses (user_id, label, full_name, phone, street_address, landmark, city, state, pincode, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      customerResult.lastInsertRowid,
      'Home',
      'Hamza Khan',
      '+92 321 9876543',
      'House 14-B, Sector Z, Phase 3, DHA',
      'Near Packages Mall / Y-Block',
      'Lahore',
      'Punjab, Pakistan',
      '54000',
      1
    );
  }

  // Seed Coupons with PKR (Rs.)
  const couponCount = db.prepare('SELECT count(*) as count FROM coupons').get() as { count: number };
  if (couponCount.count === 0) {
    const insertCoupon = db.prepare(`
      INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertCoupon.run('FIRSTBITE', '20% off on your first order above Rs. 299', 'percentage', 20, 299, 100, 1);
    insertCoupon.run('DESI50', 'Flat Rs. 50 off on orders above Rs. 399', 'fixed', 50, 399, 50, 1);
    insertCoupon.run('BIRYANI20', '15% off on royal biryani feasts', 'percentage', 15, 349, 80, 1);
    insertCoupon.run('FEAST100', 'Flat Rs. 100 off on party orders above Rs. 799', 'fixed', 100, 799, 100, 1);
  }

  // Seed sample initial orders for realism in admin dashboard and user history
  const orderCount = db.prepare('SELECT count(*) as count FROM orders').get() as { count: number };
  if (orderCount.count === 0) {
    const customer = db.prepare('SELECT id, name, email, phone FROM users LIMIT 1').get() as { id: number; name: string; email: string; phone: string } | undefined;
    
    if (customer) {
      const zinger = db.prepare('SELECT id, name, price, discount_price FROM food_items WHERE slug = ?').get('tandoori-spiced-zinger-burger') as any;
      const biryani = db.prepare('SELECT id, name, price, discount_price FROM food_items WHERE slug = ?').get('royal-hyderabadi-dum-biryani') as any;

      if (zinger && biryani) {
        const insertOrder = db.prepare(`
          INSERT INTO orders (
            order_number, user_id, customer_name, customer_phone, customer_email,
            delivery_address, subtotal, discount_amount, coupon_code, delivery_fee,
            tax_amount, total_amount, payment_method, payment_status, order_status,
            delivery_notes, estimated_delivery_time, rider_name, rider_phone
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Order 1: Delivered
        const res1 = insertOrder.run(
          'SB-78291',
          customer.id,
          customer.name,
          customer.phone,
          customer.email,
          'House 14-B, Sector Z, Phase 3, DHA, Lahore, Pakistan',
          498,
          50,
          'DESI50',
          40,
          24.4,
          512.4,
          'ONLINE_UPI',
          'PAID',
          'DELIVERED',
          'Please ring the doorbell twice',
          '35 mins',
          'Tariq Mehmood',
          '+92 301 2345678'
        );

        db.prepare(`
          INSERT INTO order_items (order_id, food_item_id, item_name, item_price, quantity, total_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(res1.lastInsertRowid, zinger.id, zinger.name, zinger.discount_price || zinger.price, 1, zinger.discount_price || zinger.price);

        db.prepare(`
          INSERT INTO order_items (order_id, food_item_id, item_name, item_price, quantity, total_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(res1.lastInsertRowid, biryani.id, biryani.name, biryani.discount_price || biryani.price, 1, biryani.discount_price || biryani.price);

        db.prepare(`
          INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, gateway_response)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(res1.lastInsertRowid, 'ONLINE_UPI', 'PK_TXN_987213498', 512.4, 'SUCCESS', '{"ref": "987213498", "status": "COMPLETED"}');

        // Order 2: Active (Out for Delivery)
        const res2 = insertOrder.run(
          'SB-84920',
          customer.id,
          customer.name,
          customer.phone,
          customer.email,
          'House 14-B, Sector Z, Phase 3, DHA, Lahore, Pakistan',
          199,
          0,
          null,
          40,
          10.0,
          249.0,
          'COD',
          'PENDING',
          'OUT_FOR_DELIVERY',
          'Hot and fresh please',
          '15 mins',
          'Hamza Malik',
          '+92 300 8765432'
        );

        db.prepare(`
          INSERT INTO order_items (order_id, food_item_id, item_name, item_price, quantity, total_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(res2.lastInsertRowid, zinger.id, zinger.name, zinger.discount_price || zinger.price, 1, zinger.discount_price || zinger.price);
      }
    }
  }

  // Safe migration for existing DB data to ensure 100% Pakistan business identity
  try {
    db.prepare(`
      UPDATE addresses 
      SET street_address = 'House 14-B, Sector Z, Phase 3, DHA',
          landmark = 'Near Packages Mall / Y Block',
          city = 'Lahore',
          state = 'Punjab, Pakistan',
          pincode = '54000',
          phone = '+92 321 9876543'
      WHERE city LIKE '%Noida%' OR city LIKE '%Delhi%' OR phone LIKE '%+91%'
    `).run();

    db.prepare(`
      UPDATE orders
      SET delivery_address = 'House 14-B, Sector Z, Phase 3, DHA, Lahore, Pakistan',
          customer_phone = '+92 300 1234567',
          rider_name = 'Tariq Mehmood',
          rider_phone = '+92 301 2345678'
      WHERE delivery_address LIKE '%Noida%' OR delivery_address LIKE '%Delhi%' OR customer_phone LIKE '%+91%'
    `).run();

    db.prepare(`UPDATE coupons SET description = '20% off on your first order above Rs. 299' WHERE code = 'FIRSTBITE'`).run();
    db.prepare(`UPDATE coupons SET description = 'Flat Rs. 50 off on orders above Rs. 399' WHERE code = 'DESI50'`).run();
    db.prepare(`UPDATE coupons SET description = '15% off on royal biryani feasts' WHERE code = 'BIRYANI20'`).run();
    db.prepare(`UPDATE coupons SET description = 'Flat Rs. 100 off on party orders above Rs. 799' WHERE code = 'FEAST100'`).run();
  } catch (migErr) {
    console.error('Data migration notice:', migErr);
  }
}
