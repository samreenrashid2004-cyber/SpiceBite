import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { QuickViewModal } from './components/QuickViewModal';
import { HomeView } from './views/HomeView';
import { MenuView } from './views/MenuView';
import { CheckoutView } from './views/CheckoutView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';
import { FoodItem } from './types';
import { CheckCircle, X } from 'lucide-react';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'menu' | 'checkout' | 'track' | 'profile' | 'admin'>('home');
  const [menuInitialCategory, setMenuInitialCategory] = useState<string | undefined>(undefined);
  const [menuFavoritesOnly, setMenuFavoritesOnly] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [quickViewFood, setQuickViewFood] = useState<FoodItem | null>(null);
  const [trackedOrderNumber, setTrackedOrderNumber] = useState<string | undefined>(undefined);

  // Favorites state persisted to localStorage
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('sb_favorites');
      return saved ? JSON.parse(saved) : [1, 4, 7];
    } catch {
      return [1, 4, 7];
    }
  });

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('sb_favorites', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save favorites to localStorage:', e);
      }
      showToast(exists ? 'Removed from favorites' : 'Added to favorites');
      return next;
    });
  };

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleNavigate = (view: 'home' | 'menu' | 'checkout' | 'track' | 'profile' | 'admin') => {
    if (view === 'profile' && !isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    if (view === 'menu') {
      setMenuFavoritesOnly(false);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToMenu = (categorySlug?: string) => {
    setMenuInitialCategory(categorySlug);
    setMenuFavoritesOnly(false);
    setCurrentView('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWishlist = () => {
    setMenuInitialCategory(undefined);
    setMenuFavoritesOnly(true);
    setCurrentView('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (orderNumber: string) => {
    setTrackedOrderNumber(orderNumber);
    setCurrentView('track');
    showToast(`Order #${orderNumber} placed successfully!`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070a11] text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* Top Glass Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        wishlistCount={favorites.length}
        onToggleWishlistView={handleOpenWishlist}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigateToMenu={handleNavigateToMenu}
            onQuickView={(food) => setQuickViewFood(food)}
            onShowToast={showToast}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {currentView === 'menu' && (
          <MenuView
            initialCategory={menuInitialCategory}
            initialFavoritesOnly={menuFavoritesOnly}
            onQuickView={(food) => setQuickViewFood(food)}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onOrderSuccess={handleOrderSuccess}
            onNavigateToMenu={() => handleNavigate('menu')}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentView === 'track' && (
          <OrderTrackingView
            initialOrderNumber={trackedOrderNumber}
            onExploreMenu={() => handleNavigate('menu')}
            onShowToast={showToast}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            onTrackOrder={(num) => {
              setTrackedOrderNumber(num);
              setCurrentView('track');
            }}
            onExploreMenu={() => handleNavigate('menu')}
            onShowToast={showToast}
          />
        )}

        {currentView === 'admin' && (
          <AdminView onShowToast={showToast} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigateToCategory={handleNavigateToMenu}
        onNavigate={handleNavigate}
      />

      {/* Global Slide-over Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => handleNavigate('checkout')}
        onExploreMenu={() => handleNavigate('menu')}
      />

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => showToast('Signed in successfully!')}
      />

      {/* Global Quick View Modal */}
      <QuickViewModal
        food={quickViewFood}
        onClose={() => setQuickViewFood(null)}
      />

      {/* Floating Glass Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel border border-orange-500/40 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shrink-0 shadow-md">
            <CheckCircle className="w-3.5 h-3.5 text-stone-950 font-bold" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-slate-100">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
