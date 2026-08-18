import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, CheckSquare, Square } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email or Username is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ email, password, rememberMe });
      showToast('Authentication Successful', 'Welcome back to Organisation Portal!', 'success');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Invalid credentials provided.';
      setErrorMessage(msg);
      showToast('Login Failed', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Organisation Sign In"
      subtitle="Enter your user credentials to access your organisation portal."
    >
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200">
          <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Email or Username"
          type="text"
          placeholder="admin@zordial.tech"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          label="Password"
          isPassword
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-xs my-1">
          <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="text-[#035352] focus:outline-none"
            >
              {rememberMe ? (
                <CheckSquare className="w-4 h-4 fill-[#035352] text-white" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <span>Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-bold text-[#035352] hover:underline focus:outline-none"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          rightIcon={<LogIn className="w-4 h-4" />}
          className="mt-2"
        >
          Sign In to Organisation
        </Button>

        <div className="text-center mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#035352] hover:underline">
            Register Organisation
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
