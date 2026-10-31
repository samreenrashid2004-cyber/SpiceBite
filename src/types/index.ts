export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order: number;
  item_count?: number;
}

export interface FoodItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price: number | null;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  is_veg: number; // 1 = veg, 0 = non-veg
  spice_level: 'Mild' | 'Medium' | 'Spicy' | 'Extra Spicy';
  image_url: string;
  is_available: number;
  is_bestseller: number;
  rating: number;
  rating_count: number;
  preparation_time_mins: number;
}

export interface CartItem {
  cart_item_id?: number;
  food_item_id: number;
  quantity: number;
  instructions?: string;
  name: string;
  slug?: string;
  price: number;
  discount_price: number | null;
  effective_price: number;
  image_url: string;
  is_veg: number;
  is_available: number;
  item_total: number;
}

export interface CartSummary {
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface Address {
  id: number;
  user_id: number;
  label: string;
  full_name: string;
  phone: string;
  street_address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: number;
  created_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  is_active: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  food_item_id: number;
  item_name: string;
  item_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  delivery_fee: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'COD' | 'ONLINE_CARD' | 'ONLINE_UPI';
  payment_status: 'PENDING' | 'PAID' | 'FAILED';
  order_status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  delivery_notes?: string;
  estimated_delivery_time?: string;
  rider_name?: string;
  rider_phone?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
  payment?: any;
}

export interface AdminMetrics {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalCustomers: number;
  totalMenuItems: number;
  outOfStockItems: number;
}

export interface DailySalesStat {
  date: string;
  dayName: string;
  displayDate: string;
  sales: number;
  orders: number;
  cancelled: number;
  avgOrderValue: number;
}

export interface HourlyStat {
  hour: number;
  label: string;
  orders: number;
  sales: number;
  isPeak: boolean;
  peakType?: 'lunch' | 'dinner' | null;
}

export interface CategoryStat {
  name: string;
  sales: number;
  itemsSold: number;
  percentage: number;
}

export interface PaymentStat {
  method: string;
  count: number;
  total: number;
}

export interface AdminStatistics {
  salesTrends: DailySalesStat[];
  hourlyTrends: HourlyStat[];
  categoryBreakdown: CategoryStat[];
  paymentDistribution: PaymentStat[];
  summary: {
    totalSales7d: number;
    totalOrders7d: number;
    avgDailySales: number;
    avgOrderValue: number;
    peakHour: string;
    peakHourOrders: number;
    bestDay: string;
    bestDaySales: number;
    growthVsLastWeek: number;
  };
}
