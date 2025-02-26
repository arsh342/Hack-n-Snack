import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthForm from './components/AuthForm';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import CanteenDashboard from './components/CanteenDashboard';
import Checkout from './components/Checkout';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/canteen-dashboard" element={<CanteenDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;