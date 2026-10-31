import React, { useState, useEffect } from 'react';
import { Search, Filter, Flame, X, Utensils, Heart } from 'lucide-react';
import { FoodItem, Category } from '../types';
import { api } from '../services/api';
import { FoodCard } from '../components/FoodCard';

interface MenuViewProps {
  initialCategory?: string;
  initialFavoritesOnly?: boolean;
  onQuickView: (food: FoodItem) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  initialCategory,
  initialFavoritesOnly = false,
  onQuickView,
  favorites,
  onToggleFavorite,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(initialFavoritesOnly);
  const [loading, setLoading] = useState(true);

  // Sync category or wishlist toggle if prop changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialFavoritesOnly !== undefined) {
      setShowFavoritesOnly(initialFavoritesOnly);
    }
  }, [initialFavoritesOnly]);

  // Load categories
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await api.getCategories();
        setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCats();
  }, []);

  // Fetch items with filters
  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
          veg: vegFilter === 'all' ? undefined : vegFilter,
          sort: sortBy === 'recommended' ? undefined : sortBy,
        };
        const res = await api.getFoodItems(params);
        setItems(res.items || []);
      } catch (err) {
        console.error('Failed to load food items:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchItems();
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, vegFilter, sortBy]);

  const displayedItems = showFavoritesOnly
    ? items.filter((it) => favorites.includes(it.id))
    : items;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Lahore Desi Kitchen
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white mt-1">
            Indian Fast Food Menu
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xl leading-relaxed">
            From smoky tandoori zingers and royal handi dum biryanis to Darjeeling momos and Kolkata kathi rolls. Prices in Pakistani Rupees (Rs.).
          </p>
        </div>

        {/* Live Search Box with Glass Effect */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search burgers, biryani, momos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-3 text-xs glass-input rounded-2xl shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Glass Filter Tabs */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2.5 min-w-max">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setShowFavoritesOnly(false);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              selectedCategory === 'all' && !showFavoritesOnly
                ? 'glass-btn-primary border-white/20'
                : 'glass-btn-secondary text-slate-300 hover:text-white'
            }`}
          >
            All Items
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setShowFavoritesOnly(false);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                selectedCategory === cat.slug && !showFavoritesOnly
                  ? 'glass-btn-primary border-white/20'
                  : 'glass-btn-secondary text-slate-300 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}

          {/* Favorites Filter */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              showFavoritesOnly
                ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-lg'
                : 'glass-btn-secondary text-slate-300 hover:text-red-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-red-500 text-red-500' : ''}`} />
            <span>Favorites ({favorites.length})</span>
          </button>
        </div>
      </div>

      {/* Secondary Controls: Diet Filter & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl glass-card border border-white/10">
        {/* Diet Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 hidden sm:inline">Dietary:</span>
          <button
            onClick={() => setVegFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              vegFilter === 'all'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setVegFilter('veg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              vegFilter === 'veg'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-400 border-transparent'
            }`}
          >
            <div className="w-2.5 h-2.5 border border-current flex items-center justify-center rounded-xs">
              <div className="w-1.5 h-1.5 bg-current rounded-full" />
            </div>
            <span>Pure Veg</span>
          </button>
          <button
            onClick={() => setVegFilter('non-veg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              vegFilter === 'non-veg'
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'text-slate-400 hover:text-red-400 border-transparent'
            }`}
          >
            <div className="w-2.5 h-2.5 border border-current flex items-center justify-center rounded-xs">
              <div className="w-1.5 h-1.5 bg-current rounded-full" />
            </div>
            <span>Non-Veg</span>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Filter className="w-3.5 h-3.5 text-orange-400" />
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="glass-input rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 cursor-pointer"
          >
            <option value="recommended" className="bg-slate-900 text-white">Chef Recommended</option>
            <option value="price-asc" className="bg-slate-900 text-white">Price: Low to High (Rs.)</option>
            <option value="price-desc" className="bg-slate-900 text-white">Price: High to Low (Rs.)</option>
            <option value="rating" className="bg-slate-900 text-white">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Grid of Food Items */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-80 rounded-3xl glass-card animate-pulse" />
          ))}
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl border border-white/10 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center text-orange-400 mx-auto mb-4 border border-white/10">
            <Utensils className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-lg font-bold text-white font-display">No dishes match your filter</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Try adjusting your search query, dietary preferences, or category filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setVegFilter('all');
              setSortBy('recommended');
              setShowFavoritesOnly(false);
            }}
            className="mt-5 px-5 py-2.5 glass-btn-primary rounded-xl text-xs font-bold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-4 tabular-nums">
            Showing {displayedItems.length} delicious {displayedItems.length === 1 ? 'item' : 'items'} in Pakistani Rupees (Rs.)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedItems.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onQuickView={onQuickView}
                isFavorite={favorites.includes(food.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
