import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload, User, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    designation: '',
    department: '',
    is_available: true,
    profile_pic: '',
  });

  // Calendar Modal State
  const [calendarHost, setCalendarHost] = useState<Host | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
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
      is_available: true,
      profile_pic: '',
    });
    setProfilePicFile(null);
    setProfilePicPreview(null);
    setShowModal(true);
    setMessage(null);
  };

  const openEditModal = (host: Host) => {
    setEditingHost(host);
    setFormData({
      full_name: host.full_name || '',
      email: host.email || '',
      mobile_number: host.mobile_number || '',
      designation: host.designation || '',
      department: host.department || '',
      is_available: host.is_available_toggle ?? host.is_available ?? true,
      profile_pic: host.profile_pic || '',
    });
    setProfilePicFile(null);
    setProfilePicPreview(host.profile_pic || null);
    setShowModal(true);
    setMessage(null);
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
      is_available: true,
      profile_pic: '',
    });
    setProfilePicFile(null);
    setProfilePicPreview(null);
    setMessage(null);
  };

  // Open Calendar Modal for Host
  const openCalendarModal = (host: Host) => {
    setCalendarHost(host);
    setSelectedDates(Array.isArray(host.unavailable_dates) ? [...host.unavailable_dates] : []);
    setCurrentMonthDate(new Date());
    setShowCalendarModal(true);
  };

  const closeCalendarModal = () => {
    setShowCalendarModal(false);
    setCalendarHost(null);
    setSelectedDates([]);
  };

  const toggleDateSelection = (dateStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleSaveCalendar = async () => {
    if (!calendarHost) return;
    setCalendarSubmitting(true);
    try {
      const res = await hostApi.updateUnavailableDates(calendarHost.id, selectedDates);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Leave calendar updated for ${calendarHost.full_name}` });
        await fetchHosts();
        closeCalendarModal();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update leave calendar' });
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
        setMessage({ type: 'success', text: `Host ${editingHost ? 'updated' : 'created'} successfully!` });
        await fetchHosts();
        setTimeout(closeModal, 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save host' });
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

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      const res = await hostApi.toggleAvailability(id);
      if (res.data.success) {
        await fetchHosts();
        setMessage({ type: 'success', text: `Host ${currentStatus ? 'unavailable' : 'available'}!` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update host status' });
    }
  };

  // Calendar calculation helpers
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });

  const formatDateStr = (yearNum: number, monthNum: number, dayNum: number) => {
    const mm = String(monthNum + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${yearNum}-${mm}-${dd}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (loading) {
    return <div className="text-center py-8" style={{ color: '#64748b' }}>Loading hosts...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#172525]">Hosts Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage staff members, availability toggles, and leave calendars.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Host
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold shadow-sm ${
            message.type === 'success'
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
              <th className="px-4 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Leave Calendar</th>
              <th className="px-4 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hosts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8" style={{ color: '#94a3b8' }}>
                  No hosts found
                </td>
              </tr>
            ) : (
              hosts.map((host) => {
                const dates = Array.isArray(host.unavailable_dates) ? host.unavailable_dates : [];
                const isDateOffToday = dates.includes(todayStr);
                const toggleState = host.is_available_toggle ?? host.is_available ?? true;
                const isAvailableEffective = toggleState && !isDateOffToday;

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
                      {host.full_name}
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
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => toggleAvailability(host.id, toggleState)}
                          className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all w-fit"
                          style={{
                            backgroundColor: isAvailableEffective
                              ? '#dcfce7'
                              : isDateOffToday
                              ? '#fef3c7'
                              : '#fee2e2',
                            color: isAvailableEffective
                              ? '#15803d'
                              : isDateOffToday
                              ? '#b45309'
                              : '#dc2626',
                          }}
                        >
                          {isAvailableEffective
                            ? '🟢 Available'
                            : isDateOffToday
                            ? '📅 On Leave Today'
                            : '🔴 Toggle Off'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openCalendarModal(host)}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all"
                        style={{
                          borderColor: dates.length > 0 ? '#b45309' : '#021767',
                          backgroundColor: dates.length > 0 ? '#fffbeb' : '#ffffff',
                          color: dates.length > 0 ? '#b45309' : '#3F5885',
                        }}
                      >
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {dates.length > 0 ? `${dates.length} Off Date(s)` : 'Manage Leave'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
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
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_available: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#035352] focus:ring-[#035352]"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Host Currently Available (Active Status)
                  </span>
                </label>
              </div>

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

      {/* Interactive Host Leave Calendar Modal */}
      {showCalendarModal && calendarHost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[95vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#172525]">
                    Manage Leave Calendar
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Host: {calendarHost.full_name} ({calendarHost.designation || 'Staff'})
                  </p>
                </div>
              </div>
              <button onClick={closeCalendarModal} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs mb-4 font-semibold text-slate-600 leading-relaxed">
              Click any date to mark it as <strong className="text-rose-600">Unavailable / On Leave</strong>. Dates marked in red will mark the host as unavailable on the Visitor App.
            </p>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <button
                onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-700 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-bold text-sm text-[#172525]">
                {monthName} {year}
              </h3>
              <button
                onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-700 transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs mb-2 text-slate-500">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center mb-6">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2.5"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = formatDateStr(year, month, dayNum);
                const isSelected = selectedDates.includes(dateStr);
                const isToday = dateStr === todayStr;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => toggleDateSelection(dateStr)}
                    className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all border ${
                      isSelected
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm shadow-rose-200'
                        : isToday
                        ? 'bg-[#035352]/10 border-[#035352] text-[#035352]'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{dayNum}</span>
                    <span className="text-[9px] font-semibold leading-tight mt-0.5">
                      {isSelected ? 'Off' : isToday ? 'Today' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Dates Summary */}
            <div className="mb-6 p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <h4 className="text-xs font-bold text-[#172525] mb-2 uppercase tracking-wider">
                Selected Off Dates ({selectedDates.length})
              </h4>
              {selectedDates.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No unavailable dates selected for this host.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {selectedDates.sort().map((d) => (
                    <span
                      key={d}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold flex items-center gap-1.5 border border-rose-200"
                    >
                      {d}
                      <button
                        type="button"
                        onClick={() => toggleDateSelection(d)}
                        className="hover:text-rose-900 font-black text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {selectedDates.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedDates([])}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={closeCalendarModal}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCalendar}
                disabled={calendarSubmitting}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all disabled:opacity-50"
              >
                {calendarSubmitting ? 'Saving...' : 'Save Leave Calendar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}