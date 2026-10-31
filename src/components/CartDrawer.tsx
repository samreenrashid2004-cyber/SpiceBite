import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreMenu: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout, onExploreMenu }) => {
  const {
    items,
    summary,
    couponCode,
    couponDiscount,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setApplying(true);
    setCouponStatus(null);
    const res = await applyCoupon(inputCoupon.trim());
    setApplying(false);

    if (res.success) {
      setCouponStatus({ message: res.message, isError: false });
      setInputCoupon('');
    } else {
      setCouponStatus({ message: res.message, isError: true });
    }
  };

  const amountNeededForFreeDelivery = Math.max(0, summary.freeDeliveryThreshold - summary.subtotal);
  const freeDeliveryPercent = Math.min(100, Math.round((summary.subtotal / summary.freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Glass Drawer */}
      <div className="relative w-full max-w-md bg-slate-950/90 backdrop-blur-2xl border-l border-white/10 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">Your Desi Feast Bag</h2>
              <p className="text-[11px] text-slate-400">Lahore Express Fast Food Delivery</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white glass-btn-secondary transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar (PKR / Rs.) */}
        {summary.subtotal > 0 && (
          <div className="px-5 py-3 bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-b border-white/10">
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>
                {amountNeededForFreeDelivery === 0 ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 inline text-emerald-400" />
                    Unlocked FREE Delivery in Lahore!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-orange-400 font-mono">Rs. {amountNeededForFreeDelivery.toFixed(0)}</strong> more for FREE Delivery!
                  </span>
                )}
              </span>
              <span className="tabular-nums font-mono text-[11px] text-slate-400">{freeDeliveryPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${freeDeliveryPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-orange-400 mb-4 shadow-xl">
                <ShoppingBag className="w-10 h-10 opacity-70" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Your bag is empty</h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                Order sizzling zinger burgers, royal dum biryanis, momos, or kathi rolls crafted with authentic Indian street spices.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onExploreMenu();
                }}
                className="mt-6 px-6 py-3 glass-btn-primary rounded-xl text-xs font-bold cursor-pointer"
              >
                Browse Indian Menu
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.food_item_id}
                className="flex items-center gap-3 p-3.5 glass-card rounded-2xl border border-white/[0.06] hover:border-orange-500/30 transition-all"
              >
                {/* Thumbnail */}
                <img
                  src={item.image_url}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-900 border border-white/10"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-3 h-3 border flex items-center justify-center rounded-xs shrink-0 ${
                        item.is_veg ? 'border-emerald-500' : 'border-red-500'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.is_veg ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                  </div>

                  <p className="text-xs font-black text-orange-400 mt-1 tabular-nums font-mono">
                    Rs. {item.effective_price}
                  </p>
                </div>

                {/* Stepper */}
                <div className="flex items-center bg-white/[0.06] border border-white/10 rounded-xl overflow-hidden shadow-inner">
                  <button
                    onClick={() => updateQuantity(item.food_item_id, item.quantity - 1)}
                    className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 text-xs font-bold tabular-nums min-w-[20px] text-center font-mono text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.food_item_id, item.quantity + 1)}
                    className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.food_item_id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl space-y-4">
            {/* Coupon Code Box */}
            <div>
              {couponCode ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-emerald-300 font-mono">{couponCode} applied</span>
                      <p className="text-[11px] text-emerald-400 font-mono">Saved Rs. {couponDiscount}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. FIRSTBITE, DESI50)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                    className="flex-1 px-3.5 py-2.5 text-xs glass-input rounded-xl uppercase placeholder:normal-case font-mono"
                  />
                  <button
                    type="submit"
                    disabled={applying || !inputCoupon.trim()}
                    className="px-4 py-2.5 glass-btn-secondary hover:border-orange-500/50 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    {applying ? 'Checking...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponStatus && (
                <div
                  className={`mt-2 text-[11px] flex items-center gap-1.5 font-medium ${
                    couponStatus.isError ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {couponStatus.isError ? (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{couponStatus.message}</span>
                </div>
              )}
            </div>

            {/* Bill Details */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="font-semibold text-white tabular-nums font-mono">Rs. {summary.subtotal.toFixed(0)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold font-mono">
                  <span>Discount ({couponCode})</span>
                  <span className="tabular-nums">-Rs. {couponDiscount.toFixed(0)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charges (Lahore)</span>
                <span className="font-semibold text-white tabular-nums font-mono">
                  {summary.deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">FREE</span>
                  ) : (
                    `Rs. ${summary.deliveryFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Taxes & Service (5%)</span>
                <span className="font-semibold text-white tabular-nums font-mono">Rs. {summary.tax.toFixed(0)}</span>
              </div>

              <div className="pt-2.5 border-t border-white/10 flex justify-between text-base font-black text-white">
                <span>Grand Total</span>
                <span className="text-orange-400 font-mono tabular-nums">Rs. {summary.total.toFixed(0)}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 glass-btn-primary text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/30"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
