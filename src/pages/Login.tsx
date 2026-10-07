import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, CheckSquare, Square, Building2, UserCheck, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, hostLogin, setHostNewPassword } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'admin' | 'host'>('admin');

  // Admin form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Host form state
  const [hostIdentifier, setHostIdentifier] = useState('');
  const [hostPassword, setHostPassword] = useState('');

  // First Login (Set New Password) state
  const [isFirstLoginStep, setIsFirstLoginStep] = useState(false);
  const [firstLoginHost, setFirstLoginHost] = useState<{ id: number | string; full_name: string; email: string; organisation_name?: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateAdmin = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Email or Username is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateHost = () => {
    const newErrors: { hostIdentifier?: string; hostPassword?: string } = {};
    if (!hostIdentifier.trim()) newErrors.hostIdentifier = 'Host ID or Email is required';
    if (!hostPassword) newErrors.hostPassword = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSetPassword = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    if (!newPassword || newPassword.trim().length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validateAdmin()) return;

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

  const handleHostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validateHost()) return;

    setIsLoading(true);
    try {
      const res = await hostLogin({
        identifier: hostIdentifier,
        password: hostPassword,
        rememberMe
      });

      if (res.requiresNewPassword && res.host) {
        setFirstLoginHost(res.host);
        setIsFirstLoginStep(true);
        showToast('First-Time Login', 'Please create your permanent password to continue.', 'info');
        return;
      }

      showToast('Welcome Back', 'Logged in as Host successfully!', 'success');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Invalid host credentials.';
      setErrorMessage(msg);
      showToast('Host Login Failed', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validateSetPassword() || !firstLoginHost) return;

    setIsLoading(true);
    try {
      await setHostNewPassword({
        hostId: firstLoginHost.id,
        email: firstLoginHost.email,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      showToast('Password Set Successfully', 'Welcome to your Host Dashboard!', 'success');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to set new password.';
      setErrorMessage(msg);
      showToast('Password Update Failed', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={isFirstLoginStep ? "Set Host Password" : "Organisation Portal"}
      subtitle={
        isFirstLoginStep
          ? `Welcome ${firstLoginHost?.full_name || 'Host'}! Please set your new password to proceed.`
          : "Sign in with your organisation credentials to access your dashboard."
      }
    >
      {/* FIRST TIME LOGIN: SET NEW PASSWORD VIEW */}
      {isFirstLoginStep ? (
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#035352] text-[#F3E8BC] shrink-0 mt-0.5 shadow-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-extrabold text-[#035352] text-sm">Create Permanent Password</p>
              <p className="text-slate-600 mt-1 leading-relaxed">
                You are logging in for the first time. For security, temporary passwords cannot be reused. Please set your permanent login password.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSetPasswordSubmit} className="flex flex-col gap-4">
            <Input
              label="New Password"
              isPassword
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              error={errors.newPassword}
              autoComplete="new-password"
            />

            <Input
              label="Confirm New Password"
              isPassword
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<ShieldCheck className="w-4 h-4 text-slate-400" />}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<LogIn className="w-4 h-4" />}
              className="mt-2"
            >
              Set Password & Access Dashboard
            </Button>

            <button
              type="button"
              onClick={() => {
                setIsFirstLoginStep(false);
                setNewPassword('');
                setConfirmPassword('');
                setErrorMessage('');
              }}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </form>
        </div>
      ) : (
        /* STANDARD DUAL TAB LOGIN VIEW */
        <div>
          {/* TAB SWITCHER */}
          <div className="flex bg-slate-100/90 p-1 rounded-xl mb-6 border border-slate-200/80 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMessage('');
                setErrors({});
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-[#035352] shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeTab === 'admin' ? 'text-[#035352]' : 'text-slate-400'}`} />
              <span>Admin / Staff</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('host');
                setErrorMessage('');
                setErrors({});
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'host'
                  ? 'bg-[#035352] text-white shadow-sm shadow-[#035352]/20'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserCheck className={`w-4 h-4 ${activeTab === 'host' ? 'text-[#F3E8BC]' : 'text-slate-400'}`} />
              <span>Host Login</span>
            </button>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200">
              <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ADMIN FORM */}
          {activeTab === 'admin' ? (
            <form onSubmit={handleAdminSubmit} className="flex flex-col gap-5">
              <Input
                label="Admin Email or Username"
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
            </form>
          ) : (
            /* HOST FORM */
            <form onSubmit={handleHostSubmit} className="flex flex-col gap-5">
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#035352] shrink-0" />
                <span>Login using your assigned <strong>Host ID</strong> or registered <strong>Email</strong>.</span>
              </div>

              <Input
                label="Host ID or Email"
                type="text"
                placeholder="e.g. 101 or host@company.com"
                value={hostIdentifier}
                onChange={(e) => setHostIdentifier(e.target.value)}
                leftIcon={<UserCheck className="w-4 h-4 text-slate-400" />}
                error={errors.hostIdentifier}
                autoComplete="username"
              />

              <Input
                label="Host Password"
                isPassword
                placeholder="Temporary or personal password"
                value={hostPassword}
                onChange={(e) => setHostPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                error={errors.hostPassword}
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

                <span className="text-[11px] text-slate-400">
                  First login will prompt password set
                </span>
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
                Sign In as Host
              </Button>
            </form>
          )}
        </div>
      )}
    </AuthLayout>
  );
};

export default Login;
