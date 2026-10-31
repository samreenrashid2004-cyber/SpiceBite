import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Flame, Clock, ShieldCheck, Heart, Star, CheckCircle, Mail,
  ChevronDown, Sparkles, ChefHat, Truck, Award, UtensilsCrossed, Zap
} from 'lucide-react';
import { FoodItem, Category } from '../types';
import { api } from '../services/api';
import { FoodCard } from '../components/FoodCard';
import { useCart } from '../context/CartContext';

interface HomeViewProps {
  onNavigateToMenu: (categorySlug?: string) => void;
  onQuickView: (food: FoodItem) => void;
  onShowToast: (msg: string) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateToMenu,
  onQuickView,
  onShowToast,
  favorites,
  onToggleFavorite,
}) => {
  const { applyCoupon } = useCart();
  const [bestsellers, setBestsellers] = useState<FoodItem[]>([]);
  const [deals, setDeals] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [featuredRes, catRes] = await Promise.all([
          api.getFeaturedItems(),
          api.getCategories(),
        ]);
        setBestsellers(featuredRes.bestsellers || []);
        setDeals(featuredRes.deals || []);
        setCategories(catRes.categories || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleApplyCoupon = async (code: string) => {
    const res = await applyCoupon(code);
    onShowToast(res.message);
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    onShowToast('Subscribed! Check your inbox for secret Lahore delivery discounts.');
    setNewsletterEmail('');
  };

  return (
    <div className="space-y-24 pb-20 relative overflow-hidden">
      {/* Background Decorative Mesh Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-orange-600/15 via-amber-500/10 to-red-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. Innovative Glassmorphism Hero Section */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Floating Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wide shadow-lg shadow-orange-500/10 animate-in fade-in slide-in-from-top-3">
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>INDIAN FAST FOOD KITCHEN</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-amber-300">DELIVERING IN LAHORE, PK</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.05] text-balance">
                Delicious Food,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-red-400 drop-shadow-sm">
                  Delivered Hot
                </span>{' '}
                To Your Doorstep!
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Experience the authentic kick of Indian fast food right here in Lahore—from double-crunch Tandoori Zinger Burgers and aromatic royal Dum Biryani handis to crispy Darjeeling Momos and layered Kolkata Kathi Rolls.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigateToMenu()}
                  className="px-8 py-4 rounded-2xl glass-btn-primary font-black text-sm flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-xl shadow-orange-500/30"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigateToMenu()}
                  className="px-7 py-4 rounded-2xl glass-btn-secondary text-white font-bold text-sm cursor-pointer hover:border-white/30 transition-all hover:scale-102"
                >
                  Explore Indian Menu
                </button>
              </div>

              {/* Trust Indicators (Glass Capsules) */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10 max-w-lg">
                <div className="p-3 rounded-2xl glass-card flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-orange-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold font-mono">30-40 Mins</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Lahore Express</div>
                </div>

                <div className="p-3 rounded-2xl glass-card flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-amber-300 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold">100% Desi</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Authentic Spices</div>
                </div>

                <div className="p-3 rounded-2xl glass-card flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold">100% Halal</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Hygienic Kitchen</div>
                </div>
              </div>
            </div>

            {/* Right Hero Showcase with Floating Elements */}
            <div className="lg:col-span-5 relative">
              {/* Main Glass Hero Frame */}
              <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/15 p-2 shadow-2xl shadow-black/80">
                <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden">
                  <img
                    src="/src/assets/images/hero_indian_fastfood_1793432673332.jpg"
                    alt="Authentic Indian fast food spread including tandoori zinger burger, handi biryani, and rolls"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl glass-panel border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                          Lahore Chef's Recommendation
                        </span>
                        <h3 className="text-base font-bold text-white font-display mt-0.5">
                          Tandoori Zinger & Handi Biryani
                        </h3>
                      </div>
                      <span className="text-base font-black text-amber-300 font-mono">
                        Rs. 199+
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Glass Pill 1: Dum Biryani Handi */}
              <div className="hidden sm:flex absolute -top-6 -left-6 items-center gap-3 p-3 rounded-2xl glass-panel border border-white/15 shadow-xl animate-float-slow">
                <img
                  src="/src/assets/images/dum_biryani_handi_1793432675798.jpg"
                  alt="Dum Biryani"
                  className="w-12 h-12 rounded-xl object-cover border border-white/10"
                />
                <div>
                  <div className="text-[11px] font-bold text-white">Clay Handi Biryani</div>
                  <div className="text-[10px] font-bold text-orange-400 font-mono">Rs. 299 · Dum Cooked</div>
                </div>
              </div>

              {/* Floating Glass Pill 2: Darjeeling Momos */}
              <div className="hidden sm:flex absolute -bottom-6 -right-6 items-center gap-3 p-3 rounded-2xl glass-panel border border-white/15 shadow-xl animate-float-reverse">
                <img
                  src="/src/assets/images/street_momos_platter_1793432676578.jpg"
                  alt="Street Momos"
                  className="w-12 h-12 rounded-xl object-cover border border-white/10"
                />
                <div>
                  <div className="text-[11px] font-bold text-white">Steamed Darjeeling Momos</div>
                  <div className="text-[10px] font-bold text-amber-300 font-mono">Rs. 139 · Spicy Chutney</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Indian Food Category Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Browse by Craving
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white mt-1">
              Indian Fast Food Categories
            </h2>
          </div>
          <button
            onClick={() => onNavigateToMenu()}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigateToMenu(cat.slug)}
              className="p-4 rounded-3xl glass-card flex flex-col justify-between group cursor-pointer text-left hover:border-orange-500/50"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/[0.05] group-hover:bg-gradient-to-tr group-hover:from-orange-500 group-hover:to-amber-500 text-orange-400 group-hover:text-white flex items-center justify-center font-display font-black text-lg transition-all duration-300 mb-3 border border-white/10">
                {cat.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Chef's Special & Trending Dishes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
              <ChefHat className="w-4 h-4 text-orange-400" />
              <span>Signature Fast Food Creations</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white mt-1">
              Trending Dishes in Lahore
            </h2>
          </div>
          <button
            onClick={() => onNavigateToMenu()}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
          >
            <span>See All Dishes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 rounded-3xl glass-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestsellers.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onQuickView={onQuickView}
                isFavorite={favorites.includes(food.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Special Offers & Promo Codes (Glass Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl glass-panel p-8 sm:p-12 relative overflow-hidden border border-white/15">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
              Exclusive Feast Savings
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white mt-1 mb-3">
              Today's Special Promo Coupons
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Apply these promo codes during checkout for instant savings in Pakistani Rupees (Rs.) on burgers, biryani, and momos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border border-white/10">
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-300">First Order</div>
                  <div className="text-base font-black font-mono text-white mt-0.5">FIRSTBITE</div>
                  <p className="text-[11px] text-slate-400 mt-1">20% OFF above Rs. 299</p>
                </div>
                <button
                  onClick={() => handleApplyCoupon('FIRSTBITE')}
                  className="mt-3 py-1.5 px-3 glass-btn-primary text-xs font-bold rounded-xl cursor-pointer text-center"
                >
                  Apply Code
                </button>
              </div>

              <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border border-white/10">
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-300">Desi Craver</div>
                  <div className="text-base font-black font-mono text-white mt-0.5">DESI50</div>
                  <p className="text-[11px] text-slate-400 mt-1">Flat Rs. 50 OFF above Rs. 399</p>
                </div>
                <button
                  onClick={() => handleApplyCoupon('DESI50')}
                  className="mt-3 py-1.5 px-3 glass-btn-primary text-xs font-bold rounded-xl cursor-pointer text-center"
                >
                  Apply Code
                </button>
              </div>

              <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border border-white/10">
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-300">Biryani Lover</div>
                  <div className="text-base font-black font-mono text-white mt-0.5">BIRYANI20</div>
                  <p className="text-[11px] text-slate-400 mt-1">15% OFF on feasts</p>
                </div>
                <button
                  onClick={() => handleApplyCoupon('BIRYANI20')}
                  className="mt-3 py-1.5 px-3 glass-btn-primary text-xs font-bold rounded-xl cursor-pointer text-center"
                >
                  Apply Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why Choose SpiceBite Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Uncompromising Quality
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white mt-1">
            Why Lahore Craves SpiceBite
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            We blend traditional Indian slow-cooking techniques with modern fast-food speed and hygiene.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1.5">30-Min Fast Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated fleet across Gulberg, DHA, and Model Town ensures food arrives hot in thermal insulated bags.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1.5">Authentic Indian Spices</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hand-ground Kashmiri chilies, aromatic saffron, roasted cumin, and tandoori blends crafted in-house daily.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1.5">100% Halal & Hygienic</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strict food safety standards, contactless dispatch, and premium fresh chicken and farm cottage cheese.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1.5">Generous Portions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hearty double patties, layered kathi rolls, and sealed dum handis built to satisfy serious desi hunger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-white/10">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Effortless Ordering
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
              How SpiceBite Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
                1
              </div>
              <h3 className="text-base font-bold text-white">Pick Your Desi Cravings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose from zingers, handi biryani, momos, rolls, and Indian street chaat. Apply promo coupons for instant discounts.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                2
              </div>
              <h3 className="text-base font-bold text-white">Chef Crafts Fresh in Tandoor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every order is prepared hot to order with freshly baked buns, steamed momos, and aromatic slow-dum spices.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-500 to-orange-500 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
                3
              </div>
              <h3 className="text-base font-bold text-white">Delivered Hot to Your Table</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track your rider in real time across Lahore. Pay via Cash on Delivery, JazzCash, or EasyPaisa sandbox.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Customer Reviews Section (Lahore, Pakistan) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Real Food Lover Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
            Loved By Fast Foodies in Lahore
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Verified ratings and customer reviews from Lahore food enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                "The Tandoori Spiced Zinger is exceptional! The crust is super crunchy with genuine spicy mint mayo that sets it miles apart from ordinary burgers. Arrived in Gulberg in just 28 minutes."
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center text-xs">
                HM
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Hamza Malik</h4>
                <p className="text-[11px] text-slate-400">Verified Customer · Gulberg III, Lahore</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                "Their Royal Hyderabadi Dum Biryani handi has that authentic earthen pot aroma. Saffron-rich basmati with juicy spiced chicken. Easily the best dum biryani experience in DHA."
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center text-xs">
                ZA
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Zainab Ali</h4>
                <p className="text-[11px] text-slate-400">Verified Customer · DHA Phase 5, Lahore</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                "The Darjeeling steamed momos with fiery red Schezwan chili chutney hit the spot on a rainy evening. Ordering and tracking the rider live was seamless."
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 text-white font-bold flex items-center justify-center text-xs">
                BL
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Bilal Tariq</h4>
                <p className="text-[11px] text-slate-400">Verified Customer · Model Town, Lahore</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Newsletter Subscription */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/15 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              SpiceBite Lahore Club
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1 mb-2">
              Get Secret Weekend Feast Discounts!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Subscribe to receive weekly secret promo codes (flat Rs. 100 off), midnight cravings alerts, and new menu item previews.
            </p>
          </div>

          <div className="w-full md:w-auto min-w-[320px]">
            {newsletterSubscribed ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-2.5 text-emerald-300 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>You're on the list! Check your inbox for Rs. 100 off.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 text-xs glass-input rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 glass-btn-primary rounded-xl text-xs font-bold cursor-pointer shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
