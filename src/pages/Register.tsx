import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone, Building2, UserPlus, CheckSquare, Square, KeyRound, ShieldAlert, Tag } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, verifyOtp } = useAuth();
  const { showToast } = useToast();

  // Organisation Details State
  const [organisationName, setOrganisationName] = useState('');
  const [organisationCode, setOrganisationCode] = useState('');

  // Primary User Details State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // OTP Verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-[#035352]' };
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!organisationName.trim()) newErrors.organisationName = 'Organisation name is required';
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid work email is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!termsAccepted) newErrors.terms = 'You must accept the terms and security guidelines';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await register({
        fullName,
        organisationName,
        organisationCode: organisationCode.trim() || undefined,
        email,
        phone,
        password,
        role: 'organisation'
      });
      setRegisteredEmail(res.email || email);
      if (res.devOtp) setDevOtpHint(res.devOtp);
      showToast('OTP Dispatched', `A 6-digit OTP code has been sent to ${res.email || email}.`, 'info');
      setShowOtpModal(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Organisation registration failed.';
      showToast('Registration Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      showToast('OTP Required', 'Please enter the valid 6-digit OTP code sent to your email.', 'error');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await verifyOtp(registeredEmail, otpCode);
      setShowOtpModal(false);

      if (res.requiresApproval) {
        showToast(
          'Registration Submitted for Approval',
          'OTP Verified! Your organisation account is pending System Admin approval. You will be able to log in once approved.',
          'info'
        );
        navigate('/login');
      } else {
        showToast('Verification Successful', 'Welcome to Digi-Gate Organisation Portal!', 'success');
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'OTP verification failed.';
      showToast('Verification Error', msg, 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <>
      <AuthLayout
        title="Register Organisation"
        subtitle="Create a new organisation account & primary user. Requires System Admin approval before login."
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Admin Approval Notice Banner */}
          <div className="p-3.5 bg-[#F3E8BC]/30 border border-[#F3E8BC] rounded-xl text-xs text-[#172525] flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#035352] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Admin Approval Required:</strong> Your organisation registration creates 1 primary account. Once email OTP is verified, an admin will review and approve your account for login.
            </span>
          </div>

          {/* Section 1: Organisation Details */}
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-[#035352] uppercase tracking-wider mb-2">1. Organisation Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Organisation Name"
                type="text"
                placeholder="Apex Technologies Inc."
                value={organisationName}
                onChange={(e) => setOrganisationName(e.target.value)}
                leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
                error={errors.organisationName}
              />
              <Input
                label="Org Code (Optional)"
                type="text"
                placeholder="APEX"
                value={organisationCode}
                onChange={(e) => setOrganisationCode(e.target.value)}
                leftIcon={<Tag className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </div>

          {/* Section 2: Primary User Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#035352] uppercase tracking-wider">2. Primary Account Details</h3>
            <Input
              label="Full Name"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
              error={errors.fullName}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Work Email"
                type="email"
                placeholder="jane@apex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                error={errors.email}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 492-0192"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                error={errors.phone}
              />
            </div>

            <Input
              label="Password"
              isPassword
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              error={errors.password}
            />

            {password && (
              <div className="flex flex-col gap-1 -mt-1">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                  <span>Password Strength:</span>
                  <span className="font-bold text-[#035352]">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 transition-all ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 transition-all ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 transition-all ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                </div>
              </div>
            )}

            <Input
              label="Confirm Password"
              isPassword
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              error={errors.confirmPassword}
            />
          </div>

          <div className="flex flex-col gap-1 my-1">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setTermsAccepted(!termsAccepted)}
                className="text-[#035352] mt-0.5 focus:outline-none"
              >
                {termsAccepted ? (
                  <CheckSquare className="w-4 h-4 fill-[#035352] text-white" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <span>
                I agree to the <span className="text-[#035352] font-semibold underline">Terms & Security Guidelines</span>.
              </span>
            </label>
            {errors.terms && <p className="text-xs text-rose-500 font-medium ml-6">{errors.terms}</p>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            rightIcon={<UserPlus className="w-4 h-4" />}
            className="mt-2"
          >
            Register Organisation & Send OTP
          </Button>

          <div className="text-center mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#035352] hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </AuthLayout>

      {/* OTP Verification Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Verify Email OTP"
      >
        <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 my-2">
          <p className="text-xs text-slate-600">
            Please enter the 6-digit OTP code sent to <strong className="text-[#035352]">{registeredEmail}</strong>.
          </p>

          {devOtpHint && (
            <div className="p-3 bg-[#F3E8BC]/30 border border-[#F3E8BC] rounded-xl text-xs text-[#172525] font-mono flex items-center justify-between">
              <span>Dev OTP Code:</span>
              <strong className="text-[#035352] font-bold text-sm tracking-wider">{devOtpHint}</strong>
            </div>
          )}

          <Input
            label="Enter 6-Digit OTP"
            type="text"
            placeholder="123456"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowOtpModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={otpLoading}>
              Verify OTP & Submit for Approval
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Register;
