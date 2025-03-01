# SnackSphere

<img src="https://i.postimg.cc/3Nt8Rtfq/kuch-vi.png" alt="SnackSphere Logo" width="150"/>  
*Elevate Your Snacking Experience*

## 🌟 Overview
SnackSphere is a modern e-commerce platform for snacks, featuring role-based access for users, canteens, and admins. Built with React, Next.js, Supabase, and Tailwind CSS, it offers seamless browsing, ordering, and management with responsive design and animations.



https://github.com/user-attachments/assets/cd99500b-cacd-4ec8-86c5-693711d9ab60


### Key Features
- User, canteen, and admin dashboards
- Product search, filtering, and ordering
- Secure auth (email, Google, phone OTP)
- Order tracking and payment options
- Responsive, animated UI

## 🛠 Technologies
- **Frontend**: React, Next.js, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, DB, APIs)
- **Routing**: React Router DOM
- **Icons**: lucide-react
- **Payments**: Stripe

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or Yarn
- Supabase account

### Installation
**Clone the repo**:
   ```bash
   git clone https://github.com/arsh342/Hack-n-Snack.git
   cd Hack-n-Snack
```

 🚀 Setup Guide

### Install Dependencies

```bash
npm install
```

### Set up Supabase
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Add the following to your `.env.local` file:

```env
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_URL=your-supabase-url
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
VITE_SOCKET_URL=your-socket-url
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### Run Locally
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173).

---

## 📋 Usage
- **Users**: Browse snacks, add to cart, and order.
- **Canteens**: Manage products, orders, refunds, and updates.
- **Admins**: Monitor users, canteens, orders, and revenue.

---

## 🎨 Design
- **Theme**: Green palette (`green-50`, `green-600`) with white/gray accents.
- **Responsiveness**: Fully mobile/tablet/desktop-friendly.
- **Animations**: Smooth transitions via Framer Motion.

---

## 🤝 Contributing
1. Fork the repo.
2. Create a feature branch.
3. Commit changes.
4. Submit a PR.

- Follow our **Code of Conduct**.
- Report issues on **GitHub Issues**.

---

## 📜 License
**MIT License** – See `LICENSE` for details.

