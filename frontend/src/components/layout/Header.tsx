"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, User, X, ChefHat } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || "User";

  return (
    <header className="text-white shadow-lg" style={{ backgroundImage: "radial-gradient(#7fa154, #537b3f)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <ChefHat className="w-8 h-8 mr-2 text-green-100" />
            <h1 className="text-2xl font-bold">SnackSphere</h1>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user && (
              <div className="relative flex items-center gap-6">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-green-100/10 shadow-md">
                  <User size={18} className="text-green-100" />
                  <span className="text-sm font-medium text-green-50">Welcome, {userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/10 hover:bg-green-100/20 transition-all duration-200 shadow-md"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-green-100 hover:bg-green-100/10 transition-all duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`sm:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden bg-green-600`}
      >
        {user && (
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-100/10 shadow-md">
              <User size={20} />
              <span className="text-sm text-green-50">Welcome, {userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-100/10 hover:bg-green-100/20 transition-all duration-200 shadow-md"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;