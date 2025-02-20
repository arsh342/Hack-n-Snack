import { Product, Canteen, Order } from '../types/database';

export const products: Product[] = [
  {
    id: '1',
    name: 'Hummus Crunch Salad',
    description: 'Fresh mixed greens with crispy chickpeas, cucumber, tomatoes, and house-made hummus',
    price: 13.99,
    category: 'Salads',
    image_url: '/api/placeholder/400/300',
    nutritional_info: {
      calories: 550,
      protein: 22,
      carbs: 45,
      fat: 32
    },
    available: true,
    canteen_id: '1'
  },
  {
    id: '2',
    name: 'Southwest Grilled Bowl',
    description: 'Grilled chicken, black beans, corn, avocado over quinoa with chipotle dressing',
    price: 14.99,
    category: 'Bowls',
    image_url: '/api/placeholder/400/300',
    nutritional_info: {
      calories: 620,
      protein: 38,
      carbs: 52,
      fat: 28
    },
    available: true,
    canteen_id: '1'
  },
  {
    id: '3',
    name: 'Thai Crunch Salad',
    description: 'Shredded cabbage, carrots, edamame, peanuts with Thai peanut dressing',
    price: 12.99,
    category: 'Salads',
    image_url: '/api/placeholder/400/300',
    nutritional_info: {
      calories: 480,
      protein: 18,
      carbs: 38,
      fat: 24
    },
    available: true,
    canteen_id: '2'
  },
  {
    id: '4',
    name: 'Mediterranean Bowl',
    description: 'Falafel, hummus, tabbouleh, mixed greens with tahini dressing',
    price: 13.99,
    category: 'Bowls',
    image_url: '/api/placeholder/400/300',
    nutritional_info: {
      calories: 520,
      protein: 20,
      carbs: 48,
      fat: 26
    },
    available: true,
    canteen_id: '2'
  }
];

export const canteens: Canteen[] = [
  {
    id: '1',
    name: 'Fresh Bites Canteen',
    description: 'Healthy and fresh meals made daily',
    location: 'Building A, Ground Floor',
    opening_time: '08:00',
    closing_time: '20:00',
    rating: 4.5
  },
  {
    id: '2',
    name: 'Green Bowl Kitchen',
    description: 'Specializing in nutritious bowls and salads',
    location: 'Building B, First Floor',
    opening_time: '09:00',
    closing_time: '21:00',
    rating: 4.7
  }
];

export const categories = [
  { id: 'all', name: 'All', icon: 'Utensils' },
  { id: 'salads', name: 'Salads', icon: 'Salad' },
  { id: 'bowls', name: 'Bowls', icon: 'Bowl' },
  { id: 'drinks', name: 'Drinks', icon: 'Coffee' },
  { id: 'snacks', name: 'Snacks', icon: 'Cookie' }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    user_id: 'user1',
    canteen_id: '1',
    status: 'pending',
    total_amount: 27.98,
    created_at: new Date().toISOString(),
    items: [
      { product_id: '1', quantity: 1, price: 13.99 },
      { product_id: '2', quantity: 1, price: 13.99 }
    ]
  },
  {
    id: '2',
    user_id: 'user2',
    canteen_id: '1',
    status: 'preparing',
    total_amount: 41.97,
    created_at: new Date().toISOString(),
    items: [
      { product_id: '1', quantity: 2, price: 27.98 },
      { product_id: '3', quantity: 1, price: 13.99 }
    ]
  }
];