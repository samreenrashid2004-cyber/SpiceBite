import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Check, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'customer' | 'admin') => {
    setIsLoginTab(true);
    setError(null);
    if (role === 'admin') {
      setEmail('admin@spicebite.pk');
      setPassword('Admin@123');
    } else {
      setEmail('customer@spicebite.pk');
      setPassword('Customer@123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-white/15 overflow-hidden z-10 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 pb-4 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-extrabold font-display shadow-lg shadow-orange-500/30 border border-white/20">
                S
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  {isLoginTab ? 'Welcome to SpiceBite' : 'Join SpiceBite Lahore'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isLoginTab ? 'Sign in to access your orders and saved addresses' : 'Authentic Indian fast food delivered across Lahore'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white glass-btn-secondary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Demo Credentials Strip */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Quick Test Sign-in:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fillDemo('customer')}
                className="px-3 py-1 text-[11px] font-bold glass-btn-secondary hover:border-orange-500/50 rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="px-3 py-1 text-[11px] font-bold bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/40 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
              >
                <Shield className="w-3 h-3" />
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-white/10">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all cursor-pointer text-center ${
              isLoginTab
                ? 'text-orange-400 border-b-2 border-orange-500 bg-white/[0.04]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all cursor-pointer text-center ${
              !isLoginTab
                ? 'text-orange-400 border-b-2 border-orange-500 bg-white/[0.04]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-5 mb-0 p-3 bg-red-950/60 border border-red-500/40 rounded-2xl flex items-start gap-2.5 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Hamza Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs glass-input rounded-xl"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="customer@spicebite.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs glass-input rounded-xl"
              />
            </div>
          </div>

          {!isLoginTab && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Phone (Pakistan format)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs glass-input rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs glass-input rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 glass-btn-primary rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 mt-2"
          >
            {loading ? 'Please wait...' : isLoginTab ? 'Sign In to SpiceBite' : 'Register Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
