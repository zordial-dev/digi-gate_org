import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  UserCog, 
  Settings,
  Building2,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const baseNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/visitors', label: 'Visitors', icon: Users },
  { path: '/visits', label: 'Visits', icon: ClipboardList },
  { path: '/hosts', label: 'Hosts', icon: UserCog },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHost = user?.role === 'host' || user?.org_user_role === 'host';
  const isSubAdmin = user?.org_user_role === 'sub_admin';

  let navItems = baseNavItems;
  if (isHost) {
    navItems = [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/visitors', label: 'Visitors', icon: Users },
      { path: '/visits', label: 'Visits', icon: ClipboardList },
    ];
  } else if (!isSubAdmin) {
    navItems = [
      ...baseNavItems.slice(0, 4),
      { path: '/admins', label: 'Manage Admins', icon: ShieldCheck },
      ...baseNavItems.slice(4),
    ];
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = user?.full_name || user?.username || 'Organisation User';
  const displayEmail = user?.email || 'admin@zordial.tech';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside 
      className="w-64 min-h-screen p-5 flex flex-col bg-white border-r border-slate-200/80 shadow-lg shadow-slate-200/40 relative z-20"
    >
      {/* Logo Section */}
      <div className="mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#035352] flex items-center justify-center text-[#F3E8BC] shadow-md shadow-[#035352]/20 border border-[#035352]">
            <Building2 className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#172525]">
              DIGI-GATE
            </h1>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#035352]">
              {isHost ? 'Host Portal' : 'Organisation Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-[#035352] text-white shadow-md shadow-[#035352]/25 border border-[#035352]'
                  : 'text-slate-600 hover:bg-[#035352]/10 hover:text-[#035352]'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#F3E8BC]' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section - Profile & Logout */}
      <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="w-9 h-9 rounded-xl bg-[#035352] flex items-center justify-center text-[#F3E8BC] font-black text-sm shrink-0 border border-[#035352]">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-extrabold text-[#172525] truncate">
                {displayName}
              </p>
              {isHost && (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-teal-100 text-[#035352]">
                  Host
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate font-medium">
              {displayEmail}
            </p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer border border-transparent hover:border-rose-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}