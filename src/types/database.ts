export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  available: boolean;
  canteen_id: string;
  nutritional_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Order {
  id: string;
  user_id: string;
  canteen_id: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
}

export interface Canteen {
  id: string;
  name: string;
  description: string | null;
  location: string;
  opening_time: string;
  closing_time: string;
  rating: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}