import React from 'react';
import { MapPin, Phone, Mail, Clock, Heart, ShieldCheck, Flame, Info } from 'lucide-react';

interface FooterProps {
  onNavigateToCategory: (slug: string) => void;
  onNavigate: (view: 'home' | 'menu' | 'checkout' | 'track' | 'profile' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToCategory, onNavigate }) => {
  return (
    <footer className="bg-slate-950/90 border-t border-white/10 text-slate-300 pt-16 pb-12 relative overflow-hidden backdrop-blur-2xl">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Demo Disclaimer Banner */}
        <div className="mb-10 p-4 rounded-2xl glass-card border border-amber-500/20 bg-amber-500/[0.03] flex items-center gap-3 text-xs text-amber-300/90">
          <Info className="w-5 h-5 shrink-0 text-amber-400" />
          <span>
            <strong>Demo Restaurant Notice:</strong> SpiceBite is a demonstration online food ordering platform operating with Pakistan business coordinates (Lahore, PK) serving authentic Indian cuisine. Contact and address details are provided for demonstration purposes.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-display font-extrabold text-xl shadow-lg shadow-orange-500/30 border border-white/20">
                S
              </div>
              <span className="text-2xl font-display font-extrabold text-white tracking-tight">
                Spice<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Bite</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Lahore's premier Indian fast-food kitchen. Bringing authentic street flavors, royal dum biryani handis, and loaded tandoori zinger burgers directly to your doorstep in Lahore, Pakistan.
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Operating Hours: 12:00 PM – 03:00 AM (PKT)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Halal Ingredients & Hygienic Packing</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Explore Menu</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-orange-400 transition-colors cursor-pointer text-slate-400"
                >
                  Home & Specials
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu')}
                  className="hover:text-orange-400 transition-colors cursor-pointer text-slate-400"
                >
                  Full Indian Food Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-orange-400 transition-colors cursor-pointer text-slate-400"
                >
                  Live Order Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('profile')}
                  className="hover:text-orange-400 transition-colors cursor-pointer text-slate-400"
                >
                  My Saved Addresses
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-amber-400 font-semibold"
                >
                  Admin Operations Console
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Cuisine Specials</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigateToCategory('zinger-burgers')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Tandoori Zinger Burgers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCategory('biryani')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Royal Dum Biryani Handi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCategory('rolls')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Kolkata Kathi Rolls
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCategory('momos')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Darjeeling Street Momos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToCategory('indian-street-food')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Dahi Puri & Samosa Pav
                </button>
              </li>
            </ul>
          </div>

          {/* Pakistan Contact Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Lahore Kitchen</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Sector Z, Phase 3, DHA / Gulberg III, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="font-mono text-slate-200">+92 300 1234567 <span className="text-[10px] text-slate-500">(Demo)</span></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>orders@spicebite.pk</span>
              </li>
              <li className="text-[11px] text-slate-500 pt-1 leading-normal">
                Delivery across: DHA, Gulberg, Model Town, Johar Town, Cantt & Canal Road.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SpiceBite Pakistan. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Authentic Indian Fast Food Delivered in Lahore, Pakistan</span>
            <span className="text-slate-700">·</span>
            <span className="text-orange-400 font-mono">Currency: PKR (Rs.)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
