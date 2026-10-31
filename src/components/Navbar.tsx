import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, Shield, Menu as MenuIcon, X, Heart, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: 'home' | 'menu' | 'checkout' | 'track' | 'profile' | 'admin') => void;
  onOpenAuth: () => void;
  wishlistCount: number;
  onToggleWishlistView?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  wishlistCount,
  onToggleWishlistView,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { summary, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Single element brand wordmark with Pakistani location descriptor */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left cursor-pointer group whitespace-nowrap shrink-0"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 group-hover:scale-105 transition-all duration-300 border border-white/20">
              <span className="font-display font-black text-2xl tracking-tighter drop-shadow-md">S</span>
              <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-display font-extrabold tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  Spice<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Bite</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-widest hidden sm:inline-block">
                  PK
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 -mt-1">
                <MapPin className="w-3 h-3 text-orange-500" />
                <span>Gulberg, Lahore · Indian Fast Food</span>
              </div>
            </div>
          </button>

          {/* Zone 2: Concise single-line text nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <button
              onClick={() => onNavigate('home')}
              className={`relative py-1 whitespace-nowrap shrink-0 transition-all cursor-pointer hover:text-white ${
                currentView === 'home' ? 'text-orange-400 font-bold' : ''
              }`}
            >
              Home
              {currentView === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onNavigate('menu')}
              className={`relative py-1 whitespace-nowrap shrink-0 transition-all cursor-pointer hover:text-white ${
                currentView === 'menu' ? 'text-orange-400 font-bold' : ''
              }`}
            >
              Indian Menu
              {currentView === 'menu' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onNavigate('track')}
              className={`relative py-1 whitespace-nowrap shrink-0 transition-all cursor-pointer hover:text-white ${
                currentView === 'track' ? 'text-orange-400 font-bold' : ''
              }`}
            >
              Track Order
              {currentView === 'track' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`relative py-1 whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all cursor-pointer text-amber-400 hover:text-amber-300 ${
                  currentView === 'admin' ? 'font-bold' : ''
                }`}
              >
                <Shield className="w-4 h-4 text-orange-400" />
                <span>Admin Console</span>
                {currentView === 'admin' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
            )}
          </nav>

          {/* Zone 3: Wishlist + Glass Cart Button + Account Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Wishlist Button */}
            {onToggleWishlistView && (
              <button
                onClick={onToggleWishlistView}
                className="relative p-2.5 rounded-xl glass-btn-secondary cursor-pointer hover:scale-105 transition-all text-slate-300 hover:text-red-400"
                aria-label="View Wishlist"
                title="Favorite Dishes"
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-mono">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Glass Cart Button with PKR (Rs.) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl glass-card-interactive cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
                {summary.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center tabular-nums shadow-md shadow-orange-500/50">
                    {summary.itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Cart</span>
                <span className="text-xs font-black text-white tabular-nums -mt-0.5 font-mono">
                  Rs. {summary.total.toFixed(0)}
                </span>
              </div>
            </button>

            {/* Account / Login button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl glass-btn-secondary cursor-pointer text-xs font-semibold"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center text-[10px] font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline text-slate-200">{user?.name}</span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 glass-panel rounded-2xl py-2 z-50 border border-white/10 shadow-2xl animate-in fade-in-50 slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-[11px] text-slate-400 font-medium">Logged in (Lahore, PK)</p>
                      <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      Profile & Saved Addresses
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('track');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      My Past Orders
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-400/10 transition-colors cursor-pointer"
                      >
                        Admin Control Center
                      </button>
                    )}
                    <div className="border-t border-white/10 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 text-xs font-bold glass-btn-primary rounded-xl cursor-pointer whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white glass-btn-secondary rounded-xl"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-2 animate-in slide-in-from-top-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-xl text-slate-200 hover:bg-white/[0.06]"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('menu');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-xl text-slate-200 hover:bg-white/[0.06]"
            >
              Indian Food Menu
            </button>
            <button
              onClick={() => {
                onNavigate('track');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-xl text-slate-200 hover:bg-white/[0.06]"
            >
              Track Order
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 text-sm font-bold text-amber-400 rounded-xl hover:bg-amber-400/10"
              >
                Admin Console
              </button>
            )}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  onNavigate('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 text-sm font-semibold text-slate-300 rounded-xl hover:bg-white/[0.06]"
              >
                My Account
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 text-sm font-bold text-orange-400 rounded-xl hover:bg-orange-500/10"
              >
                Sign In / Register
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
