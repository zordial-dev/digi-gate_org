import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, X, Upload, User,
  ChevronLeft, ChevronRight, KeyRound, ShieldCheck, Eye, EyeOff, Ban, Copy, Check, Sparkles
} from 'lucide-react';
import { hostApi } from '@/api/services';
import type { Host } from '@/types';

import { useAuth } from '../context/AuthContext';

export default function Hosts() {
  const { user } = useAuth();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    designation: '',
    department: '',
    is_blocked: false,
    password: '',
    profile_pic: '',
  });
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Dedicated Password Modal State
  const [passwordHost, setPasswordHost] = useState<Host | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [resetSuccessData, setResetSuccessData] = useState<{ newPassword: string; hostName: string } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Minimal Availability Modal State
  const [calendarHost, setCalendarHost] = useState<Host | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [workingDays, setWorkingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [lunchStartTime, setLunchStartTime] = useState('13:00');
  const [lunchEndTime, setLunchEndTime] = useState('14:00');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dateOverrides, setDateOverrides] = useState<Record<string, {
    type?: 'off' | 'custom';
    available_from?: string;
    available_to?: string;
    lunch_from?: string;
    lunch_to?: string;
  }>>({});
  const [showAddOverride, setShowAddOverride] = useState(false);
  const [overrideMode, setOverrideMode] = useState<'range' | 'multi'>('range');
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideEndDate, setOverrideEndDate] = useState('');
  const [multiDates, setMultiDates] = useState<string[]>([]);
  const [multiMonthDate, setMultiMonthDate] = useState<Date>(new Date());
  const [overrideType, setOverrideType] = useState<'off' | 'custom'>('off');
  const [overrideWorkIn, setOverrideWorkIn] = useState('09:00');
  const [overrideWorkOut, setOverrideWorkOut] = useState('18:00');
  const [overrideLunchIn, setOverrideLunchIn] = useState('13:00');
  const [overrideLunchOut, setOverrideLunchOut] = useState('14:00');
  const [calendarSubmitting, setCalendarSubmitting] = useState(false);

  const organisationId = user?.organisation_id || 1;

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      const res = await hostApi.getAll(organisationId);
      if (res.data.success) {
        setHosts(res.data.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load hosts' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const openCreateModal = () => {
    setEditingHost(null);
    setFormData({
      full_name: '',
      email: '',
      mobile_number: '',
      designation: '',
      department: '',
      is_blocked: false,
      password: '',
      profile_pic: '',
    });
    setProfilePicFile(null);
    setProfilePicPreview(null);
    setShowFormPassword(false);
    setShowModal(true);
    setMessage(null);
    setModalError(null);
  };

  const openEditModal = (host: Host) => {
    setEditingHost(host);
    setFormData({
      full_name: host.full_name || '',
      email: host.email || '',
      mobile_number: host.mobile_number || '',
      designation: host.designation || '',
      department: host.department || '',
      is_blocked: host.is_blocked || false,
      password: '',
      profile_pic: host.profile_pic || '',
    });
    setProfilePicFile(null);
    setProfilePicPreview(host.profile_pic || null);
    setShowFormPassword(false);
    setShowModal(true);
    setMessage(null);
    setModalError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingHost(null);
    setFormData({
      full_name: '',
      email: '',
      mobile_number: '',
      designation: '',
      department: '',
      is_blocked: false,
      password: '',
      profile_pic: '',
    });
    setProfilePicFile(null);
    setProfilePicPreview(null);
    setShowFormPassword(false);
    setMessage(null);
    setModalError(null);
  };

  // Password Modal Handlers
  const openPasswordModal = (host: Host) => {
    setPasswordHost(host);
    setNewPassword('');
    setShowNewPassword(false);
    setResetSuccessData(null);
    setCopiedPassword(false);
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordHost(null);
    setNewPassword('');
    setShowNewPassword(false);
    setResetSuccessData(null);
    setCopiedPassword(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordHost) return;
    setPasswordSubmitting(true);
    try {
      const res = await hostApi.changePassword(passwordHost.id, newPassword.trim() || undefined);
      if (res.data.success) {
        const generatedPass = (res.data as any).newPassword || newPassword.trim();
        setResetSuccessData({
          newPassword: generatedPass,
          hostName: passwordHost.full_name,
        });
        await fetchHosts();
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update host password' });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const toggleBlockStatus = async (id: number, currentBlocked: boolean) => {
    try {
      const res = await hostApi.toggleBlock(id);
      if (res.data.success) {
        await fetchHosts();
        setMessage({
          type: 'success',
          text: `Host ${!currentBlocked ? 'blocked' : 'unblocked'} successfully!`
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update host block status' });
    }
  };

  // Availability Modal Handlers
  const openAvailabilityModal = (host: Host) => {
    setCalendarHost(host);
    setSelectedDates(Array.isArray(host.unavailable_dates) ? [...host.unavailable_dates] : []);
    setWorkingDays(
      Array.isArray(host.working_days) && host.working_days.length > 0
        ? [...host.working_days]
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    );
    setWorkStartTime(host.available_from ? host.available_from.slice(0, 5) : '09:00');
    setWorkEndTime(host.available_to ? host.available_to.slice(0, 5) : '18:00');
    setLunchStartTime(host.lunch_from ? host.lunch_from.slice(0, 5) : '13:00');
    setLunchEndTime(host.lunch_to ? host.lunch_to.slice(0, 5) : '14:00');
    setDateOverrides(
      typeof host.date_overrides === 'object' && host.date_overrides !== null
        ? { ...host.date_overrides }
        : {}
    );
    setShowAddOverride(false);
    setOverrideMode('range');
    setOverrideDate('');
    setOverrideEndDate('');
    setMultiDates([]);
    setMultiMonthDate(new Date());
    setShowCalendarModal(true);
  };

  const closeAvailabilityModal = () => {
    setShowCalendarModal(false);
    setCalendarHost(null);
    setShowAddOverride(false);
    setOverrideDate('');
    setOverrideEndDate('');
    setMultiDates([]);
  };

  const toggleWorkingDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const getDatesInRange = (startDateStr: string, endDateStr: string): string[] => {
    if (!startDateStr) return [];
    if (!endDateStr || endDateStr <= startDateStr) return [startDateStr];

    const dates: string[] = [];
    const current = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');

    let count = 0;
    while (current <= end && count < 90) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      current.setDate(current.getDate() + 1);
      count++;
    }
    return dates;
  };

  const toggleMultiDate = (dStr: string) => {
    if (dStr < todayStr) return;
    setMultiDates((prev) =>
      prev.includes(dStr) ? prev.filter((x) => x !== dStr) : [...prev, dStr]
    );
  };

  const handleAddOverride = () => {
    let targetDates: string[] = [];
    if (overrideMode === 'range') {
      if (!overrideDate) return;
      targetDates = getDatesInRange(overrideDate, overrideEndDate);
    } else {
      targetDates = multiDates;
    }

    if (targetDates.length === 0) return;

    if (overrideType === 'off') {
      setSelectedDates((prev) => {
        const set = new Set([...prev, ...targetDates]);
        return Array.from(set).sort();
      });
      setDateOverrides((prev) => {
        const next = { ...prev };
        targetDates.forEach((d) => delete next[d]);
        return next;
      });
    } else {
      setSelectedDates((prev) => prev.filter((d) => !targetDates.includes(d)));
      setDateOverrides((prev) => {
        const next = { ...prev };
        targetDates.forEach((d) => {
          next[d] = {
            type: 'custom',
            available_from: `${overrideWorkIn}:00`,
            available_to: `${overrideWorkOut}:00`,
            lunch_from: `${overrideLunchIn}:00`,
            lunch_to: `${overrideLunchOut}:00`,
          };
        });
        return next;
      });
    }

    setOverrideDate('');
    setOverrideEndDate('');
    setMultiDates([]);
    setShowAddOverride(false);
  };

  const handleRemoveOverride = (dateStr: string) => {
    setSelectedDates((prev) => prev.filter((d) => d !== dateStr));
    setDateOverrides((prev) => {
      const next = { ...prev };
      delete next[dateStr];
      return next;
    });
  };

  const handleClearAllOverrides = () => {
    if (!confirm('Remove all scheduled leaves and date overrides for this host?')) return;
    setSelectedDates([]);
    setDateOverrides({});
  };

  const handleSaveAvailability = async () => {
    if (!calendarHost) return;
    setCalendarSubmitting(true);
    try {
      const res = await hostApi.updateAvailability(calendarHost.id, {
        unavailable_dates: selectedDates,
        available_from: workStartTime ? `${workStartTime}:00` : '09:00:00',
        available_to: workEndTime ? `${workEndTime}:00` : '18:00:00',
        lunch_from: lunchStartTime ? `${lunchStartTime}:00` : '13:00:00',
        lunch_to: lunchEndTime ? `${lunchEndTime}:00` : '14:00:00',
        working_days: workingDays,
        date_overrides: dateOverrides,
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: `Availability schedule updated for ${calendarHost.full_name}!` });
        await fetchHosts();
        closeAvailabilityModal();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update availability schedule' });
    } finally {
      setCalendarSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];
        if (typeof value === 'boolean') {
          formDataToSend.append(key, value ? 'true' : 'false');
        } else {
          formDataToSend.append(key, value as string);
        }
      });

      if (profilePicFile) {
        formDataToSend.append('profile_pic', profilePicFile);
      }

      let res;
      if (editingHost) {
        res = await hostApi.updateWithFile(editingHost.id, formDataToSend);
      } else {
        formDataToSend.append('organisation_id', organisationId.toString());
        res = await hostApi.createWithFile(formDataToSend);
      }

      if (res.data.success) {
        const tempPass = (res.data as any).tempPassword;
        const successMsg = tempPass
          ? `Host ${formData.full_name} created successfully! Temporary Password: ${tempPass} (Welcome email dispatched).`
          : `Host ${editingHost ? 'updated' : 'created'} successfully!`;
        setMessage({ type: 'success', text: successMsg });
        setModalError(null);
        await fetchHosts();
        setTimeout(closeModal, tempPass ? 2500 : 1000);
      }
    } catch (error: any) {
      const errText = error?.response?.data?.error || error?.message || 'Failed to save host';
      setModalError(errText);
      setMessage({ type: 'error', text: errText });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this host?')) return;

    try {
      const res = await hostApi.delete(id);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Host deleted successfully!' });
        await fetchHosts();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete host' });
    }
  };


  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Real-time host availability calculator
  const getHostLiveAvailability = (host: Host) => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayWeekday = weekdays[now.getDay()];
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    const unavailableDates = Array.isArray(host.unavailable_dates) ? host.unavailable_dates : [];
    const overrides = (typeof host.date_overrides === 'object' && host.date_overrides !== null) ? host.date_overrides : {};
    const todayOverride = overrides[todayStr];

    if (unavailableDates.includes(todayStr) || todayOverride?.type === 'off') {
      return {
        label: 'On Leave Today',
        dotClass: 'bg-rose-500',
        isAvailable: false,
      };
    }

    const hostWorkingDays = Array.isArray(host.working_days) && host.working_days.length > 0
      ? host.working_days
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (!todayOverride && !hostWorkingDays.includes(todayWeekday)) {
      return {
        label: 'Off Duty Today',
        dotClass: 'bg-slate-400',
        isAvailable: false,
      };
    }

    const formatT = (t: string | undefined, fallback: string) => {
      if (!t) return fallback;
      return String(t).slice(0, 5);
    };

    const inTime = formatT(todayOverride?.available_from || host.available_from, '09:00');
    const outTime = formatT(todayOverride?.available_to || host.available_to, '18:00');
    const lunchIn = formatT(todayOverride?.lunch_from || host.lunch_from, '13:00');
    const lunchOut = formatT(todayOverride?.lunch_to || host.lunch_to, '14:00');

    if (lunchIn && lunchOut && currentTime >= lunchIn && currentTime < lunchOut) {
      return {
        label: 'On Lunch',
        dotClass: 'bg-amber-500',
        isAvailable: false,
      };
    }

    if (currentTime < inTime || currentTime >= outTime) {
      return {
        label: 'Out of Office',
        dotClass: 'bg-slate-400',
        isAvailable: false,
      };
    }

    return {
      label: 'Available',
      dotClass: 'bg-emerald-500',
      isAvailable: true,
    };
  };

  if (loading) {
    return <div className="text-center py-8" style={{ color: '#64748b' }}>Loading hosts...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#172525]">Hosts Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage staff members, availability schedules, and work & lunch hours.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Host
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold shadow-sm ${message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 overflow-hidden">
        <table className="w-full text-xs sm:text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              <th className="px-4 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Profile</th>
              <th className="px-4 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Name</th>
              <th className="px-4 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Designation</th>
              <th className="px-4 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Department</th>
              <th className="px-4 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Email</th>
              <th className="px-4 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Status</th>
              <th className="px-4 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8" style={{ color: '#94a3b8' }}>
                  No hosts found
                </td>
              </tr>
            ) : (
              hosts.map((host) => {
                const liveAvail = getHostLiveAvailability(host);

                return (
                  <tr key={host.id} className="border-b" style={{ borderColor: '#f1f5f9' }}>
                    <td className="px-4 py-3">
                      {host.profile_pic ? (
                        <img
                          src={host.profile_pic}
                          alt={host.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                          style={{ border: '2px solid #021767' }}
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#f1f5f9' }}
                        >
                          <User className="h-5 w-5" style={{ color: '#94a3b8' }} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#0f172a' }}>
                      <div className="flex items-center gap-2">
                        <span>{host.full_name}</span>
                        {host.is_blocked && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700">
                            ⛔ Blocked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#3F5885' }}>
                      {host.designation || '-'}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#3F5885' }}>
                      {host.department || '-'}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#3F5885' }}>
                      {host.email}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openAvailabilityModal(host)}
                        className="group inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#035352] bg-white hover:bg-[#035352]/5 transition-all cursor-pointer shadow-xs"
                        title="Click to configure availability & hours"
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${liveAvail.dotClass}`} />
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#035352]">
                          {liveAvail.label}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Change Password button */}
                        <button
                          onClick={() => openPasswordModal(host)}
                          className="p-1.5 rounded-lg transition-all"
                          title="Change Host Password"
                          style={{ color: '#94a3b8' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#d97706';
                            e.currentTarget.style.backgroundColor = 'rgba(217, 119, 6, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#94a3b8';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        {/* Block / Unblock toggle button */}
                        <button
                          onClick={() => toggleBlockStatus(host.id, !!host.is_blocked)}
                          className="p-1.5 rounded-lg transition-all"
                          title={host.is_blocked ? "Unblock Host" : "Block Host"}
                          style={{ color: host.is_blocked ? '#dc2626' : '#94a3b8' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = host.is_blocked ? '#16a34a' : '#dc2626';
                            e.currentTarget.style.backgroundColor = host.is_blocked ? 'rgba(22, 163, 74, 0.08)' : 'rgba(220, 38, 38, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = host.is_blocked ? '#dc2626' : '#94a3b8';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {host.is_blocked ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <Ban className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(host)}
                          className="p-1.5 rounded-lg transition-all"
                          title="Edit Host"
                          style={{ color: '#94a3b8' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#2563eb';
                            e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#94a3b8';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(host.id)}
                          className="p-1.5 rounded-lg transition-all"
                          title="Delete Host"
                          style={{ color: '#94a3b8' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#dc2626';
                            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#94a3b8';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Host Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-[#172525]">
                  {editingHost ? 'Edit Host Staff' : 'Add New Host Staff'}
                </h2>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2.5 animate-in fade-in duration-200">
                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-slate-50 border-2 border-[#035352]/30 shadow-inner">
                    {profilePicPreview ? (
                      <img src={profilePicPreview} alt="Profile preview" className="w-full h-full object-cover p-1" />
                    ) : (
                      <User className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl font-bold text-xs bg-[#035352]/10 text-[#035352] border border-[#035352]/20 hover:bg-[#035352]/20 transition-all inline-flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {editingHost ? 'Change Password (optional)' : 'Initial / Temp Password (optional)'}
                </label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={editingHost ? '•••••••• (leave blank to keep current)' : 'Leave blank to auto-generate temporary password'}
                    className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!editingHost && (
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    ✨ A temporary password will be auto-generated and emailed to the host upon creation.
                  </p>
                )}
              </div>

              {editingHost && (
                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                    <input
                      type="checkbox"
                      name="is_blocked"
                      checked={formData.is_blocked}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_blocked: e.target.checked }))}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-rose-900 block">
                        Block Host Account
                      </span>
                      <span className="text-[11px] text-rose-700/80 font-medium">
                        Blocked hosts cannot be selected by visitors and cannot log in
                      </span>
                    </div>
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingHost ? 'Update Host' : 'Create Host'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Minimal Host Availability Modal */}
      {showCalendarModal && calendarHost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-base font-bold text-[#172525]">Availability & Working Hours</h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {calendarHost.full_name} • {calendarHost.designation || 'Staff'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAvailabilityModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* 1. Working Days of Week */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Working Days
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const active = workingDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWorkingDay(day)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${active
                            ? 'bg-[#035352] text-white border-[#035352] shadow-xs'
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                          }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Standard Hours (Work & Lunch) */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Working Hours
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={workStartTime}
                      onChange={(e) => setWorkStartTime(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#035352]"
                    />
                    <span className="text-xs text-slate-400 font-bold">-</span>
                    <input
                      type="time"
                      value={workEndTime}
                      onChange={(e) => setWorkEndTime(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#035352]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lunch Break
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={lunchStartTime}
                      onChange={(e) => setLunchStartTime(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#035352]"
                    />
                    <span className="text-xs text-slate-400 font-bold">-</span>
                    <input
                      type="time"
                      value={lunchEndTime}
                      onChange={(e) => setLunchEndTime(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#035352]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Date Overrides & Leaves */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Leaves & Specific Date Overrides
                    </label>
                    {(selectedDates.length > 0 || Object.keys(dateOverrides).length > 0) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {selectedDates.length + Object.keys(dateOverrides).length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(selectedDates.length > 0 || Object.keys(dateOverrides).length > 0) && (
                      <button
                        type="button"
                        onClick={handleClearAllOverrides}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!showAddOverride && !overrideDate) {
                          setOverrideDate(todayStr);
                        }
                        setShowAddOverride(!showAddOverride);
                      }}
                      className="text-xs font-bold text-[#035352] hover:underline cursor-pointer"
                    >
                      {showAddOverride ? 'Cancel' : '+ Add Exception'}
                    </button>
                  </div>
                </div>

                {/* Inline Add Exception Form (Supports Single Date, Date Range, & Multi-Pick!) */}
                {showAddOverride && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                    {/* Mode Toggle: Range vs Multi-Select */}
                    <div className="flex p-0.5 bg-slate-200/70 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setOverrideMode('range')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${overrideMode === 'range'
                            ? 'bg-white text-[#035352] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                          }`}
                      >
                        📅 Date Range (or Single Date)
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverrideMode('multi')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${overrideMode === 'multi'
                            ? 'bg-white text-[#035352] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                          }`}
                      >
                        🗓️ Pick Multiple Dates
                      </button>
                    </div>

                    {/* Mode 1: Date Range */}
                    {overrideMode === 'range' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              From Date *
                            </label>
                            <input
                              type="date"
                              min={todayStr}
                              value={overrideDate}
                              onChange={(e) => setOverrideDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#035352]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              To Date (Optional)
                            </label>
                            <input
                              type="date"
                              min={overrideDate || todayStr}
                              value={overrideEndDate}
                              onChange={(e) => setOverrideEndDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#035352]"
                            />
                          </div>
                        </div>

                        {/* Quick presets for range */}
                        {overrideDate && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-slate-400">Quick Range:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date(overrideDate + 'T00:00:00');
                                d.setDate(d.getDate() + 1);
                                setOverrideEndDate(d.toISOString().split('T')[0]);
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                            >
                              +2 Days
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date(overrideDate + 'T00:00:00');
                                d.setDate(d.getDate() + 4);
                                setOverrideEndDate(d.toISOString().split('T')[0]);
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                            >
                              +5 Days (Work Week)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date(overrideDate + 'T00:00:00');
                                d.setDate(d.getDate() + 6);
                                setOverrideEndDate(d.toISOString().split('T')[0]);
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                            >
                              +1 Week
                            </button>
                            {overrideEndDate && (
                              <button
                                type="button"
                                onClick={() => setOverrideEndDate('')}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                Reset To 1 Day
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mode 2: Pick Multiple Specific Dates */}
                    {overrideMode === 'multi' && (
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                        {/* Mini Month Nav */}
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                          <span>
                            {multiMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={
                                multiMonthDate.getFullYear() < now.getFullYear() ||
                                (multiMonthDate.getFullYear() === now.getFullYear() && multiMonthDate.getMonth() <= now.getMonth())
                              }
                              onClick={() =>
                                setMultiMonthDate(
                                  new Date(multiMonthDate.getFullYear(), multiMonthDate.getMonth() - 1, 1)
                                )
                              }
                              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setMultiMonthDate(
                                  new Date(multiMonthDate.getFullYear(), multiMonthDate.getMonth() + 1, 1)
                                )
                              }
                              className="p-1 rounded hover:bg-slate-100 cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Mini Month Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                            <div key={d} className="text-[10px] font-bold text-slate-400">
                              {d}
                            </div>
                          ))}
                          {Array.from({
                            length: new Date(
                              multiMonthDate.getFullYear(),
                              multiMonthDate.getMonth(),
                              1
                            ).getDay(),
                          }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-6" />
                          ))}
                          {Array.from({
                            length: new Date(
                              multiMonthDate.getFullYear(),
                              multiMonthDate.getMonth() + 1,
                              0
                            ).getDate(),
                          }).map((_, i) => {
                            const dayNum = i + 1;
                            const y = multiMonthDate.getFullYear();
                            const m = String(multiMonthDate.getMonth() + 1).padStart(2, '0');
                            const d = String(dayNum).padStart(2, '0');
                            const dStr = `${y}-${m}-${d}`;
                            const isPast = dStr < todayStr;
                            const isSelected = multiDates.includes(dStr);

                            return (
                              <button
                                key={dStr}
                                type="button"
                                disabled={isPast}
                                onClick={() => toggleMultiDate(dStr)}
                                className={`h-6 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${isSelected
                                    ? 'bg-[#035352] text-white shadow-xs'
                                    : isPast
                                      ? 'text-slate-300 cursor-not-allowed'
                                      : 'text-slate-700 hover:bg-slate-100'
                                  }`}
                              >
                                {dayNum}
                              </button>
                            );
                          })}
                        </div>

                        {multiDates.length > 0 && (
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                            <span className="font-bold text-[#035352]">
                              {multiDates.length} date{multiDates.length > 1 ? 's' : ''} selected
                            </span>
                            <button
                              type="button"
                              onClick={() => setMultiDates([])}
                              className="text-slate-400 hover:text-rose-600 font-semibold cursor-pointer"
                            >
                              Clear selection
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status on Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Status on Selected Dates
                      </label>
                      <select
                        value={overrideType}
                        onChange={(e) => setOverrideType(e.target.value as 'off' | 'custom')}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#035352]"
                      >
                        <option value="off">🔴 Full Day Leave (Off)</option>
                        <option value="custom">🔵 Custom Hours</option>
                      </select>
                    </div>

                    {/* Custom Hours (if custom) */}
                    {overrideType === 'custom' && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Work Hours</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={overrideWorkIn}
                              onChange={(e) => setOverrideWorkIn(e.target.value)}
                              className="w-full p-1 text-xs font-bold bg-white border border-slate-300 rounded"
                            />
                            <span>-</span>
                            <input
                              type="time"
                              value={overrideWorkOut}
                              onChange={(e) => setOverrideWorkOut(e.target.value)}
                              className="w-full p-1 text-xs font-bold bg-white border border-slate-300 rounded"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Lunch Hours</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={overrideLunchIn}
                              onChange={(e) => setOverrideLunchIn(e.target.value)}
                              className="w-full p-1 text-xs font-bold bg-white border border-slate-300 rounded"
                            />
                            <span>-</span>
                            <input
                              type="time"
                              value={overrideLunchOut}
                              onChange={(e) => setOverrideLunchOut(e.target.value)}
                              className="w-full p-1 text-xs font-bold bg-white border border-slate-300 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={handleAddOverride}
                      disabled={
                        overrideMode === 'range'
                          ? !overrideDate
                          : multiDates.length === 0
                      }
                      className="w-full py-2 bg-[#035352] text-white rounded-xl text-xs font-bold hover:bg-[#023e3d] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {overrideMode === 'range'
                        ? overrideEndDate && overrideEndDate > overrideDate
                          ? `Apply for ${getDatesInRange(overrideDate, overrideEndDate).length} Dates (${overrideDate} to ${overrideEndDate})`
                          : `Apply for ${overrideDate || 'Date'}`
                        : `Apply for ${multiDates.length} Selected Date${multiDates.length > 1 ? 's' : ''}`}
                    </button>
                  </div>
                )}

                {/* Active Overrides Chips */}
                {selectedDates.length === 0 && Object.keys(dateOverrides).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">
                    No exceptions added. Regular weekly schedule applies year-round.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
                    {/* Full Leaves */}
                    {selectedDates.sort().map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
                      >
                        <span>📅 {d} (Leave)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOverride(d)}
                          className="hover:text-rose-900 font-black cursor-pointer text-sm"
                          title="Remove leave"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {/* Custom Hours */}
                    {Object.keys(dateOverrides).sort().map((d) => {
                      const o = dateOverrides[d];
                      const inT = o.available_from?.slice(0, 5) || '09:00';
                      const outT = o.available_to?.slice(0, 5) || '18:00';
                      return (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                        >
                          <span>🕒 {d} ({inT}-{outT})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOverride(d)}
                            className="hover:text-indigo-900 font-black cursor-pointer text-sm"
                            title="Remove override"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>





            {/* Modal Footer Actions */}
            <div className="flex gap-2.5 pt-5 mt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={closeAvailabilityModal}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvailability}
                disabled={calendarSubmitting}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{calendarSubmitting ? 'Saving...' : 'Save Availability'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Change Password Modal */}
      {showPasswordModal && passwordHost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-7 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#172525]">Change Host Password</h2>
                  <p className="text-xs font-semibold text-slate-500 truncate max-w-[200px]">
                    {passwordHost.full_name}
                  </p>
                </div>
              </div>
              <button onClick={closePasswordModal} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            {resetSuccessData ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-emerald-900">
                    Password Reset Successful!
                  </h3>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    A notification email was dispatched to <strong>{passwordHost.email}</strong> (without credentials).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    New Host Password
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm font-black font-mono text-[#035352] tracking-wider bg-white px-3 py-1.5 rounded-xl border border-slate-200 flex-1 select-all">
                      {resetSuccessData.newPassword}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(resetSuccessData.newPassword);
                        setCopiedPassword(true);
                        setTimeout(() => setCopiedPassword(false), 2000);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[#035352] text-white hover:bg-[#023e3d] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {copiedPassword ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#F3E8BC]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  🔒 Provide this password to the host. Per policy, the host can log in immediately with this password without needing to change it.
                </p>

                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      New Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPass = `DG-${Math.floor(100000 + Math.random() * 900000)}`;
                        setNewPassword(randomPass);
                        setShowNewPassword(true);
                      }}
                      className="text-[11px] font-bold text-[#035352] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Auto-Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to auto-generate"
                      className="w-full px-4 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    A notification email will be dispatched to the host (without credentials).
                  </p>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {passwordSubmitting ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}