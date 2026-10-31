# MasalaMunch (SpiceBite) – Indian Fast Food Ordering Platform

A modern, full-stack Indian fast-food ordering web application built with **React 19, TypeScript, Tailwind CSS v4, Node.js, Express.js, and SQLite**.

---

## 🌟 Key Features

### 1. Modern Food Ordering Frontend
- **Hero & Story**: High-energy Indian fast-food presentation with crispy tandoori zinger burgers, handi dum biryani, and street momos.
- **Dynamic Food Menu**: Real-time category filtering (12 categories: Burgers, Pizza, Zinger Burgers, Sandwiches, Fries, Biryani, Shawarma, Rolls, Momos, Indian Street Food, Cold Drinks, Desserts).
- **Dietary & Spice Filters**: Pure Veg / Non-Veg toggles, spice level indicators (Mild, Medium, Spicy), and price sorting.
- **Shopping Cart**: Real-time quantity steppers, server-validated promotional coupons, free delivery progress meter, and tax calculations.
- **Checkout & Sandbox Payments**:
  - Customer contact details & multi-address picker
  - Cash on Delivery (COD)
  - Test Sandbox UPI (GPay, PhonePe, Paytm simulation)
  - Test Sandbox Credit/Debit Cards
  - Unique order ID generation (`MM-XXXXX`)
- **Live Order Tracking**: Visual 4-stage kitchen progress timeline (Confirmed -> Preparing in Kitchen -> Out for Delivery with Rider info -> Delivered). Includes an "Advance Stage" simulation button for testing.
- **Customer Account**: Profile editing, saved delivery addresses with default selector, and complete order history.

### 2. Admin Operations Dashboard
- **Real-Time Metrics**: Total revenue in ₹, total orders, active kitchen orders, registered customers, and menu inventory count.
- **Order Management**: Search by order ID or customer name, filter by status, change order status (`CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`), and assign delivery riders.
- **Food Menu CRUD**: Add new items, edit names, descriptions, prices, discounts, category associations, and toggle real-time stock availability.
- **Category Management**: Create and organize menu categories with custom descriptions.
- **Coupon Engine**: Create, update, or disable promotional discount codes (Percentage or Flat ₹ discount with min spend limits).
- **Customer Directory**: Track registered customer accounts and lifetime spend.

### 3. Backend & SQLite Database
- SQLite database (`fastfood.db`) with WAL mode and foreign key constraints.
- 10 Relational Tables: `users`, `admins`, `food_items`, `categories`, `cart_items`, `addresses`, `coupons`, `orders`, `order_items`, `payments`.
- Password hashing with `bcryptjs`.
- Session authorization with JWT tokens.
- **Server-Side Price Integrity**: All subtotals, coupon discounts, delivery fees, and taxes are strictly calculated and validated on the server.

---

## 🔑 Test Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator** | `admin@masalamunch.com` | `Admin@123` | Full Admin Operations Console |
| **Customer** | `rahul@example.com` | `Customer@123` | Ordering, Profile, Past Orders |

*Note: The sign-in modal also includes "One-Click Quick Test Sign-in" buttons for instant login.*

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Full-Stack Server**:
   ```bash
   npm run dev
   ```
   The Express backend will initialize SQLite, seed initial categories and dishes, and serve the Vite frontend at `http://localhost:3000`.

3. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 📡 API Endpoints

- `POST /api/auth/register` - Create new customer account
- `POST /api/auth/login` - Authenticate and return JWT token
- `GET /api/auth/me` - Get profile and statistics
- `GET /api/categories` - List categories with item counts
- `GET /api/food-items` - Query menu items (search, category, veg, sort)
- `GET /api/featured` - Bestsellers and special deals
- `GET /api/cart` - User's current cart and totals
- `POST /api/cart` - Add or update cart item
- `POST /api/coupons/apply` - Validate coupon and calculate discount
- `POST /api/orders` - Place new order with server validation
- `GET /api/orders/:orderNumber` - Public live order tracking
- `GET /api/admin/metrics` - Admin overview statistics (Admin only)
- `GET /api/admin/orders` - Full orders list (Admin only)
- `PUT /api/admin/orders/:id/status` - Update order stage (Admin only)
- `POST /api/admin/food-items` - Add food item (Admin only)
