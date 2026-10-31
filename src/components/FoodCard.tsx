import React, { useState } from 'react';
import { Plus, Minus, Star, Flame, Utensils, Heart } from 'lucide-react';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';

interface FoodCardProps {
  food: FoodItem;
  onQuickView?: (food: FoodItem) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (foodId: number) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onQuickView,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { items, addToCart, updateQuantity } = useCart();
  const [imageError, setImageError] = useState(false);

  const cartItem = items.find((i) => i.food_item_id === food.id);
  const effectivePrice = food.discount_price ? Number(food.discount_price) : Number(food.price);
  const discountPercent = food.discount_price
    ? Math.round(((food.price - food.discount_price) / food.price) * 100)
    : 0;

  return (
    <div className="group glass-card rounded-3xl overflow-hidden flex flex-col justify-between relative border border-white/[0.08] hover:border-orange-500/50 transition-all duration-300">
      {/* Top Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-900/80 overflow-hidden">
        {!imageError ? (
          <img
            src={food.image_url}
            alt={food.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            onClick={() => onQuickView && onQuickView(food)}
            className="w-full h-full object-cover group-hover:scale-108 group-hover:rotate-0.5 transition-transform duration-500 cursor-pointer"
          />
        ) : (
          <div
            onClick={() => onQuickView && onQuickView(food)}
            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-orange-400 p-4 text-center cursor-pointer"
          >
            <Utensils className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-xs font-semibold">{food.name}</span>
          </div>
        )}

        {/* Ambient Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 pointer-events-none" />

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 backdrop-blur-md bg-slate-950/80 p-1.5 rounded-lg border border-white/10 shadow-lg flex items-center justify-center">
          <div
            className={`w-3.5 h-3.5 border-2 flex items-center justify-center rounded-xs ${
              food.is_veg ? 'border-emerald-500' : 'border-red-500'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                food.is_veg ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>

        {/* Favorite / Wishlist Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(food.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md bg-slate-950/70 border border-white/10 text-slate-300 hover:text-red-400 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg active:scale-90"
            aria-label="Save to favorites"
            title="Add to Wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : ''
              }`}
            />
          </button>
        )}

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg tracking-wider border border-white/20">
            {discountPercent}% OFF
          </div>
        )}

        {/* Rating overlay */}
        <div className="absolute bottom-3 right-3 backdrop-blur-md bg-slate-950/80 border border-white/10 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{food.rating.toFixed(1)}</span>
          <span className="text-slate-400 text-[10px] font-normal">({food.rating_count})</span>
        </div>

        {/* Out of Stock overlay if unavailable */}
        {!food.is_available && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider border border-white/20">
              Currently Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-1.5">
            <span className="text-orange-400 font-semibold">{food.category_name || 'Desi Bites'}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Flame className="w-3 h-3 text-red-400" />
              {food.spice_level}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{food.preparation_time_mins}m</span>
          </div>

          <h3
            onClick={() => onQuickView && onQuickView(food)}
            className="text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1 cursor-pointer"
          >
            {food.name}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Price & Action Row (PKR / Rs.) */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-base font-black text-white font-mono">
              Rs. {effectivePrice}
            </span>
            {food.discount_price && (
              <span className="text-xs text-slate-500 line-through font-mono">
                Rs. {food.price}
              </span>
            )}
          </div>

          {/* Add / Stepper */}
          {food.is_available ? (
            cartItem ? (
              <div className="flex items-center bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl shadow-md shadow-orange-500/20 overflow-hidden border border-white/20">
                <button
                  onClick={() => updateQuantity(food.id, cartItem.quantity - 1)}
                  className="p-1.5 hover:bg-black/20 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2.5 text-xs font-bold tabular-nums min-w-[20px] text-center font-mono">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(food.id, cartItem.quantity + 1)}
                  className="p-1.5 hover:bg-black/20 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(food)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl glass-btn-primary font-bold text-xs cursor-pointer shadow-md shadow-orange-500/25 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD</span>
              </button>
            )
          ) : (
            <span className="text-[11px] text-slate-500 font-semibold italic">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
