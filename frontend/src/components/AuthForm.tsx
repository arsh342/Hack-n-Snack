"use client";

import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Lock, Mail, ChefHat, Users, Building2, Phone, User } from "lucide-react";
import type { UserRole } from "../types/auth";
import { supabase } from "../lib/supabase";
import { GoogleLogin } from "@react-oauth/google";

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
    setIsLogin(true); // Reset to login view when changing role
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
    <div className="h-screen bg-white flex flex-col justify-center py-6 sm:py-8 overflow-hidden">
      <div className="relative flex-1 flex items-center">
        <div className="relative px-4 mx-auto max-w-[1200px] w-full">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-3xl text-white flex flex-col justify-between md:col-span-2 lg:col-span-1 shadow-lg">
              <div>
                <h1 className="text-2xl font-bold mb-4">Welcome to SnackSphere</h1>
                <p className="text-green-100 text-sm mb-4">Join our platform to elevate your snacking experience.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => handleRoleChange("user")}
                  className="flex items-center gap-3 text-sm text-green-100 hover:text-green-200 transition-colors duration-200 w-full text-left"
                >
                  <Users className="w-4 h-4" />
                  <span>Join as a User</span>
                </button>
                <button
                  onClick={() => handleRoleChange("canteen")}
                  className="flex items-center gap-3 text-sm text-green-100 hover:text-green-200 transition-colors duration-200 mt-2 w-full text-left"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Register your Canteen</span>
                </button>
                <button
                  onClick={() => handleRoleChange("admin")}
                  className="flex items-center gap-3 text-sm text-green-100 hover:text-green-200 transition-colors duration-200 mt-2 w-full text-left"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Admin Portal</span>
                </button>
              </div>
            </div>

            <div className="bg-green-100 p-6 rounded-3xl shadow-xl lg:col-span-2 border border-green-200 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {showForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Get Started Free"}
                </h2>

                {!showForgotPassword && !showPhoneAuth && (
                  <div className="flex justify-start gap-3 mb-6">
                    <RoleButton
                      icon={<Users size={18} />}
                      role="user"
                      active={formState.role === "user"}
                      onClick={() => handleRoleChange("user")}
                    />
                    <RoleButton
                      icon={<ChefHat size={18} />}
                      role="canteen"
                      active={formState.role === "canteen"}
                      onClick={() => handleRoleChange("canteen")}
                    />
                    <RoleButton
                      icon={<Building2 size={18} />}
                      role="admin"
                      active={formState.role === "admin"}
                      onClick={() => handleRoleChange("admin")}
                    />
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {showPhoneAuth ? (
                    <>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            className="pl-10 w-full rounded-xl border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent py-2 bg-green-50 text-gray-800 shadow-sm transition-all duration-200"
                            placeholder="+1234567890"
                            value={formState.phone}
                            onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                            disabled={verificationSent}
                          />
                        </div>
                      </div>
                      {verificationSent && (
                        <div>
                          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                            Verification Code
                          </label>
                          <input
                            id="code"
                            name="code"
                            type="text"
                            required
                            className="w-full rounded-xl border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent py-2 bg-green-50 text-gray-800 shadow-sm transition-all duration-200"
                            placeholder="Enter verification code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {!isLogin && (
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              id="name"
                              name="name"
                              type="text"
                              required={!isLogin}
                              className="pl-10 w-full rounded-xl border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent py-2 bg-green-50 text-gray-800 shadow-sm transition-all duration-200"
                              placeholder="Enter your name"
                              value={formState.name}
                              onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                              disabled={isLogin || showForgotPassword}
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="pl-10 w-full rounded-xl border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent py-2 bg-green-50 text-gray-800 shadow-sm transition-all duration-200"
                            placeholder={`Email address${formState.role === "canteen" ? " (@canteen.in)" : formState.role === "admin" ? " (@organization.in)" : ""}`}
                            value={formState.email}
                            onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                      </div>

                      {!showForgotPassword && (
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              id="password"
                              name="password"
                              type="password"
                              required
                              className="pl-10 w-full rounded-xl border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent py-2 bg-green-50 text-gray-800 shadow-sm transition-all duration-200"
                              placeholder="Enter your password"
                              value={formState.password}
                              onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      className="font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
                      onClick={() => {
                        if (showPhoneAuth) {
                          togglePhoneAuth();
                        } else {
                          setShowForgotPassword(!showForgotPassword);
                        }
                      }}
                    >
                      {showPhoneAuth ? "Use email instead" : showForgotPassword ? "Back to login" : "Forgot password?"}
                    </button>
                    {!showForgotPassword && !showPhoneAuth && (
                      <button
                        type="button"
                        className="font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
                        onClick={() => setIsLogin(!isLogin)}
                      >
                        {isLogin ? "Create account" : "Sign in instead"}
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium shadow-md text-sm"
                  >
                    {showPhoneAuth
                      ? verificationSent
                        ? "Verify Code"
                        : "Send Code"
                      : showForgotPassword
                        ? "Send reset link"
                        : isLogin
                          ? "Sign in"
                          : "Create account"}
                  </button>
                </form>

                {!showForgotPassword && !showPhoneAuth && formState.role === "user" && (
                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-green-200" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-green-100 text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                      <div className="w-full border border-gray-300 rounded-md bg-white shadow-sm hover:bg-gray-50 transition-all duration-200">
                        <GoogleLogin
                          onSuccess={handleGoogleLogin}
                          onError={() => toast.error("Google login failed")}
                          width="100%"
                          size="large"
                          shape="rectangular"
                          theme="outline"
                          text="continue_with"
                          logo_alignment="left"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={togglePhoneAuth}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                      >
                        <Phone className="h-5 w-5 mr-2 text-gray-500" />
                        <span>Continue with Phone</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RoleButtonProps {
  icon: React.ReactNode;
  role: UserRole;
  active: boolean;
  onClick: () => void;
}

const RoleButton = ({ icon, active, onClick }: RoleButtonProps) => (
  <button
    type="button"
    className={`p-2 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm ${
      active ? "bg-green-200 text-green-600" : "bg-green-50 text-gray-600 hover:bg-green-100"
    }`}
    onClick={onClick}
  >
    {icon}
  </button>
);

export default AuthForm;