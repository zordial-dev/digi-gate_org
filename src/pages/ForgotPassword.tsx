import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');

  // Reset Password State
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgotPassword(email);
      setIsSent(true);
      if (res.devOtp) setDevOtpHint(res.devOtp);
      showToast('Reset OTP Sent', 'OTP instructions have been emailed to your address.', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to send reset OTP.';
      setError(msg);
      showToast('Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length < 4) {
      setError('Please enter the OTP code sent to your email.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(email, otpCode, newPassword);
      showToast('Password Reset Complete', 'Password reset successfully! Please sign in with your new password.', 'success');
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Password reset failed.';
      setError(msg);
      showToast('Reset Failed', msg, 'error');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your registered work email to receive a password reset OTP."
    >
      {isSent ? (
        <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>OTP sent to <strong>{email}</strong></span>
          </div>

          {devOtpHint && (
            <div className="p-3 bg-[#F3E8BC]/30 border border-[#F3E8BC] rounded-xl text-xs text-[#172525] font-mono flex items-center justify-between">
              <span>Dev OTP Code:</span>
              <strong className="text-[#035352] font-bold text-sm tracking-wider">{devOtpHint}</strong>
            </div>
          )}

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <Input
            label="Enter 6-Digit OTP"
            type="text"
            placeholder="123456"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="New Password"
            isPassword
            placeholder="••••••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Confirm New Password"
            isPassword
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={resetLoading}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Update Password & Login
          </Button>

          <div className="flex justify-between items-center mt-2 text-xs">
            <button
              type="button"
              onClick={() => setIsSent(false)}
              className="text-slate-500 hover:text-[#035352] font-semibold"
            >
              Resend OTP
            </button>
            <Link to="/login" className="text-[#035352] font-bold hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRequestOtp} className="flex flex-col gap-5">
          <Input
            label="Registered Work Email"
            type="email"
            placeholder="admin@zordial.tech"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            error={error}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Send Reset OTP
          </Button>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#035352] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
