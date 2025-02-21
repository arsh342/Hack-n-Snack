export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  available: boolean;
  canteen_id: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  canteen_id: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Canteen {
  id: string;
  name: string;
  description: string | null;
  location: string;
  opening_time: string;
  closing_time: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}