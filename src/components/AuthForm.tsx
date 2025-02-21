import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, Mail, ChefHat, Users, Building2, Phone } from 'lucide-react';
import { AuthState, UserRole } from '../types/auth';
import { supabase } from '../lib/supabase';
import { GoogleLogin } from '@react-oauth/google';

const AuthForm = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [formState, setFormState] = useState<AuthState>({
    email: '',
    password: '',
    role: 'user',
    phone: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');

  const validateEmail = (email: string, role: UserRole): boolean => {
    if (role === 'canteen' && !email.endsWith('@canteen.in')) {
      toast.error('Canteen email must end with @canteen.in');
      return false;
    }
    if (role === 'admin' && !email.endsWith('@organization.in')) {
      toast.error('Admin email must end with @organization.in');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (showPhoneAuth) {
        if (!verificationCode) {
          // Send OTP
          const { data, error } = await supabase.auth.signInWithOtp({
            phone: formState.phone
          });
          if (error) throw error;
          setVerificationId(data.session?.user?.id || '');
          toast.success('Verification code sent to your phone');
        } else {
          // Verify OTP
          const { error } = await supabase.auth.verifyOtp({
            phone: formState.phone,
            token: verificationCode,
            type: 'sms'
          });
          if (error) throw error;
          navigate('/user-dashboard');
        }
        return;
      }

      // Email validation for non-phone auth
      if (!showPhoneAuth && !validateEmail(formState.email, formState.role)) {
        return;
      }

      if (showForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(formState.email);
        if (error) throw error;
        toast.success('Password reset link sent to your email');
        setShowForgotPassword(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });
        if (error) throw error;
        
        // Navigate based on role
        switch (formState.role) {
          case 'user':
            navigate('/user-dashboard');
            break;
          case 'canteen':
            navigate('/canteen-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: formState.email,
          password: formState.password,
          options: {
            data: {
              role: formState.role,
            }
          }
        });
        if (error) throw error;
        toast.success('Registration successful! Please check your email.');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });
      
      if (error) throw error;
      navigate('/user-dashboard');
    } catch (error) {
      toast.error('Google login failed');
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormState(prev => ({ ...prev, role, email: '' }));
  };

  const togglePhoneAuth = () => {
    setShowPhoneAuth(!showPhoneAuth);
    setVerificationCode('');
    setFormState(prev => ({ ...prev, phone: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {showForgotPassword ? 'Reset Password' : isLogin ? 'Sign in to your account' : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!showForgotPassword && !showPhoneAuth && (
            <div className="flex justify-center space-x-4 mb-6">
              <RoleButton
                icon={<Users size={20} />}
                role="user"
                active={formState.role === 'user'}
                onClick={() => handleRoleChange('user')}
              />
              <RoleButton
                icon={<ChefHat size={20} />}
                role="canteen"
                active={formState.role === 'canteen'}
                onClick={() => handleRoleChange('canteen')}
              />
              <RoleButton
                icon={<Building2 size={20} />}
                role="admin"
                active={formState.role === 'admin'}
                onClick={() => handleRoleChange('admin')}
              />
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {showPhoneAuth ? (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="+1234567890"
                      value={formState.phone}
                      onChange={(e) => setFormState(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                {verificationId && (
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                      Verification Code
                    </label>
                    <input
                      id="code"
                      name="code"
                      type="text"
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder={`Email address${formState.role === 'canteen' ? ' (@canteen.in)' : formState.role === 'admin' ? ' (@organization.in)' : ''}`}
                      value={formState.email}
                      onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                {!showForgotPassword && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Password"
                        value={formState.password}
                        onChange={(e) => setFormState(prev => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm">
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
                  {showPhoneAuth ? 'Use email instead' : showForgotPassword ? 'Back to login' : 'Forgot your password?'}
                </button>
              </div>
              {!showForgotPassword && !showPhoneAuth && (
                <div className="text-sm">
                  <button
                    type="button"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? 'Create an account' : 'Already have an account?'}
                  </button>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showPhoneAuth
                  ? verificationId
                    ? 'Verify Code'
                    : 'Send Code'
                  : showForgotPassword
                  ? 'Send reset link'
                  : isLogin
                  ? 'Sign in'
                  : 'Sign up'}
              </button>
            </div>
          </form>

          {!showForgotPassword && !showPhoneAuth && formState.role === 'user' && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div>
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => toast.error('Google login failed')}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={togglePhoneAuth}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    <span>Phone</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const RoleButton = ({ icon, role, active, onClick }) => (
  <button
    type="button"
    className={`p-3 rounded-lg flex items-center justify-center ${
      active ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
    } hover:bg-indigo-50 transition-colors`}
    onClick={onClick}
  >
    {icon}
  </button>
);

export default AuthForm;