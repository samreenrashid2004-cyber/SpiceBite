import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Register new user
router.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // Check if email already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES (?, ?, ?, ?, 'customer')
    `).run(name.trim(), cleanEmail, passwordHash, phone ? phone.trim() : null);

    const user = {
      id: Number(result.lastInsertRowid),
      name: name.trim(),
      email: cleanEmail,
      role: 'customer',
      phone: phone ? phone.trim() : undefined,
    };

    const token = generateToken(user);
    res.status(201).json({
      message: 'Account created successfully!',
      user,
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error while registering user.' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // If admin, update last_login
  if (user.role === 'admin') {
    db.prepare('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?').run(user.id);
  }

  const authUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || undefined,
  };

  const token = generateToken(authUser);
  res.json({
    message: 'Welcome back!',
    user: authUser,
    token,
  });
});

// Current user profile
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  
  const addressCount = (db.prepare('SELECT count(*) as count FROM addresses WHERE user_id = ?').get(user.id) as any).count;
  const orderCount = (db.prepare('SELECT count(*) as count FROM orders WHERE user_id = ?').get(user.id) as any).count;

  res.json({
    user,
    stats: {
      addressCount,
      orderCount,
    },
  });
});

// Update profile
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const { name, phone } = req.body;
  const userId = req.user!.id;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name cannot be empty.' });
  }

  try {
    db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(
      name.trim(),
      phone ? phone.trim() : null,
      userId
    );

    const updated = db.prepare('SELECT id, name, email, role, phone FROM users WHERE id = ?').get(userId);
    res.json({
      message: 'Profile updated successfully!',
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
