import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Loader2,
  Ban,
  Clock,
  PauseCircle,
  LogOut,
  RefreshCw,
  Building2,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#035352]" />
          <p className="text-sm font-medium text-[#035352]">Verifying Organisation Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Determine organisation approval and active state
  // is_approved: 0 = pending, 1 = approved, 2 = hold, 3 = denied
  const isApproved = user.organisation?.is_approved ?? user.is_approved ?? 0;
  const isActive = Boolean(user.organisation?.is_active ?? user.is_active);
  const blockReason = user.organisation?.block_reason || user.block_reason || '';
  const orgName = user.organisation?.name || user.organisationName || user.username || 'Your Organisation';

  // 1. STATE: Denied / Banned (is_approved === 2 || 3 or anything other than 0 and 1)
  if (isApproved === 2 || isApproved === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-slate-100 flex flex-col justify-between p-4 sm:p-6" data-testid="org-banned-screen">
        <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#035352] text-[#F3E8BC] font-extrabold text-lg shadow-sm">
              DG
            </span>
            <span className="text-xl font-extrabold tracking-tight text-[#035352]">
              Digi<span className="text-[#05706f]">-Gate</span>
            </span>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm hover:border-rose-300 transition-all cursor-pointer"
          >
            <LogOut className="size-3.5" /> Sign Out
          </button>
        </header>

        <main className="max-w-lg w-full mx-auto my-auto text-center space-y-6">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-rose-100 text-rose-600 ring-8 ring-rose-50">
            <Ban className="size-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-3 py-1 rounded-full">
              <ShieldAlert className="size-3.5" /> Access Restricted
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Your organisation is banned
            </h1>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Access to the portal for <span className="font-semibold text-slate-900">{orgName}</span> has been denied or banned by the Super Administrator.
            </p>
          </div>

          {blockReason && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-left shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-rose-900">Reason Provided:</p>
                  <p className="mt-1 text-rose-800 leading-relaxed">{blockReason}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => logout()}
              className="w-full sm:w-auto h-11 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="size-3.5" /> Exit to Login
            </button>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-400 py-4">
          &copy; {new Date().getFullYear()} Digi-Gate Workplace Security System.
        </footer>
      </div>
    );
  }

  // 2. STATE: Approved but Inactive (is_approved === 1 && !is_active)
  if (isApproved === 1 && !isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-white to-slate-100 flex flex-col justify-between p-4 sm:p-6" data-testid="org-inactive-screen">
        <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#035352] text-[#F3E8BC] font-extrabold text-lg shadow-sm">
              DG
            </span>
            <span className="text-xl font-extrabold tracking-tight text-[#035352]">
              Digi<span className="text-[#05706f]">-Gate</span>
            </span>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm hover:border-slate-300 transition-all cursor-pointer"
          >
            <LogOut className="size-3.5" /> Sign Out
          </button>
        </header>

        <main className="max-w-lg w-full mx-auto my-auto text-center space-y-6">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 ring-8 ring-amber-50">
            <PauseCircle className="size-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              Status: Inactive
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Organisation is inactive
            </h1>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your organisation <span className="font-semibold text-slate-900">{orgName}</span> is approved but has been temporarily deactivated. Please contact your Super Administrator to reactivate your workspace.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full sm:w-auto h-11 px-6 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin text-[#035352]' : ''}`} />
              Check Status
            </button>
            <button
              onClick={() => logout()}
              className="w-full sm:w-auto h-11 px-6 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="size-3.5" /> Sign Out
            </button>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-400 py-4">
          &copy; {new Date().getFullYear()} Digi-Gate Workplace Security System.
        </footer>
      </div>
    );
  }

  // 3. STATE: Pending Verification (is_approved === 0)
  if (isApproved === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50/50 via-white to-slate-100 flex flex-col justify-between p-4 sm:p-6" data-testid="org-pending-screen">
        <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#035352] text-[#F3E8BC] font-extrabold text-lg shadow-sm">
              DG
            </span>
            <span className="text-xl font-extrabold tracking-tight text-[#035352]">
              Digi<span className="text-[#05706f]">-Gate</span>
            </span>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm hover:border-slate-300 transition-all cursor-pointer"
          >
            <LogOut className="size-3.5" /> Sign Out
          </button>
        </header>

        <main className="max-w-lg w-full mx-auto my-auto text-center space-y-6">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-teal-100 text-[#035352] ring-8 ring-teal-50">
            <Clock className="size-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
              Verification in Progress
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Your request is still in verification — can't access panel
            </h1>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you for onboarding <span className="font-semibold text-slate-900">{orgName}</span>. Your registration request is currently under review by our Super Administrator team.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left text-xs text-slate-600 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Building2 className="size-4 text-[#035352]" />
              <span>Next Steps</span>
            </div>
            <p className="leading-relaxed">
              Once the Super Administrator approves your request, you will receive a notification email and can refresh this page to instantly enter your dashboard.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full sm:w-auto h-11 px-6 rounded-full bg-[#035352] hover:bg-[#023e3d] text-white text-xs font-bold shadow-md shadow-[#035352]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Checking Verification...' : 'Refresh Status'}
            </button>
            <button
              onClick={() => logout()}
              className="w-full sm:w-auto h-11 px-6 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="size-3.5" /> Sign Out
            </button>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-400 py-4">
          &copy; {new Date().getFullYear()} Digi-Gate Workplace Security System.
        </footer>
      </div>
    );
  }

  // 4. STATE: Approved & Active (is_approved === 1 && is_active === 1 / true)
  // Shows Organisation SUPER ADMIN panel
  return <Outlet />;
};

export default ProtectedRoute;
