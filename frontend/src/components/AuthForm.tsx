"use client";

import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Lock, Mail, ChefHat, Users, Building2, Phone, User } from "lucide-react";
import type { UserRole } from "../types/auth";
import { supabase } from "../lib/supabase";
import { GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";

interface AuthState {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone: string;
}

const AuthForm = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [formState, setFormState] = useState<AuthState>({
    email: "",
    password: "",
    name: "",
    role: "user",
    phone: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const validateEmail = (email: string, role: UserRole): boolean => {
    if (role === "canteen" && !email.endsWith("@canteen.in")) {
      toast.error("Canteen email must end with @canteen.in", {
        style: { background: "#fee2e2", color: "#991b1b" },
        icon: "❌",
      });
      return false;
    }
    if (role === "admin" && !email.endsWith("@organization.in")) {
      toast.error("Admin email must end with @organization.in", {
        style: { background: "#fee2e2", color: "#991b1b" },
        icon: "❌",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (showPhoneAuth) {
        if (!verificationSent) {
          const { error } = await supabase.auth.signInWithOtp({
            phone: formState.phone,
          });
          if (error) throw error;
          setVerificationSent(true);
          toast.success("Verification code sent to your phone!", {
            style: { background: "#dcfce7", color: "#166534" },
            icon: "📱",
          });
        } else {
          const { error } = await supabase.auth.verifyOtp({
            phone: formState.phone,
            token: verificationCode,
            type: "sms",
          });
          if (error) throw error;
          toast.success("Successfully logged in with phone!", {
            style: { background: "#dcfce7", color: "#166534" },
            icon: "✅",
          });
          navigate("/user-dashboard");
        }
        return;
      }

      if (!showPhoneAuth && !validateEmail(formState.email, formState.role)) {
        return;
      }

      if (showForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(formState.email);
        if (error) throw error;
        toast.success("Password reset link sent to your email!", {
          style: { background: "#dcfce7", color: "#166534" },
          icon: "✉️",
        });
        setShowForgotPassword(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });
        if (error) throw error;
        toast.success(`Welcome back! Logged in as ${formState.role}`, {
          style: { background: "#dcfce7", color: "#166534" },
          icon: "✅",
        });

        switch (formState.role) {
          case "user":
            navigate("/user-dashboard");
            break;
          case "canteen":
            navigate("/canteen-dashboard");
            break;
          case "admin":
            navigate("/admin-dashboard");
            break;
        }
      } else {
        if (!formState.name.trim()) {
          toast.error("Please enter your name", {
            style: { background: "#fee2e2", color: "#991b1b" },
            icon: "❌",
          });
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: formState.email,
          password: formState.password,
          options: {
            data: {
              role: formState.role,
              full_name: formState.name,
            },
          },
        });
        if (error) throw error;
        toast.success("Registration successful! Please check your email.", {
          style: { background: "#dcfce7", color: "#166534" },
          icon: "✅",
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Wrong credentials or an error occurred", {
        style: { background: "#fee2e2", color: "#991b1b" },
        icon: "❌",
      });
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credentialResponse.credential,
      });

      if (error) throw error;

      const nameFromGoogle = data.user?.user_metadata?.name || data.user?.user_metadata?.given_name || "";
      if (!data.user?.user_metadata?.full_name && nameFromGoogle) {
        await supabase.auth.updateUser({
          data: { full_name: nameFromGoogle },
        });
      }
      toast.success("Logged in with Google successfully!", {
        style: { background: "#dcfce7", color: "#166534" },
        icon: "✅",
      });
      navigate("/user-dashboard");
    } catch (error: any) {
      toast.error("Google login failed", {
        style: { background: "#fee2e2", color: "#991b1b" },
        icon: "❌",
      });
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormState((prev) => ({ ...prev, role, email: "", name: "" }));
    setIsLogin(true);
    setShowForgotPassword(false);
    setShowPhoneAuth(false);
  };

  const togglePhoneAuth = () => {
    setShowPhoneAuth(!showPhoneAuth);
    setVerificationCode("");
    setVerificationSent(false);
    setFormState((prev) => ({ ...prev, phone: "", name: "" }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center py-6 sm:py-12"
    >
      <div className="relative w-full max-w-5xl mx-4 sm:mx-6 lg:mx-auto">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md bg-white/80 border border-green-200/50"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        >
          {/* Left Section */}
          <motion.div
            className="bg-gradient-to-br from-green-600 to-green-700 p-6 sm:p-8 text-white flex flex-col justify-between rounded-3xl lg:rounded-r-none"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 sm:mb-6">
                SnackSphere
              </h1>
              <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-green-100/90">
                Discover a world of flavors and elevate your snacking journey with us.
              </p>
            </div>
            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
              {["user", "canteen", "admin"].map((role) => (
                <motion.button
                  key={role}
                  onClick={() => handleRoleChange(role as UserRole)}
                  className={`w-full flex items-center gap-3 sm:gap-4 px-4 py-2 sm:py-3 rounded-xl text-left text-sm sm:text-base font-medium transition-all duration-300 ${
                    formState.role === role
                      ? "bg-green-100/20 text-white shadow-lg"
                      : "text-green-100 hover:bg-green-100/10 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {role === "user" && <Users className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {role === "canteen" && <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {role === "admin" && <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span>
                    {role === "user" && "Join as a User"}
                    {role === "canteen" && "Register Your Canteen"}
                    {role === "admin" && "Admin Portal"}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right Section */}
          <motion.div
            className="p-6 sm:p-8 md:p-10 flex flex-col justify-center"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              <motion.h2
                key={showForgotPassword ? "reset" : isLogin ? "login" : "signup"}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center"
              >
                {showForgotPassword ? "Reset Your Password" : isLogin ? "Welcome Back" : "Join the SnackSphere"}
              </motion.h2>
            </AnimatePresence>

            {!showForgotPassword && !showPhoneAuth && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8"
              >
                <RoleButton
                  icon={<Users size={20} sm:size={24} />}
                  role="user"
                  active={formState.role === "user"}
                  onClick={() => handleRoleChange("user")}
                />
                <RoleButton
                  icon={<ChefHat size={20} sm:size={24} />}
                  role="canteen"
                  active={formState.role === "canteen"}
                  onClick={() => handleRoleChange("canteen")}
                />
                <RoleButton
                  icon={<Building2 size={20} sm:size={24} />}
                  role="admin"
                  active={formState.role === "admin"}
                  onClick={() => handleRoleChange("admin")}
                />
              </motion.div>
            )}

            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {showPhoneAuth ? (
                  <>
                    <motion.div
                      key="phone"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          className="pl-10 sm:pl-12 w-full rounded-xl border-green-200 bg-green-50 text-gray-800 py-2 sm:py-3 px-3 sm:px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
                          placeholder="+1234567890"
                          value={formState.phone}
                          onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                          disabled={verificationSent}
                        />
                      </div>
                    </motion.div>
                    {verificationSent && (
                      <motion.div
                        key="code"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label htmlFor="code" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Verification Code
                        </label>
                        <div className="relative">
                          <input
                            id="code"
                            name="code"
                            type="text"
                            required
                            className="w-full rounded-xl border-green-200 bg-green-50 text-gray-800 py-2 sm:py-3 px-3 sm:px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
                            placeholder="Enter verification code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <>
                    {!isLogin && (
                      <motion.div
                        key="name"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                          </div>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required={!isLogin}
                            className="pl-10 sm:pl-12 w-full rounded-xl border-green-200 bg-green-50 text-gray-800 py-2 sm:py-3 px-3 sm:px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="Enter your name"
                            value={formState.name}
                            onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                            disabled={isLogin || showForgotPassword}
                          />
                        </div>
                      </motion.div>
                    )}
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: !isLogin ? 0.1 : 0 }}
                    >
                      <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          className="pl-10 sm:pl-12 w-full rounded-xl border-green-200 bg-green-50 text-gray-800 py-2 sm:py-3 px-3 sm:px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
                          placeholder={`Email address${formState.role === "canteen" ? " (@canteen.in)" : formState.role === "admin" ? " (@organization.in)" : ""}`}
                          value={formState.email}
                          onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </motion.div>
                    {!showForgotPassword && (
                      <motion.div
                        key="password"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: !isLogin ? 0.2 : 0.1 }}
                      >
                        <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                          </div>
                          <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="pl-10 sm:pl-12 w-full rounded-xl border-green-200 bg-green-50 text-gray-800 py-2 sm:py-3 px-3 sm:px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
                            placeholder="Enter your password"
                            value={formState.password}
                            onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                          />
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </AnimatePresence>

              <motion.div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm space-y-2 sm:space-y-0 sm:space-x-4 mt-2 sm:mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <button
                  type="button"
                  className="relative text-green-600 font-medium group hover:text-green-700 transition-colors duration-300"
                  onClick={() => {
                    if (showPhoneAuth) {
                      togglePhoneAuth();
                    } else {
                      setShowForgotPassword(!showForgotPassword);
                    }
                  }}
                >
                  {showPhoneAuth ? "Use email instead" : showForgotPassword ? "Back to login" : "Forgot password?"}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </button>
                {!showForgotPassword && !showPhoneAuth && (
                  <button
                    type="button"
                    className="relative text-green-600 font-medium group hover:text-green-700 transition-colors duration-300"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? "Create account" : "Sign in instead"}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </button>
                )}
              </motion.div>

              <motion.button
                type="submit"
                className="w-full bg-green-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-medium shadow-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 text-sm sm:text-base"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(34, 197, 94, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.4 }}
              >
                {showPhoneAuth
                  ? verificationSent
                    ? "Verify Code"
                    : "Send Code"
                  : showForgotPassword
                    ? "Send Reset Link"
                    : isLogin
                      ? "Sign In"
                      : "Create Account"}
              </motion.button>

              {!showForgotPassword && !showPhoneAuth && formState.role === "user" && (
                <motion.div
                  className="mt-4 sm:mt-6 md:mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                >
                  <div className="relative my-4 sm:my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-green-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 sm:px-4 py-1 bg-green-100/80 text-gray-600 text-xs sm:text-sm font-medium rounded-full shadow-sm">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:gap-4">
                    <motion.div
                      className="w-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="w-full">
                        <GoogleLogin
                          onSuccess={handleGoogleLogin}
                          onError={() => toast.error("Google login failed")}
                          width="100%"
                        />
                      </div>
                    </motion.div>
                    <motion.button
                      type="button"
                      onClick={togglePhoneAuth}
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-1 sm:py-2 border border-green-200 rounded-xl bg-green-50 text-gray-700 hover:bg-green-100 transition-all duration-300 shadow-sm text-xs sm:text-sm"
                      whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(34, 197, 94, 0.1)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      <span>Phone</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

interface RoleButtonProps {
  icon: React.ReactNode;
  role: UserRole;
  active: boolean;
  onClick: () => void;
}

const RoleButton = ({ icon, active, onClick }: RoleButtonProps) => (
  <motion.button
    type="button"
    className={`p-2 sm:p-3 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
      active
        ? "bg-green-600 text-white"
        : "bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700"
    }`}
    onClick={onClick}
    whileHover={{ scale: 1.1, rotate: 5 }}
    whileTap={{ scale: 0.9 }}
  >
    {icon}
  </motion.button>
);

export default AuthForm;