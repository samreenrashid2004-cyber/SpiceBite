import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, CreditCard, Banknote, Smartphone, CheckCircle, ArrowRight, AlertCircle, Plus, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Address } from '../types';
import { api } from '../services/api';

interface CheckoutViewProps {
  onOrderSuccess: (orderNumber: string) => void;
  onNavigateToMenu: () => void;
  onOpenAuth: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onOrderSuccess, onNavigateToMenu, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const { items, summary, couponCode, clearCart } = useCart();

  // Contact Info (Pakistan defaults)
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+92 300 1234567');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'customer@spicebite.pk');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Address (Lahore, Pakistan)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');
  const [streetAddress, setStreetAddress] = useState('House 14-B, Sector Z, Phase 3, DHA');
  const [landmark, setLandmark] = useState('Near Y-Block Market / Packages Mall');
  const [city, setCity] = useState('Lahore');
  const [state, setState] = useState('Punjab, Pakistan');
  const [pincode, setPincode] = useState('54000');

  // Payment method (Pakistani options)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE_CARD' | 'ONLINE_UPI'>('ONLINE_UPI');
  // Sandbox test details
  const [walletType, setWalletType] = useState<'JazzCash' | 'EasyPaisa'>('JazzCash');
  const [walletPhone, setWalletPhone] = useState('+92 300 1234567');
  const [cardNumber, setCardNumber] = useState('4242 8888 2345 6789');
  const [cardCvv, setCardCvv] = useState('888');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.email) setCustomerEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    async function loadAddresses() {
      if (!isAuthenticated) return;
      try {
        const res = await api.getAddresses();
        const list = res.addresses || [];
        setSavedAddresses(list);
        const defaultAddr = list.find((a) => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (list.length > 0) {
          setSelectedAddressId(list[0].id);
        }
      } catch (e) {
        console.error('Failed to load addresses:', e);
      }
    }
    loadAddresses();
  }, [isAuthenticated]);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl glass-card flex items-center justify-center text-orange-400 mx-auto mb-4 border border-white/10">
          <CheckCircle className="w-8 h-8 opacity-60" />
        </div>
        <h2 className="text-xl font-bold text-white font-display">No items in your feast bag</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Add some delicious Indian fast food to your bag before checking out.
        </p>
        <button
          onClick={onNavigateToMenu}
          className="px-6 py-3 glass-btn-primary rounded-xl font-bold text-xs cursor-pointer"
        >
          Explore Indian Menu
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let finalAddress = '';
      if (selectedAddressId !== 'new' && typeof selectedAddressId === 'number') {
        const addr = savedAddresses.find((a) => a.id === selectedAddressId);
        if (addr) {
          finalAddress = `${addr.street_address}, ${addr.landmark ? addr.landmark + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}`;
        }
      }

      if (!finalAddress) {
        if (!streetAddress || !city || !pincode) {
          throw new Error('Please fill out street address, city, and postal code.');
        }
        finalAddress = `${streetAddress}, ${landmark ? landmark + ', ' : ''}${city}, ${state} - ${pincode}`;
      }

      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        deliveryAddress: finalAddress,
        deliveryNotes: deliveryNotes.trim() || undefined,
        items: items.map((i) => ({ food_item_id: i.food_item_id, quantity: i.quantity })),
        couponCode: couponCode || undefined,
        paymentMethod,
        onlinePaymentDetails:
          paymentMethod !== 'COD'
            ? {
                mode: paymentMethod === 'ONLINE_UPI' ? walletType : 'Card',
                transactionId: `PK_TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                details: paymentMethod === 'ONLINE_UPI' ? `${walletType} (${walletPhone})` : `Card ending ${cardNumber.slice(-4)}`,
              }
            : undefined,
      };

      const res = await api.createOrder(orderPayload);
      await clearCart();
      onOrderSuccess(res.order.order_number);
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wide mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>LAHORE, PAKISTAN DELIVERY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
          Review & Confirm Your Order
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Delivered hot and fresh across Lahore. All transactions processed in Pakistani Rupees (Rs.).
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-start gap-3 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Contact, Address, Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Contact Information */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-xl bg-orange-600 text-white flex items-center justify-center text-xs font-black">
                  1
                </span>
                Customer Contact
              </h2>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer"
                >
                  Sign in to autofill
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Hamza Khan"
                  className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Phone (Pakistan)</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@spicebite.pk"
                className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl"
              />
            </div>
          </div>

          {/* Section 2: Delivery Address (Lahore) */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-xl bg-orange-600 text-white flex items-center justify-center text-xs font-black">
                2
              </span>
              Lahore Delivery Address
            </h2>

            {/* If saved addresses exist */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2 mb-3">
                <span className="text-xs font-semibold text-slate-400">Select Saved Address:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-orange-500 bg-orange-500/10 shadow-lg'
                          : 'border-white/10 hover:border-white/20 glass-card'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{addr.label}</span>
                        {addr.is_default === 1 && (
                          <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-md font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {addr.street_address}, {addr.city} - {addr.pincode}
                      </p>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSelectedAddressId('new')}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
                      selectedAddressId === 'new'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                        : 'border-dashed border-white/20 text-slate-400 hover:text-white glass-card'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enter New Address</span>
                  </button>
                </div>
              </div>
            )}

            {/* Address Form */}
            {selectedAddressId === 'new' && (
              <div className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    House/Plaza No., Street & Area in Lahore
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. House 14-B, Sector Z, Phase 3, DHA"
                    className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Near Packages Mall / Y Block"
                      className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Lahore"
                      className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="54000"
                      className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Instructions for Delivery Rider (optional)
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Call upon reaching gate, ring bell twice, deliver to 2nd floor"
                className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl"
              />
            </div>
          </div>

          {/* Section 3: Payment Method (Pakistani Payment Options) */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-xl bg-orange-600 text-white flex items-center justify-center text-xs font-black">
                3
              </span>
              Payment Method (Pakistan)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* JazzCash / EasyPaisa */}
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE_UPI')}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'ONLINE_UPI'
                    ? 'border-orange-500 bg-orange-500/10 shadow-lg'
                    : 'border-white/10 hover:border-white/20 glass-card'
                }`}
              >
                <Smartphone className={`w-5 h-5 mb-2.5 ${paymentMethod === 'ONLINE_UPI' ? 'text-orange-400' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-white block">JazzCash / EasyPaisa</span>
                  <span className="text-[10px] text-slate-400">Instant Sandbox Mobile Pay</span>
                </div>
              </button>

              {/* Debit/Credit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE_CARD')}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'ONLINE_CARD'
                    ? 'border-orange-500 bg-orange-500/10 shadow-lg'
                    : 'border-white/10 hover:border-white/20 glass-card'
                }`}
              >
                <CreditCard className={`w-5 h-5 mb-2.5 ${paymentMethod === 'ONLINE_CARD' ? 'text-orange-400' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-white block">Card (Sandbox)</span>
                  <span className="text-[10px] text-slate-400">Visa / Mastercard / PayPak</span>
                </div>
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'COD'
                    ? 'border-orange-500 bg-orange-500/10 shadow-lg'
                    : 'border-white/10 hover:border-white/20 glass-card'
                }`}
              >
                <Banknote className={`w-5 h-5 mb-2.5 ${paymentMethod === 'COD' ? 'text-orange-400' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-white block">Cash on Delivery</span>
                  <span className="text-[10px] text-slate-400">Pay cash at your doorstep</span>
                </div>
              </button>
            </div>

            {/* Sandbox details */}
            {paymentMethod === 'ONLINE_UPI' && (
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-orange-300">Select Mobile Wallet:</span>
                  <button
                    type="button"
                    onClick={() => setWalletType('JazzCash')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      walletType === 'JazzCash' ? 'bg-orange-500 text-white' : 'glass-btn-secondary text-slate-300'
                    }`}
                  >
                    JazzCash
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletType('EasyPaisa')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      walletType === 'EasyPaisa' ? 'bg-emerald-600 text-white' : 'glass-btn-secondary text-slate-300'
                    }`}
                  >
                    EasyPaisa
                  </button>
                </div>
                <input
                  type="text"
                  value={walletPhone}
                  onChange={(e) => setWalletPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 text-xs glass-input rounded-xl font-mono"
                />
              </div>
            )}

            {paymentMethod === 'ONLINE_CARD' && (
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-2.5 text-xs">
                <span className="font-bold text-orange-300">Test Sandbox Card Details:</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="col-span-2 px-3 py-2 text-xs glass-input rounded-xl font-mono"
                  />
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="px-3 py-2 text-xs glass-input rounded-xl font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary (PKR / Rs.) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 sticky top-24 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Feast Bag Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            {/* Items List */}
            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 divide-y divide-white/[0.06]">
              {items.map((it) => (
                <div key={it.food_item_id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-orange-400 font-mono">{it.quantity}x</span>
                    <span className="font-semibold text-slate-200 truncate">{it.name}</span>
                  </div>
                  <span className="font-bold text-white font-mono shrink-0">
                    Rs. {it.item_total}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill breakdown */}
            <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white font-mono">Rs. {summary.subtotal.toFixed(0)}</span>
              </div>

              {couponCode && (
                <div className="flex justify-between text-emerald-400 font-semibold font-mono">
                  <span>Promo Discount ({couponCode})</span>
                  <span>-Rs. {(summary.subtotal + summary.deliveryFee + summary.tax - summary.total).toFixed(0)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Lahore Delivery</span>
                <span className="font-semibold text-white font-mono">
                  {summary.deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">FREE</span>
                  ) : (
                    `Rs. ${summary.deliveryFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Taxes & Service (5%)</span>
                <span className="font-semibold text-white font-mono">Rs. {summary.tax.toFixed(0)}</span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between text-base font-black text-white">
                <span>Grand Total</span>
                <span className="text-orange-400 font-mono">Rs. {summary.total.toFixed(0)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 glass-btn-primary rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-orange-500/30 disabled:opacity-50"
            >
              <span>{loading ? 'Confirming Order...' : `Place Order (Rs. ${summary.total.toFixed(0)})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe & Encrypted Lahore Dispatch</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
