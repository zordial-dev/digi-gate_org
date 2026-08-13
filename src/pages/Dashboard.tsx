import { useState, useEffect } from 'react';
import { Users, Calendar, UserCheck, Clock, User } from 'lucide-react';
import { dashboardApi, visitApi } from '@/api/services';
import type { DashboardStats, VisitorVisit } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVisits, setRecentVisits] = useState<VisitorVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const organisationId = 1;
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div style={{ color: '#64748b' }}>Loading dashboard...</div>
      </div>
    );
  }

  const statItems = [
    { title: 'Total Visitors', value: stats?.total_visitors || 0, icon: Users, color: '#06216B' },
    { title: 'Total Visits', value: stats?.total_visits || 0, icon: Calendar, color: '#15803d' },
    { title: "Today's Visits", value: stats?.today_visits || 0, icon: Clock, color: '#7c3aed' },
    { title: 'Active Hosts', value: stats?.active_hosts || 0, icon: UserCheck, color: '#c2410c' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#06216B' }}>Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statItems.map((stat) => (
          <div 
            key={stat.title} 
            className="rounded-xl p-6 transition-all hover:shadow-lg"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #021767',
              boxShadow: '0 4px 16px rgba(2, 29, 91, 0.08)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#3F5885' }}>
                  {stat.title}
                </p>
                <p 
                  className="text-2xl font-bold mt-1"
                  style={{ color: '#0f172a' }}
                >
                  {stat.value}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: stat.color }}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Visits */}
      <div 
        className="rounded-xl p-6"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #021767',
          boxShadow: '0 4px 16px rgba(2, 29, 91, 0.08)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: '#0f172a' }}>Recent Visits</h3>
          <span className="text-xs font-semibold" style={{ color: '#64748b' }}>Last 5 visits</span>
        </div>

        {recentVisits.length === 0 ? (
          <p className="text-center py-4" style={{ color: '#94a3b8' }}>No recent visits</p>
        ) : (
          <div className="space-y-3">
            {recentVisits.map((visit) => (
              <div 
                key={visit.id} 
                className="flex items-center justify-between py-3 px-2 rounded-lg transition-all hover:shadow-sm"
                style={{ borderBottom: '1px solid #f1f5f9' }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  {visit.selfie_url ? (
                    <img 
                      src={visit.selfie_url} 
                      alt={visit.visitor?.full_name || 'Visitor'} 
                      className="w-10 h-10 rounded-full object-cover"
                      style={{ border: '2px solid #021767' }}
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#f1f5f9' }}
                    >
                      <User className="h-5 w-5" style={{ color: '#94a3b8' }} />
                    </div>
                  )}
                  
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate" style={{ color: '#0f172a' }}>
                      {visit.visitor?.full_name || 'Unknown Visitor'}
                    </p>
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span style={{ color: '#64748b' }}>
                        {visit.visitor?.company || 'No company'}
                      </span>
                      <span style={{ color: '#94a3b8' }}>•</span>
                      <span style={{ color: '#64748b' }}>
                        {visit.host?.full_name || 'No host'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-medium" style={{ color: '#3F5885' }}>
                      {new Date(visit.check_in_time).toLocaleDateString()}
                    </p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {new Date(visit.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span 
                    className="text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0"
                    style={{
                      backgroundColor: visit.host_available_at_submission ? '#dcfce7' : '#fee2e2',
                      color: visit.host_available_at_submission ? '#15803d' : '#dc2626'
                    }}
                  >
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