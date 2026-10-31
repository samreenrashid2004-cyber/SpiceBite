import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, Truck, ChefHat, Phone, MapPin, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  onExploreMenu: () => void;
  onShowToast: (msg: string) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber,
  onExploreMenu,
  onShowToast,
}) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber || 'SB-84920');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const fetchOrder = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.trackOrder(num.trim());
      setOrder(res.order);
    } catch (err: any) {
      setOrder(null);
      setError(err.message || 'Order not found. Please verify your order number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrder(orderNumber);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  const handleAdvanceStatus = async () => {
    if (!order) return;
    setAdvancing(true);

    const stages: Order['order_status'][] = ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = stages.indexOf(order.order_status);
    const nextStatus = stages[Math.min(stages.length - 1, currentIndex + 1)];

    setTimeout(() => {
      setOrder({
        ...order,
        order_status: nextStatus,
        payment_status: nextStatus === 'DELIVERED' ? 'PAID' : order.payment_status,
      });
      onShowToast(`Milestone updated to: ${nextStatus.replace(/_/g, ' ')}`);
      setAdvancing(false);
    }, 400);
  };

  const getStepStatus = (stepKey: string) => {
    if (!order) return 'upcoming';
    const statusOrder = ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIdx = statusOrder.indexOf(order.order_status);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Search */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Real-Time Kitchen & Dispatch
          </span>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1">
            Track Your Food Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enter your SpiceBite Order ID to watch your hot Indian feast move from our Lahore kitchen to your doorstep.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2.5 max-w-md pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="e.g. SB-84920"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-3 py-3 text-xs glass-input rounded-2xl font-mono font-bold uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 glass-btn-primary rounded-2xl text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Locating...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Card */}
      {order && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg font-black font-mono text-white">
                    Order #{order.order_number}
                  </span>
                  <span
                    className={`text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider border ${
                      order.order_status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : order.order_status === 'CANCELLED'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse'
                    }`}
                  >
                    {order.order_status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Placed: {new Date(order.created_at).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })} (PKT)
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => fetchOrder(order.order_number)}
                  className="px-3.5 py-2 text-xs font-bold glass-btn-secondary rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={handleAdvanceStatus}
                  disabled={advancing || order.order_status === 'DELIVERED'}
                  className="px-3.5 py-2 text-xs font-bold bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-xl cursor-pointer disabled:opacity-40"
                  title="Advance stage for demo testing"
                >
                  <span>{advancing ? 'Updating...' : 'Advance Stage (Test)'}</span>
                </button>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              {/* Step 1: Confirmed */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl glass-card">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    getStepStatus('CONFIRMED') !== 'upcoming'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-white/[0.05] text-slate-500'
                  }`}
                >
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-white mt-3">Order Confirmed</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Kitchen accepted</p>
              </div>

              {/* Step 2: Preparing */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl glass-card">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    getStepStatus('PREPARING') === 'current'
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/40 animate-bounce'
                      : getStepStatus('PREPARING') === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/[0.05] text-slate-500'
                  }`}
                >
                  <ChefHat className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-white mt-3">Tandoor Cooking</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Freshly prepared</p>
              </div>

              {/* Step 3: Out for Delivery */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl glass-card">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    getStepStatus('OUT_FOR_DELIVERY') === 'current'
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/40 animate-bounce'
                      : getStepStatus('OUT_FOR_DELIVERY') === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/[0.05] text-slate-500'
                  }`}
                >
                  <Truck className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-white mt-3">Out for Delivery</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">En route in Lahore</p>
              </div>

              {/* Step 4: Delivered */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl glass-card">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    getStepStatus('DELIVERED') === 'completed' || getStepStatus('DELIVERED') === 'current'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-white/[0.05] text-slate-500'
                  }`}
                >
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-white mt-3">Delivered</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Enjoy your feast!</p>
              </div>
            </div>

            {/* Rider Info Card (Pakistan Rider) */}
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-base shadow-md">
                  {(order.rider_name || 'Tariq').charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    Assigned Lahore Rider
                  </span>
                  <h4 className="text-sm font-bold text-white">{order.rider_name || 'Tariq Mehmood'}</h4>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 font-mono mt-0.5">
                    <Phone className="w-3 h-3 text-orange-400" />
                    <span>{order.rider_phone || '+92 301 2345678'}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Arrival</span>
                <span className="text-sm font-extrabold text-amber-300 font-mono">
                  {order.estimated_delivery_time || '20-30 mins'}
                </span>
              </div>
            </div>
          </div>

          {/* Details & Receipt */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-400" />
                Delivery Address (Lahore)
              </h3>
              <p className="text-sm font-bold text-white">{order.customer_name}</p>
              <p className="text-xs text-slate-300 font-mono">{order.customer_phone}</p>
              <p className="text-xs text-slate-300 bg-white/[0.04] p-3 rounded-2xl border border-white/10 leading-relaxed">
                {order.delivery_address}
              </p>
              {order.delivery_notes && (
                <p className="text-[11px] text-slate-400 italic">
                  Note: "{order.delivery_notes}"
                </p>
              )}
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-orange-400" />
                Receipt in PKR (Rs.)
              </h3>

              <div className="space-y-2 divide-y divide-white/[0.06] max-h-48 overflow-y-auto pr-1">
                {order.items?.map((it) => (
                  <div key={it.id} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                    <span className="text-slate-300">
                      {it.quantity}x {it.item_name}
                    </span>
                    <span className="font-bold text-white font-mono">
                      Rs. {it.total_price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">Rs. {order.subtotal}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold font-mono">
                    <span>Discount ({order.coupon_code || 'Promo'})</span>
                    <span>-Rs. {order.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-mono">
                    {order.delivery_fee === 0 ? 'FREE' : `Rs. ${order.delivery_fee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (5%)</span>
                  <span className="font-mono">Rs. {order.tax_amount}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-black text-white">
                  <span>Grand Total</span>
                  <span className="text-orange-400 font-mono">Rs. {order.total_amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
