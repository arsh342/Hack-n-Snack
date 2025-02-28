"use client";

import type React from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/50 to-white">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-0">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;