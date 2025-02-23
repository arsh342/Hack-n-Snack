import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables');
}

// Create and export the Supabase client
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

// Fetch Products for Regular Users (available products only)
export const getProducts = async (
  canteenId?: string,
  virtualOutletId?: string,
  filters: ProductFilter = {}
): Promise<Database['public']['Tables']['products']['Row'][]> => {
  try {
    let query = supabase
      .from('products')
      .select('id, name, price, available, canteen_id, description, image_url, category')
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

// Fetch Products for Canteen Dashboard (using the view or filtered products)
export const getCanteenProducts = async (
  canteenId?: string,
  filters: ProductFilter = {}
): Promise<Database['public']['Tables']['products']['Row'][]> => {
  try {
    let query = supabase
      .from('products')
      .select('id, name, price, available, canteen_id, description, image_url, category')
      .eq('available', true);

    if (canteenId) {
      query = query.eq('canteen_id', canteenId);
    }

    if (filters.category?.length) query = query.in('category', filters.category);
    if (filters.priceRange) {
      query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
    }
    if (filters.searchQuery) query = query.ilike('name', `%${filters.searchQuery}%`);
    if (filters.limit && filters.offset !== undefined) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch canteen products: ${error.message}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching canteen products:', error);
    throw error;
  }
};

// Fetch Canteen Dashboard Data (using the view)
export const getCanteenDashboard = async (
  canteenId?: string
): Promise<{
  products: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    category: string;
    available: boolean;
    canteen_id: string;
    canteen_name: string;
    total_orders: number;
  }[];
  orders: {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    user_id: string;
    order_items: { quantity: number; product: Database['public']['Tables']['products']['Row'] }[];
  }[];
}> => {
  try {
    // Fetch products from the canteen_dashboard view
    let productsQuery = supabase
      .from('canteen_dashboard')
      .select('*');

    if (canteenId) {
      productsQuery = productsQuery.eq('canteen_id', canteenId);
    }

    const { data: productsData, error: productsError } = await productsQuery;
    if (productsError) throw new Error(`Failed to fetch dashboard products: ${productsError.message}`);

    // Fetch orders for the canteen, including order items and products
    let ordersQuery = supabase
      .from('orders')
      .select(`
        id, user_id, canteen_id, status, total_amount, created_at,
        order_items (
          id, order_id, product_id, quantity, price,
          product:products (id, name, price, description, image_url, category)
        )
      `);

    if (canteenId) {
      ordersQuery = ordersQuery.eq('canteen_id', canteenId);
    }

    const { data: ordersData, error: ordersError } = await ordersQuery;
    if (ordersError) throw new Error(`Failed to fetch orders: ${ordersError.message}`);

    return {
      products: productsData || [],
      orders: ordersData?.map(order => ({
        ...order,
        order_items: order.order_items.map(item => ({
          quantity: item.quantity,
          product: item.product,
        })),
      })) || [],
    };
  } catch (error) {
    console.error('Error fetching canteen dashboard:', error);
    throw error;
  }
};

// Fetch Canteens (for admin or canteen staff to verify)
export const getCanteens = async (): Promise<Database['public']['Tables']['canteens']['Row'][]> => {
  try {
    const { data, error } = await supabase
      .from('canteens')
      .select('id, name, description, location');
    if (error) throw new Error(`Failed to fetch canteens: ${error.message}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching canteens:', error);
    throw error;
  }
};

// Update Order Status (for canteen staff)
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

// Add or Update Product (for canteen staff)
export const saveProduct = async (
  product: Partial<Database['public']['Tables']['products']['Insert']> & { id?: string }
): Promise<void> => {
  try {
    if (product.id) {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', product.id);
      if (error) throw new Error(`Failed to update product: ${error.message}`);
    } else {
      const { error } = await supabase
        .from('products')
        .insert([product as Database['public']['Tables']['products']['Insert']]);
      if (error) throw new Error(`Failed to insert product: ${error.message}`);
    }
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
};

// Delete Product (for canteen staff)
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw new Error(`Failed to delete product: ${error.message}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Toggle Favorite (for users)
export const toggleFavorite = async (userId: string, productId: string, isFavorite: boolean): Promise<void> => {
  try {
    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, product_id: productId });
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

// Create Order (for users)
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