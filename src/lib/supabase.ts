import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const getProducts = async (canteenId?: string) => {
  const query = supabase
    .from('products')
    .select('*')
    .eq('available', true);

  if (canteenId) {
    query.eq('canteen_id', canteenId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getCanteens = async () => {
  const { data, error } = await supabase
    .from('canteens')
    .select('*');
  if (error) throw error;
  return data;
};

export const createOrder = async (order: Omit<Order, 'id' | 'created_at'>, items: Omit<OrderItem, 'id' | 'created_at' | 'order_id'>[]) => {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map(item => ({
    ...item,
    order_id: orderData.id
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return orderData;
};

export const getOrders = async (userId?: string, canteenId?: string) => {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (canteenId) {
    query = query.eq('canteen_id', canteenId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  
  if (error) throw error;
};