import React, { useState } from 'react';
import { X, Star, Clock, Flame, Plus, Minus, ShoppingBag } from 'lucide-react';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';

interface QuickViewModalProps {
  food: FoodItem | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ food, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!food) return null;

  const effectivePrice = food.discount_price ? Number(food.discount_price) : Number(food.price);
  const discountPercent = food.discount_price
    ? Math.round(((food.price - food.discount_price) / food.price) * 100)
    : 0;

  const handleAdd = () => {
    addToCart(food, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/15 overflow-hidden z-10 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full glass-btn-secondary flex items-center justify-center cursor-pointer transition-colors shadow-md"
        >
          <X className="w-5 h-5 text-slate-200" />
        </button>

        {/* Media Frame */}
        <div className="relative aspect-16/10 w-full bg-slate-900 overflow-hidden">
          <img
            src={food.image_url}
            alt={food.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {discountPercent > 0 && (
            <div className="absolute bottom-4 left-5 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border border-white/20">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-4 h-4 border-2 flex items-center justify-center rounded-xs ${
                food.is_veg ? 'border-emerald-500' : 'border-red-500'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  food.is_veg ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              {food.category_name}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              {food.spice_level} Spice
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {food.preparation_time_mins} mins prep
            </span>
          </div>

          <h3 className="text-2xl font-display font-extrabold text-white">
            {food.name}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 mb-3">
            <div className="flex items-center text-amber-400 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
              <span>{food.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-400">({food.rating_count} verified reviews)</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            {food.description}
          </p>

          {/* Pricing & Add row (PKR / Rs.) */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Price</div>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-2xl font-black text-white font-mono">
                  Rs. {effectivePrice * quantity}
                </span>
                {food.discount_price && (
                  <span className="text-sm text-slate-500 line-through font-mono">
                    Rs. {food.price * quantity}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center glass-card rounded-xl overflow-hidden border border-white/15">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-xs font-bold tabular-nums min-w-[24px] text-center font-mono text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add CTA */}
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-2.5 glass-btn-primary font-bold text-xs rounded-xl shadow-lg shadow-orange-500/30 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
