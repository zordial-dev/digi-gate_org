import { useState, useEffect } from 'react';
import { Users, Calendar, UserCheck, Clock, User, ArrowRight, Building2 } from 'lucide-react';
import { dashboardApi, visitApi } from '@/api/services';
import type { DashboardStats, VisitorVisit } from '@/types';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVisits, setRecentVisits] = useState<VisitorVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const organisationId = user?.organisation_id || 1;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, visitsRes] = await Promise.all([
          dashboardApi.getStats(organisationId),
          visitApi.getAll(organisationId, { limit: 5 }),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (visitsRes.data.success) setRecentVisits(visitsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [organisationId]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#035352] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#035352]">Loading Portal Telemetry...</p>
        </div>
      </div>
    );
  }

  const statItems = [
    { title: 'Total Visitors', value: stats?.total_visitors || 0, icon: Users, color: 'bg-[#035352]' },
    { title: 'Total Visits', value: stats?.total_visits || 0, icon: Calendar, color: 'bg-emerald-600' },
    { title: "Today's Visits", value: stats?.today_visits || 0, icon: Clock, color: 'bg-teal-600' },
    { title: 'Active Hosts', value: stats?.active_hosts || 0, icon: UserCheck, color: 'bg-amber-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#035352] via-[#05706f] to-[#023e3d] rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-[#035352]/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-[#F3E8BC]/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F3E8BC] text-xs font-semibold backdrop-blur-md mb-3 border border-[#F3E8BC]/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>{user?.organisationName || 'Organisation Portal'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Visitor Operations Center
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1">
              Manage visitor pre-clearance, host availability, and gate clearance telemetry.
            </p>
          </div>
          <Link
            to="/visits"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F3E8BC] text-[#172525] font-bold text-xs hover:bg-[#e8da9d] transition-all shadow-md shrink-0 border border-[#e5d59e]"
          >
            <span>View All Visits</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statItems.map((stat) => (
          <div 
            key={stat.title} 
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md shadow-slate-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </p>
                <p className="text-3xl font-black text-[#172525] mt-2 group-hover:text-[#035352] transition-colors">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color} shadow-lg shadow-[#035352]/20 shrink-0`}>
                <stat.icon className="h-6 w-6 stroke-[2.2]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Visits */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#172525]">Recent Visitor Visits</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest visitor arrivals and gate clearances</p>
          </div>
          <Link to="/visits" className="text-xs font-extrabold text-[#035352] hover:underline flex items-center gap-1">
            <span>View History</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentVisits.length === 0 ? (
          <div className="p-8 text-center text-xs font-medium text-slate-400">
            No recent visits logged yet
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentVisits.map((visit) => (
              <div 
                key={visit.id} 
                className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/80 transition-colors gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {visit.selfie_url ? (
                    <img 
                      src={visit.selfie_url} 
                      alt={visit.visitor?.full_name || 'Visitor'} 
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#035352]/10 border border-[#035352]/20 flex items-center justify-center text-[#035352] shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-[#172525] truncate">
                      {visit.visitor?.full_name || 'Unknown Visitor'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap mt-0.5">
                      <span className="font-medium">{visit.visitor?.company || 'Visitor'}</span>
                      <span>•</span>
                      <span className="text-[#035352] font-semibold">Host: {visit.host?.full_name || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-[#172525]">
                      {new Date(visit.check_in_time).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {new Date(visit.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-extrabold border ${
                    visit.host_available_at_submission
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {visit.host_available_at_submission ? 'Completed' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}