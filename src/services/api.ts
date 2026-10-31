import { AdminStatistics } from '../types';

const API_BASE = '/api';

export function getToken(): string | null {
  return localStorage.getItem('mm_token');
}

export function setToken(token: string) {
  localStorage.setItem('mm_token', token);
}

export function removeToken() {
  localStorage.removeItem('mm_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => request<any>('/auth/me'),
  updateProfile: (body: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Menu & Categories
  getCategories: () => request<{ categories: any[] }>('/categories'),
  getFoodItems: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    return request<{ items: any[] }>(`/food-items?${query.toString()}`);
  },
  getFeaturedItems: () => request<{ bestsellers: any[]; deals: any[] }>('/featured'),
  getFoodItemById: (id: string | number) => request<{ item: any }>(`/food-items/${id}`),

  // Cart
  getCart: () => request<{ items: any[]; summary: any }>('/cart'),
  updateCartItem: (foodItemId: number, quantity: number, instructions?: string) =>
    request<any>('/cart', {
      method: 'POST',
      body: JSON.stringify({ foodItemId, quantity, instructions }),
    }),
  removeCartItem: (foodItemId: number) => request<any>(`/cart/${foodItemId}`, { method: 'DELETE' }),
  clearCart: () => request<any>('/cart', { method: 'DELETE' }),
  syncCart: (localItems: any[]) =>
    request<any>('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ localItems }),
    }),

  // Addresses
  getAddresses: () => request<{ addresses: any[] }>('/addresses'),
  createAddress: (body: any) => request<{ address: any; message: string }>('/addresses', { method: 'POST', body: JSON.stringify(body) }),
  updateAddress: (id: number, body: any) => request<any>(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  setDefaultAddress: (id: number) => request<any>(`/addresses/${id}/default`, { method: 'PUT' }),
  deleteAddress: (id: number) => request<any>(`/addresses/${id}`, { method: 'DELETE' }),

  // Coupons
  getCoupons: () => request<{ coupons: any[] }>('/coupons'),
  applyCoupon: (code: string, subtotal: number) =>
    request<{ valid: boolean; code: string; discount: number; message: string }>('/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),

  // Orders
  createOrder: (body: any) => request<{ order: any; message: string }>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getUserOrders: () => request<{ orders: any[] }>('/orders'),
  trackOrder: (orderNumber: string) => request<{ order: any; steps: any[] }>(`/orders/${orderNumber}`),

  // Admin
  getAdminMetrics: () => request<{ metrics: any; recentOrders: any[]; topItems: any[] }>('/admin/metrics'),
  getAdminStatistics: () => request<AdminStatistics>('/admin/statistics'),
  getAdminOrders: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<{ orders: any[] }>(`/admin/orders?${query.toString()}`);
  },
  updateAdminOrderStatus: (id: number, body: any) =>
    request<any>(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
  createAdminFoodItem: (body: any) => request<any>('/admin/food-items', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminFoodItem: (id: number, body: any) => request<any>(`/admin/food-items/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAdminFoodItem: (id: number) => request<any>(`/admin/food-items/${id}`, { method: 'DELETE' }),
  createAdminCategory: (body: any) => request<any>('/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
  getAdminCoupons: () => request<{ coupons: any[] }>('/admin/coupons'),
  createAdminCoupon: (body: any) => request<any>('/admin/coupons', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminCoupon: (id: number, body: any) => request<any>(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAdminCoupon: (id: number) => request<any>(`/admin/coupons/${id}`, { method: 'DELETE' }),
  getAdminCustomers: () => request<{ customers: any[] }>('/admin/customers'),
};
