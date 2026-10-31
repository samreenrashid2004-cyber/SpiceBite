import React, { useState, useEffect } from 'react';
import { User, MapPin, Package, Plus, Trash2, CheckCircle, Clock, ArrowRight, ShieldCheck, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Address, Order } from '../types';
import { api } from '../services/api';

interface ProfileViewProps {
  onTrackOrder: (orderNumber: string) => void;
  onExploreMenu: () => void;
  onShowToast: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onTrackOrder, onExploreMenu, onShowToast }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'details'>('orders');

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Addresses (Lahore, Pakistan defaults)
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrFullName, setAddrFullName] = useState(user?.name || '');
  const [addrPhone, setAddrPhone] = useState(user?.phone || '+92 300 1234567');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('Lahore');
  const [addrState, setAddrState] = useState('Punjab, Pakistan');
  const [addrPincode, setAddrPincode] = useState('54000');

  // Edit profile form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    async function loadData() {
      setOrdersLoading(true);
      try {
        const [ordersRes, addrRes] = await Promise.all([
          api.getUserOrders(),
          api.getAddresses(),
        ]);
        setOrders(ordersRes.orders || []);
        setAddresses(addrRes.addresses || []);
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setOrdersLoading(false);
      }
    }

    loadData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.updateProfile({ name: profileName, phone: profilePhone });
      updateUser(res.user);
      onShowToast('Profile details updated successfully!');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAddress({
        label: addrLabel,
        full_name: addrFullName,
        phone: addrPhone,
        street_address: addrStreet,
        landmark: addrLandmark,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        is_default: addresses.length === 0 ? 1 : 0,
      });

      setAddresses((prev) => [res.address, ...prev]);
      setShowAddAddress(false);
      setAddrStreet('');
      setAddrLandmark('');
      onShowToast('New Lahore delivery address saved!');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save address');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          is_default: a.id === id ? 1 : 0,
        }))
      );
      onShowToast('Default delivery address updated.');
    } catch (e) {
      onShowToast('Failed to update default address.');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await api.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      onShowToast('Address removed.');
    } catch (e) {
      onShowToast('Failed to delete address.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-red-600 text-white font-extrabold font-display text-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 border border-white/20">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
              {user?.role === 'admin' ? 'Administrator' : 'SpiceBite Foodie'} · Lahore, PK
            </span>
            <h1 className="text-2xl font-display font-extrabold text-white">{user?.name}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                {user?.email}
              </span>
              {user?.phone && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-1.5 font-mono text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-orange-400" />
                    {user?.phone}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2.5 rounded-2xl glass-card text-center border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Past Orders</span>
            <span className="text-lg font-black text-white font-mono tabular-nums">{orders.length}</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl glass-card text-center border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Saved Addresses</span>
            <span className="text-lg font-black text-white font-mono tabular-nums">{addresses.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'text-orange-400 border-b-2 border-orange-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'text-orange-400 border-b-2 border-orange-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Delivery Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'details'
              ? 'text-orange-400 border-b-2 border-orange-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* Tab 1: Orders (PKR / Rs.) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 rounded-2xl glass-card animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 glass-panel rounded-3xl border border-white/10 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No past orders found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                You haven't ordered yet. Treat yourself to our signature Indian fast food menu.
              </p>
              <button
                onClick={onExploreMenu}
                className="mt-5 px-6 py-2.5 glass-btn-primary rounded-xl text-xs font-bold cursor-pointer"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-white text-sm">
                      #{order.order_number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                        order.order_status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : order.order_status === 'CANCELLED'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                      }`}
                    >
                      {order.order_status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(order.created_at).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mt-2">
                    {order.items?.map((it) => `${it.quantity}x ${it.item_name}`).join(', ')}
                  </div>

                  <div className="text-xs font-black text-white mt-1 tabular-nums font-mono">
                    Total: <span className="text-orange-400">Rs. {order.total_amount}</span> ({order.payment_method})
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onTrackOrder(order.order_number)}
                    className="px-4 py-2 glass-btn-secondary text-xs font-bold rounded-xl border border-white/15 flex items-center gap-1.5 cursor-pointer hover:border-orange-500/50"
                  >
                    <span>Track Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Addresses (Lahore) */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Saved Lahore Delivery Locations</h3>
            {!showAddAddress && (
              <button
                onClick={() => setShowAddAddress(true)}
                className="px-4 py-2 glass-btn-primary rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Lahore Address</span>
              </button>
            )}
          </div>

          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-6 glass-panel rounded-3xl border border-white/15 space-y-4 shadow-xl">
              <h4 className="text-sm font-bold text-white">New Address in Lahore, Pakistan</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Label</label>
                  <select
                    value={addrLabel}
                    onChange={(e) => setAddrLabel(e.target.value)}
                    className="w-full px-3 py-2 text-xs glass-input rounded-xl"
                  >
                    <option value="Home" className="bg-slate-900">Home</option>
                    <option value="Work" className="bg-slate-900">Work</option>
                    <option value="Other" className="bg-slate-900">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addrFullName}
                    onChange={(e) => setAddrFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs glass-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Phone (PK)</label>
                  <input
                    type="tel"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2 text-xs glass-input rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">House / Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House 14-B, Sector Z, Phase 3, DHA"
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs glass-input rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Landmark</label>
                  <input
                    type="text"
                    value={addrLandmark}
                    onChange={(e) => setAddrLandmark(e.target.value)}
                    placeholder="Near Packages Mall / Y Block"
                    className="w-full px-3.5 py-2 text-xs glass-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs glass-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    placeholder="54000"
                    className="w-full px-3.5 py-2 text-xs glass-input rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-4 py-2 glass-btn-secondary rounded-xl text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 glass-btn-primary rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-orange-400 px-2.5 py-0.5 bg-orange-500/10 rounded-md border border-orange-500/20">
                      {addr.label}
                    </span>
                    {addr.is_default === 1 && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{addr.full_name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{addr.phone}</p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {addr.street_address}, {addr.landmark ? addr.landmark + ', ' : ''}{addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  {addr.is_default !== 1 ? (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium">Primary</span>
                  )}

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Account Details */}
      {activeTab === 'details' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-lg shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Personal Details</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl opacity-60 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Account email cannot be modified</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Phone (Pakistan format)</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-3 glass-btn-primary rounded-xl text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
