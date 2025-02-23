// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Product Filters Interface
interface ProductFilter {
  category?: string[];
  priceRange?: [number, number];
  dietary?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
  };
  rating?: number;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

// Fetch Products with Filters
export const getProducts = async (
  canteenId?: string,
  virtualOutletId?: string,
  filters: ProductFilter = {}
): Promise<Database['public']['Tables']['products']['Row'][]> => {
  try {
    let query = supabase
      .from('products')
      .select('id, name, price, available, canteen_id') // Minimal fields, avoiding cuisine_type
      .eq('available', true);

    if (canteenId) query = query.eq('canteen_id', canteenId);
    if (virtualOutletId) query = query.eq('virtual_outlet_id', virtualOutletId);

    if (filters.category?.length) query = query.in('category', filters.category);
    if (filters.priceRange) {
      query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
    }
    if (filters.searchQuery) query = query.ilike('name', `%${filters.searchQuery}%`);
    if (filters.limit && filters.offset !== undefined) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch products: ${error.message}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Fetch Canteens
export const getCanteens = async (): Promise<Database['public']['Tables']['canteens']['Row'][]> => {
  try {
    const { data, error } = await supabase
      .from('canteens')
      .select('id, name'); // Minimal fields, avoiding rating
    if (error) throw new Error(`Failed to fetch canteens: ${error.message}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching canteens:', error);
    throw error;
  }
};

// Fetch Virtual Outlets
export const getVirtualOutlets = async (
  canteenId?: string
): Promise<Database['public']['Tables']['virtualOutlets']['Row'][]> => {
  try {
    let query = supabase
      .from('virtualOutlets')
      .select('id, name');
    if (canteenId) query = query.eq('canteen_id', canteenId);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch virtual outlets: ${error.message}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching virtual outlets:', error);
    throw error;
  }
};

// Fetch Distinct Categories
export const getCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .neq('category', null);

    if (error) throw new Error(`Failed to fetch categories: ${error.message}`);

    const uniqueCategories = Array.from(
      new Set(data?.map(item => item.category).filter(Boolean))
    );
    return uniqueCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Create Order
export const createOrder = async (
  order: Omit<Database['public']['Tables']['orders']['Insert'], 'id' | 'created_at'>,
  items: Omit<Database['public']['Tables']['order_items']['Insert'], 'id' | 'created_at' | 'order_id'>[]
): Promise<Database['public']['Tables']['orders']['Row']> => {
  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([order])
      .select('id, user_id, canteen_id, status, total_amount, created_at')
      .single();

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

    const orderItems = items.map(item => ({
      ...item,
      order_id: orderData.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw new Error(`Failed to insert order items: ${itemsError.message}`);

    return orderData;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Fetch Orders
export const getOrders = async (
  userId?: string,
  canteenId?: string,
  virtualOutletId?: string
): Promise<Database['public']['Tables']['orders']['Row'][]> => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        id, user_id, canteen_id, status, total_amount, created_at,
        order_items (
          id, order_id, product_id, quantity, price,
          product:products (id, name, price)
        )
      `);

    if (userId) query = query.eq('user_id', userId);
    if (canteenId) query = query.eq('canteen_id', canteenId);
    if (virtualOutletId) query = query.eq('virtual_outlet_id', virtualOutletId);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Update Order Status
export const updateOrderStatus = async (
  orderId: string,
  status: Database['public']['Tables']['orders']['Row']['status']
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw new Error(`Failed to update order status: ${error.message}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Fetch User Favorites (Placeholder)
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  try {
    return []; // Placeholder until favorites table exists
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
};

// Add or Remove Favorite (Placeholder)
export const toggleFavorite = async (
  userId: string,
  productId: string,
  isFavorite: boolean
): Promise<void> => {
  try {
    console.log(`Favorites toggle not implemented yet: ${userId}, ${productId}, ${isFavorite}`);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};