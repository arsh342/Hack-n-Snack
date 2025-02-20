// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthForm from './components/AuthForm';
import UserDashboard from './components/UserDashboard';
import CanteenDashboard from './components/CanteenDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/canteen-dashboard" element={<CanteenDashboard/>} />
        <Route path="/admin-dashboard" element={<AdminDashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;