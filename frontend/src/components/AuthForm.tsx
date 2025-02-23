"use client";

import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Lock, Mail, ChefHat, Users, Building2, Phone } from "lucide-react";
import type { UserRole } from "../types/auth"; // Removed AuthState from import since we'll define it here
import { supabase } from "../lib/supabase";
import { GoogleLogin } from "@react-oauth/google";

// Define AuthState interface directly in this file
interface AuthState {
  email: string;
  password: string;
  name: string; // Added name to the interface
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
      toast.error("Canteen email must end with @canteen.in");
      return false;
    }
    if (role === "admin" && !email.endsWith("@organization.in")) {
      toast.error("Admin email must end with @organization.in");
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
          toast.success("Verification code sent to your phone");
        } else {
          const { error } = await supabase.auth.verifyOtp({
            phone: formState.phone,
            token: verificationCode,
            type: "sms",
          });
          if (error) throw error;
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
        toast.success("Password reset link sent to your email");
        setShowForgotPassword(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });
        if (error) throw error;

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
          toast.error("Please enter your name");
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
        toast.success("Registration successful! Please check your email.");
      }
    } catch (error: any) { // Added type annotation for error
      toast.error(error.message || "An error occurred");
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
      navigate("/user-dashboard");
    } catch (error: any) { // Added type annotation for error
      toast.error("Google login failed");
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormState((prev) => ({ ...prev, role, email: "", name: "" }));
  };

  const togglePhoneAuth = () => {
    setShowPhoneAuth(!showPhoneAuth);
    setVerificationCode("");
    setVerificationSent(false);
    setFormState((prev) => ({ ...prev, phone: "", name: "" }));
  };

  // Rest of the JSX remains the same
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col justify-center py-6 sm:py-12">
      <div className="relative sm:py-16">
        <div className="relative px-4 mx-auto max-w-[1200px]">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-3xl text-white flex flex-col justify-between md:col-span-2 lg:col-span-1">
              <div>
                <h1 className="text-3xl font-bold mb-6">Welcome to FoodTech</h1>
                <p className="text-indigo-100 mb-4">Join our platform to revolutionize your dining experience.</p>
              </div>
              <div className="mt-8">
                <div className="flex items-center gap-4 text-sm text-indigo-100">
                  <Users className="w-5 h-5" />
                  <span>Join as a User</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-indigo-100 mt-3">
                  <ChefHat className="w-5 h-5" />
                  <span>Register your Canteen</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-indigo-100 mt-3">
                  <Building2 className="w-5 h-5" />
                  <span>Admin Portal</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl lg:col-span-2">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  {showForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Get started free"}
                </h2>

                {!showForgotPassword && !showPhoneAuth && (
                  <div className="flex justify-start gap-4 mb-8">
                    <RoleButton
                      icon={<Users size={20} />}
                      role="user"
                      active={formState.role === "user"}
                      onClick={() => handleRoleChange("user")}
                    />
                    <RoleButton
                      icon={<ChefHat size={20} />}
                      role="canteen"
                      active={formState.role === "canteen"}
                      onClick={() => handleRoleChange("canteen")}
                    />
                    <RoleButton
                      icon={<Building2 size={20} />}
                      role="admin"
                      active={formState.role === "admin"}
                      onClick={() => handleRoleChange("admin")}
                    />
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {showPhoneAuth ? (
                    <>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            className="pl-12 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent py-3"
                            placeholder="+1234567890"
                            value={formState.phone}
                            onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                            disabled={verificationSent}
                          />
                        </div>
                      </div>
                      {verificationSent && (
                        <div>
                          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                          </label>
                          <input
                            id="code"
                            name="code"
                            type="text"
                            required
                            className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent py-3"
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
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required={!isLogin}
                            className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent py-3"
                            placeholder="Enter your full name"
                            value={formState.name}
                            onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                            disabled={isLogin || showForgotPassword}
                          />
                        </div>
                      )}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="pl-12 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent py-3"
                            placeholder={`Email address${formState.role === "canteen" ? " (@canteen.in)" : formState.role === "admin" ? " (@organization.in)" : ""}`}
                            value={formState.email}
                            onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                      </div>

                      {!showForgotPassword && (
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              id="password"
                              name="password"
                              type="password"
                              required
                              className="pl-12 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent py-3"
                              placeholder="Enter your password"
                              value={formState.password}
                              onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
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
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                        onClick={() => setIsLogin(!isLogin)}
                      >
                        {isLogin ? "Create account" : "Sign in instead"}
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
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
                  <div className="mt-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="w-full">
                        <GoogleLogin onSuccess={handleGoogleLogin} onError={() => toast.error("Google login failed")} />
                      </div>
                      <button
                        type="button"
                        onClick={togglePhoneAuth}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <Phone className="h-5 w-5 mr-2" />
                        <span>Phone</span>
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

// Define props interface for RoleButton
interface RoleButtonProps {
  icon: React.ReactNode;
  role: UserRole;
  active: boolean;
  onClick: () => void;
}

const RoleButton = ({ icon, active, onClick }: RoleButtonProps) => (
  <button
    type="button"
    className={`p-3 rounded-xl flex items-center justify-center transition-colors ${
      active ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
    onClick={onClick}
  >
    {icon}
  </button>
);

export default AuthForm;