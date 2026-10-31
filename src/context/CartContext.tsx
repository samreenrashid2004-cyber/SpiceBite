import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartSummary, FoodItem } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  summary: CartSummary;
  couponCode: string | null;
  couponDiscount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (food: FoodItem, quantity?: number) => Promise<void>;
  updateQuantity: (foodItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (foodItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mm_cart_guest';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Recalculate summary whenever items or coupon change
  const subtotal = items.reduce((sum, item) => sum + (item.effective_price * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 499 ? 0 : 40) : 0;
  const taxable = Math.max(0, subtotal - couponDiscount);
  const tax = subtotal > 0 ? Math.round(taxable * 0.05 * 100) / 100 : 0;
  const total = Math.max(0, Math.round((taxable + deliveryFee + tax) * 100) / 100);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const summary: CartSummary = {
    subtotal,
    deliveryFee,
    freeDeliveryThreshold: 499,
    tax,
    total,
    itemCount,
  };

  // Load cart on auth change
  useEffect(() => {
    async function loadCart() {
      setLoading(true);
      if (isAuthenticated) {
        try {
          // Check if guest cart had items, sync them
          const guestRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (guestRaw) {
            const guestItems = JSON.parse(guestRaw);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              await api.syncCart(guestItems);
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
          }

          const res = await api.getCart();
          setItems(res.items || []);
        } catch (e) {
          console.error('Failed to load server cart:', e);
        }
      } else {
        // Load guest cart from local storage
        try {
          const guestRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (guestRaw) {
            setItems(JSON.parse(guestRaw));
          } else {
            setItems([]);
          }
        } catch {
          setItems([]);
        }
      }
      setLoading(false);
    }

    loadCart();
  }, [isAuthenticated]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  const addToCart = async (food: FoodItem, quantity = 1) => {
    const effectivePrice = food.discount_price ? Number(food.discount_price) : Number(food.price);

    if (isAuthenticated) {
      try {
        const existing = items.find((i) => i.food_item_id === food.id);
        const newQty = (existing?.quantity || 0) + quantity;
        const res = await api.updateCartItem(food.id, newQty);
        setItems(res.items || []);
      } catch (err) {
        console.error('Error adding to server cart:', err);
      }
    } else {
      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.food_item_id === food.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          const newQty = updated[existingIndex].quantity + quantity;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
            item_total: newQty * effectivePrice,
          };
          return updated;
        } else {
          const newItem: CartItem = {
            food_item_id: food.id,
            name: food.name,
            slug: food.slug,
            price: food.price,
            discount_price: food.discount_price,
            effective_price: effectivePrice,
            image_url: food.image_url,
            is_veg: food.is_veg,
            is_available: food.is_available,
            quantity,
            item_total: quantity * effectivePrice,
          };
          return [...prev, newItem];
        }
      });
    }

    setIsCartOpen(true);
  };

  const updateQuantity = async (foodItemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(foodItemId);
      return;
    }

    if (isAuthenticated) {
      try {
        const res = await api.updateCartItem(foodItemId, quantity);
        setItems(res.items || []);
      } catch (err) {
        console.error('Error updating quantity:', err);
      }
    } else {
      setItems((prev) =>
        prev.map((item) => {
          if (item.food_item_id === foodItemId) {
            return {
              ...item,
              quantity,
              item_total: quantity * item.effective_price,
            };
          }
          return item;
        })
      );
    }
  };

  const removeFromCart = async (foodItemId: number) => {
    if (isAuthenticated) {
      try {
        const res = await api.removeCartItem(foodItemId);
        setItems(res.items || []);
      } catch (err) {
        console.error('Error removing from cart:', err);
      }
    } else {
      setItems((prev) => prev.filter((item) => item.food_item_id !== foodItemId));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.clearCart();
      } catch (err) {
        console.error('Error clearing cart:', err);
      }
    }
    setItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.applyCoupon(code, subtotal);
      if (res.valid) {
        setCouponCode(res.code);
        setCouponDiscount(res.discount);
        return { success: true, message: res.message };
      }
      return { success: false, message: 'Invalid coupon' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Could not apply coupon' };
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        couponCode,
        couponDiscount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
