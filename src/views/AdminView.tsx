import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingBag, Users, Utensils, Tag, Plus, Edit2, Trash2,
  CheckCircle, AlertCircle, Clock, Truck, ChefHat, RefreshCw, X, Shield, Eye, MapPin,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminMetrics, AdminStatistics, Order, FoodItem, Category, Coupon } from '../types';
import { api } from '../services/api';
import { OrderStatisticsDashboard } from '../components/admin/OrderStatisticsDashboard';

interface AdminViewProps {
  onShowToast: (msg: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onShowToast }) => {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'statistics' | 'orders' | 'menu' | 'categories' | 'coupons' | 'customers'>('metrics');

  // Statistics
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Metrics
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Menu items
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingFood, setEditingFood] = useState<Partial<FoodItem> | null>(null);
  const [showFoodModal, setShowFoodModal] = useState(false);

  // Categories
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Customers
  const [customers, setCustomers] = useState<any[]>([]);

  const loadStatistics = async () => {
    setLoadingStats(true);
    try {
      const res = await api.getAdminStatistics();
      setStatistics(res);
    } catch (e) {
      console.error('Failed to load statistics:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const res = await api.getAdminMetrics();
      setMetrics(res.metrics);
      setRecentOrders(res.recentOrders || []);
      setTopItems(res.topItems || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await api.getAdminOrders({ status: orderFilter, search: orderSearch });
      setOrders(res.orders || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMenu = async () => {
    try {
      const [fRes, cRes] = await Promise.all([
        api.getFoodItems({ available: 'all' }),
        api.getCategories(),
      ]);
      setFoodItems(fRes.items || []);
      setCategories(cRes.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCoupons = async () => {
    try {
      const res = await api.getAdminCoupons();
      setCoupons(res.coupons || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await api.getAdminCustomers();
      setCustomers(res.customers || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadMetrics();
    loadStatistics();
    loadOrders();
    loadMenu();
    loadCoupons();
    loadCustomers();
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'statistics') {
      loadStatistics();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [orderFilter, orderSearch, activeTab]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl glass-card border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white font-display">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 mt-1">
          Please log in with admin credentials (admin@spicebite.pk / Admin@123) to access this dashboard.
        </p>
      </div>
    );
  }

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await api.updateAdminOrderStatus(orderId, { status: newStatus });
      onShowToast(res.message);
      loadOrders();
      loadMetrics();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(res.order);
      }
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update order status');
    }
  };

  const handleToggleAvailability = async (item: FoodItem) => {
    try {
      const newAvail = item.is_available ? 0 : 1;
      await api.updateAdminFoodItem(item.id, { is_available: newAvail });
      setFoodItems((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, is_available: newAvail } : f))
      );
      onShowToast(`${item.name} is now ${newAvail ? 'Available' : 'Unavailable'}`);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update item availability');
    }
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFood) return;

    try {
      if (editingFood.id) {
        await api.updateAdminFoodItem(editingFood.id, editingFood);
        onShowToast('Food item updated successfully.');
      } else {
        await api.createAdminFoodItem(editingFood);
        onShowToast('New food item added to menu.');
      }
      setShowFoodModal(false);
      setEditingFood(null);
      loadMenu();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save food item');
    }
  };

  const handleDeleteFood = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this food item?')) return;
    try {
      await api.deleteAdminFoodItem(id);
      onShowToast('Food item deleted.');
      loadMenu();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete food item');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.createAdminCategory({ name: newCatName.trim(), description: newCatDesc.trim() });
      setNewCatName('');
      setNewCatDesc('');
      onShowToast('Category created.');
      loadMenu();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to create category');
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    try {
      if (editingCoupon.id) {
        await api.updateAdminCoupon(editingCoupon.id, editingCoupon);
        onShowToast('Coupon updated.');
      } else {
        await api.createAdminCoupon(editingCoupon);
        onShowToast('Coupon created.');
      }
      setShowCouponModal(false);
      setEditingCoupon(null);
      loadCoupons();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save coupon');
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    try {
      await api.deleteAdminCoupon(id);
      onShowToast('Coupon deleted.');
      loadCoupons();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
            <Shield className="w-4 h-4 text-orange-400" />
            <span>Master Operations Console · Lahore, Pakistan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mt-1">
            SpiceBite Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              loadMetrics();
              loadStatistics();
              loadOrders();
              loadMenu();
              loadCoupons();
              onShowToast('Console & statistics refreshed.');
            }}
            className="px-4 py-2.5 glass-btn-secondary text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
            activeTab === 'metrics'
              ? 'glass-btn-primary border-white/20'
              : 'glass-btn-secondary text-slate-300 hover:text-white'
          }`}
        >
          Overview & Live Ops
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 border ${
            activeTab === 'statistics'
              ? 'glass-btn-primary border-white/20'
              : 'glass-btn-secondary text-slate-300 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-orange-400" />
          <span>Order Statistics (7-Days)</span>
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono font-black">
            Recharts
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 border ${
            activeTab === 'orders'
              ? 'glass-btn-primary border-white/20'
              : 'glass-btn-secondary text-slate-300 hover:text-white'
          }`}
        >
          <span>Orders ({orders.length})</span>
          {metrics && metrics.pendingOrders > 0 && (
            <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {metrics.pendingOrders}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
            activeTab === 'menu'
              ? 'glass-btn-primary border-white/20'
              : 'glass-btn-secondary text-slate-300 hover:text-white'
          }`}
        >
          Menu Management ({foodItems.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
            activeTab === 'categories'
              ? 'glass-btn-primary border-white/20'
              : 'glass-btn-secondary text-slate-300 hover:text-white'
          }`}
        >
          Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
            activeTab === 'coupons'
              ? 'glass-btn-primary border-white/20'
              : 'glass-btn-secondary text-slate-300 hover:text-white'
          }`}
        >
          Discount Coupons ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
            activeTab === 'customers'
              ? 'glass-btn-primary border-white/20'
              : 'glass-btn-secondary text-slate-300 hover:text-white'
          }`}
        >
          Customers ({customers.length})
        </button>
      </div>

      {/* TAB 1: METRICS (PKR / Rs.) */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Revenue
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1 tabular-nums">
                Rs. {metrics.totalSales.toLocaleString('en-PK')}
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                Pakistani Rupees (PKR)
              </span>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Orders
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1 tabular-nums">
                {metrics.totalOrders}
              </div>
              <span className="text-[11px] text-orange-400 font-semibold mt-1 block">
                {metrics.pendingOrders} active in kitchen/delivery
              </span>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Customers in Lahore
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1 tabular-nums">
                {metrics.totalCustomers}
              </div>
              <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
                Verified accounts
              </span>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Food Menu Items
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1 tabular-nums">
                {metrics.totalMenuItems}
              </div>
              <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
                {metrics.outOfStockItems} out of stock
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recent Kitchen Dispatches
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer"
                >
                  View All Orders
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.04] text-slate-400 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-3 rounded-l-xl">Order #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Amount (Rs.)</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 rounded-r-xl text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {recentOrders.map((ro) => (
                      <tr key={ro.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-mono font-bold text-white">#{ro.order_number}</td>
                        <td className="p-3 font-medium text-slate-200">{ro.customer_name}</td>
                        <td className="p-3 font-bold font-mono text-white">Rs. {ro.total_amount}</td>
                        <td className="p-3 text-slate-400 font-semibold">
                          {ro.payment_method} ({ro.payment_status})
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                              ro.order_status === 'DELIVERED'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : ro.order_status === 'CANCELLED'
                                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                : 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                            }`}
                          >
                            {ro.order_status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(ro);
                              setActiveTab('orders');
                            }}
                            className="text-orange-400 font-bold hover:underline cursor-pointer"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Items */}
            <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Top Selling Fast Foods
              </h3>
              <div className="space-y-3">
                {topItems.map((ti, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 glass-card rounded-2xl border border-white/[0.06]">
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{ti.item_name}</h4>
                      <span className="text-[11px] text-slate-400">{ti.sold_count} portions ordered</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-orange-400">
                      Rs. {ti.revenue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Integrated Order Statistics Dashboard in Overview */}
          <div className="pt-4">
            <OrderStatisticsDashboard
              stats={statistics}
              loading={loadingStats}
              onRefresh={loadStatistics}
            />
          </div>
        </div>
      )}

      {/* TAB: DEDICATED ORDER STATISTICS (RECHARTS) */}
      {activeTab === 'statistics' && (
        <OrderStatisticsDashboard
          stats={statistics}
          loading={loadingStats}
          onRefresh={loadStatistics}
        />
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 glass-panel rounded-3xl border border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['all', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors border ${
                    orderFilter === st
                      ? 'glass-btn-primary border-white/20'
                      : 'glass-btn-secondary text-slate-300'
                  }`}
                >
                  {st === 'all' ? 'All Orders' : st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search order # or customer..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full px-3.5 py-2 text-xs glass-input rounded-xl"
              />
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] text-slate-400 font-semibold uppercase text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer & Phone</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Total (PKR)</th>
                    <th className="p-3.5">Status Update</th>
                    <th className="p-3.5 text-right">Rider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-mono font-bold text-white">
                        #{o.order_number}
                        <div className="text-[10px] text-slate-500 font-sans font-normal">
                          {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{o.customer_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{o.customer_phone}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">{o.delivery_address}</div>
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-300 max-w-xs">
                        {o.items?.map((it) => `${it.quantity}x ${it.item_name}`).join(', ')}
                      </td>
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-white">Rs. {o.total_amount}</div>
                        <span className="text-[10px] text-slate-400 block uppercase">
                          {o.payment_method} ({o.payment_status})
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={o.order_status}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          className="px-2.5 py-1 text-xs font-bold rounded-xl border border-white/10 glass-input bg-slate-900 cursor-pointer"
                        >
                          <option value="CONFIRMED" className="bg-slate-900">CONFIRMED</option>
                          <option value="PREPARING" className="bg-slate-900">PREPARING</option>
                          <option value="OUT_FOR_DELIVERY" className="bg-slate-900">OUT FOR DELIVERY</option>
                          <option value="DELIVERED" className="bg-slate-900">DELIVERED</option>
                          <option value="CANCELLED" className="bg-slate-900">CANCELLED</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right font-mono text-[11px] text-slate-300">
                        {o.rider_name || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MENU CRUD */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Food Menu Inventory ({foodItems.length})</h3>
            <button
              onClick={() => {
                setEditingFood({
                  name: '',
                  description: '',
                  price: 199,
                  discount_price: null,
                  category_id: categories[0]?.id || 1,
                  is_veg: 1,
                  spice_level: 'Medium',
                  is_available: 1,
                  is_bestseller: 0,
                  preparation_time_mins: 15,
                  image_url: '/src/assets/images/tandoori_zinger_burger_1793432674563.jpg',
                });
                setShowFoodModal(true);
              }}
              className="px-4 py-2 glass-btn-primary rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Food Item</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] text-slate-400 font-semibold uppercase text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Diet & Spice</th>
                    <th className="p-3.5">Price (PKR)</th>
                    <th className="p-3.5">Stock Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {foodItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-900 border border-white/10 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 max-w-xs">{item.description}</div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-300">{item.category_name}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            item.is_veg
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-red-500/20 text-red-400 border-red-500/40'
                          }`}
                        >
                          {item.is_veg ? 'VEG' : 'NON-VEG'}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1.5">{item.spice_level}</span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white">
                        Rs. {item.discount_price || item.price}
                        {item.discount_price && (
                          <span className="text-[10px] text-slate-500 line-through ml-1 font-normal font-mono">
                            Rs. {item.price}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors border ${
                            item.is_available
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                          }`}
                        >
                          {item.is_available ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingFood(item);
                            setShowFoodModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white glass-btn-secondary rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFood(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 glass-btn-secondary rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Add New Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tandoori Platters"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs glass-input rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <input
                  type="text"
                  placeholder="Fresh clay-oven baked specialties"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs glass-input rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 glass-btn-primary rounded-xl font-bold text-xs cursor-pointer shadow-lg"
              >
                Create Category
              </button>
            </form>
          </div>

          <div className="md:col-span-8 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Active Indian Categories ({categories.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {categories.map((c) => (
                <div key={c.id} className="p-4 glass-card rounded-2xl border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{c.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{c.description}</p>
                  </div>
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full font-mono">
                    {c.item_count || 0} items
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Promo Discount Coupons ({coupons.length})</h3>
            <button
              onClick={() => {
                setEditingCoupon({
                  code: '',
                  description: '',
                  discount_type: 'percentage',
                  discount_value: 20,
                  min_order_amount: 299,
                  max_discount: 100,
                  is_active: 1,
                });
                setShowCouponModal(true);
              }}
              className="px-4 py-2 glass-btn-primary rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coupons.map((cp) => (
              <div key={cp.id} className="glass-panel p-5 rounded-3xl border border-white/10 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono font-black text-sm tracking-wider">
                      {cp.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        cp.is_active
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-white/10 text-slate-400 border-white/10'
                      }`}
                    >
                      {cp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1">{cp.description}</p>
                  <div className="mt-3 text-xs font-bold text-white font-mono">
                    {cp.discount_type === 'percentage' ? `${cp.discount_value}% OFF` : `Flat Rs. ${cp.discount_value} OFF`}
                    <span className="text-slate-400 font-normal ml-1">
                      (Min order Rs. {cp.min_order_amount})
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingCoupon(cp);
                      setShowCouponModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white glass-btn-secondary rounded-lg cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(cp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 glass-btn-secondary rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-base font-bold text-white">Registered Lahore Customer Database ({customers.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-slate-400 font-semibold uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Mobile Phone (PK)</th>
                  <th className="p-3.5">Total Orders</th>
                  <th className="p-3.5 text-right">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 font-bold text-white">{c.name}</td>
                    <td className="p-3.5 text-slate-300">{c.email}</td>
                    <td className="p-3.5 font-mono text-slate-400">{c.phone || 'N/A'}</td>
                    <td className="p-3.5 font-mono font-semibold text-white">{c.order_count}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-orange-400">
                      Rs. {c.total_spent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Food Item Modal */}
      {showFoodModal && editingFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-white/15">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingFood.id ? 'Edit Food Item' : 'Add New Indian Fast Food Item'}
              </h3>
              <button onClick={() => setShowFoodModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dish Name</label>
                  <input
                    type="text"
                    required
                    value={editingFood.name || ''}
                    onChange={(e) => setEditingFood({ ...editingFood, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs glass-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={editingFood.category_id || 1}
                    onChange={(e) => setEditingFood({ ...editingFood, category_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs glass-input bg-slate-900 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingFood.description || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs glass-input rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (PKR Rs.)</label>
                  <input
                    type="number"
                    required
                    value={editingFood.price || ''}
                    onChange={(e) => setEditingFood({ ...editingFood, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs glass-input rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Price (Rs.)</label>
                  <input
                    type="number"
                    value={editingFood.discount_price || ''}
                    onChange={(e) => setEditingFood({ ...editingFood, discount_price: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 text-xs glass-input rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={editingFood.preparation_time_mins || 15}
                    onChange={(e) => setEditingFood({ ...editingFood, preparation_time_mins: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs glass-input rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Diet</label>
                  <select
                    value={editingFood.is_veg !== undefined ? editingFood.is_veg : 1}
                    onChange={(e) => setEditingFood({ ...editingFood, is_veg: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs glass-input bg-slate-900 rounded-xl"
                  >
                    <option value={1} className="bg-slate-900">Pure Veg</option>
                    <option value={0} className="bg-slate-900">Non-Veg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Spice Level</label>
                  <select
                    value={editingFood.spice_level || 'Medium'}
                    onChange={(e) => setEditingFood({ ...editingFood, spice_level: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs glass-input bg-slate-900 rounded-xl"
                  >
                    <option value="Mild" className="bg-slate-900">Mild</option>
                    <option value="Medium" className="bg-slate-900">Medium</option>
                    <option value="Spicy" className="bg-slate-900">Spicy</option>
                    <option value="Extra Spicy" className="bg-slate-900">Extra Spicy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bestseller</label>
                  <select
                    value={editingFood.is_bestseller || 0}
                    onChange={(e) => setEditingFood({ ...editingFood, is_bestseller: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs glass-input bg-slate-900 rounded-xl"
                  >
                    <option value={0} className="bg-slate-900">No</option>
                    <option value={1} className="bg-slate-900">Yes (Featured)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingFood.image_url || ''}
                  onChange={(e) => setEditingFood({ ...editingFood, image_url: e.target.value })}
                  className="w-full px-3 py-2 text-xs glass-input rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowFoodModal(false)}
                  className="px-4 py-2 glass-btn-secondary rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 glass-btn-primary rounded-xl text-xs font-bold"
                >
                  Save Food Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 space-y-4 border border-white/15">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingCoupon.id ? 'Edit Coupon' : 'Create Promotional Coupon'}
              </h3>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAHORE30"
                  value={editingCoupon.code || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs glass-input rounded-xl uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="30% off on all Lahore fast food orders"
                  value={editingCoupon.description || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs glass-input rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.discount_type || 'percentage'}
                    onChange={(e: any) => setEditingCoupon({ ...editingCoupon, discount_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs glass-input bg-slate-900 rounded-xl"
                  >
                    <option value="percentage" className="bg-slate-900">Percentage (%)</option>
                    <option value="fixed" className="bg-slate-900">Fixed Amount (Rs.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={editingCoupon.discount_value || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs glass-input rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Spend (Rs.)</label>
                  <input
                    type="number"
                    value={editingCoupon.min_order_amount || 0}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, min_order_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs glass-input rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Cap (Rs.)</label>
                  <input
                    type="number"
                    value={editingCoupon.max_discount || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, max_discount: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 text-xs glass-input rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 glass-btn-secondary rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 glass-btn-primary rounded-xl text-xs font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
