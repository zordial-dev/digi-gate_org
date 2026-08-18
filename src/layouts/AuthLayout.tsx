import React from 'react';
import { ShieldCheck, Building2, CheckCircle } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex w-full bg-[#F4F7F6]">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#035352] relative flex-col justify-between p-12 overflow-hidden text-white bg-grid-pattern">
        {/* Decorative Geometric Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#F3E8BC]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-[#05706f]/40 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-[#F3E8BC]/15 blur-3xl pointer-events-none" />

        {/* Top Header Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F3E8BC] flex items-center justify-center text-[#035352] shadow-lg shadow-[#035352]/40 font-bold border border-[#F3E8BC]">
            <Building2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-white">DIGI-GATE</span>
            <span className="block text-xs font-semibold uppercase tracking-widest text-[#F3E8BC]">
              Organisation Portal
            </span>
          </div>
        </div>

        {/* Center Feature Display */}
        <div className="relative z-10 my-auto max-w-lg">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white mb-4">
            Unified Organisation Access & Security
          </h1>
          <p className="text-slate-200 text-base leading-relaxed mb-8">
            Manage your organisation visitor clearance, host approvals, and real-time gate entry logs.
          </p>

          {/* Highlights Checklist */}
          <div className="grid grid-cols-1 gap-3.5 text-sm font-medium">
            <div className="flex items-center gap-3 bg-[#023e3d]/60 backdrop-blur-md p-3.5 rounded-xl border border-[#F3E8BC]/20">
              <CheckCircle className="w-5 h-5 text-[#F3E8BC] shrink-0" />
              <span>Visitor Pre-Clearance & Approval</span>
            </div>
            <div className="flex items-center gap-3 bg-[#023e3d]/60 backdrop-blur-md p-3.5 rounded-xl border border-[#F3E8BC]/20">
              <ShieldCheck className="w-5 h-5 text-[#F3E8BC] shrink-0" />
              <span>Real-Time Visitor Log Telemetry</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 border-t border-white/10 pt-6">
          <span>&copy; {new Date().getFullYear()} Digi-Gate Control Systems</span>
          <span className="text-[#F3E8BC]">v2.4.0 (Enterprise)</span>
        </div>
      </div>

      {/* Right Form Card Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#035352] flex items-center justify-center text-[#F3E8BC]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#035352]">DIGI-GATE</span>
            <span className="block text-[10px] font-bold uppercase text-slate-500">Organisation Portal</span>
          </div>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10 relative z-10">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172525] tracking-tight">{title}</h2>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
