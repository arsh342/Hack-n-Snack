/*
  # Initial Food4Code Platform Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `image_url` (text)
      - `category` (text)
      - `available` (boolean)
      - `canteen_id` (uuid, foreign key)
      - `created_at` (timestamp)

    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `canteen_id` (uuid, foreign key)
      - `status` (text)
      - `total_amount` (numeric)
      - `created_at` (timestamp)

    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (numeric)
      - `created_at` (timestamp)

    - `canteens`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `location` (text)
      - `opening_time` (time)
      - `closing_time` (time)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for each role
    - Secure access to sensitive data
*/

-- Create canteens table
CREATE TABLE canteens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text NOT NULL,
  opening_time time NOT NULL,
  closing_time time NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  image_url text,
  category text NOT NULL,
  available boolean DEFAULT true,
  canteen_id uuid REFERENCES canteens(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  canteen_id uuid REFERENCES canteens(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create order items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE canteens ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Canteen Policies
CREATE POLICY "Canteens are viewable by all users"
  ON canteens FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Canteens are editable by admin"
  ON canteens FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Product Policies
CREATE POLICY "Products are viewable by all users"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Products are editable by canteen staff"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'canteen'
    )
  );

-- Order Policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'admin' OR
        (auth.users.raw_user_meta_data->>'role' = 'canteen' AND canteen_id IN (
          SELECT id FROM canteens WHERE id = orders.canteen_id
        ))
      )
    )
  );

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order Items Policies
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND (
            auth.users.raw_user_meta_data->>'role' = 'admin' OR
            (auth.users.raw_user_meta_data->>'role' = 'canteen' AND orders.canteen_id IN (
              SELECT id FROM canteens WHERE id = orders.canteen_id
            ))
          )
        )
      )
    )
  );

CREATE POLICY "Users can create their own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );