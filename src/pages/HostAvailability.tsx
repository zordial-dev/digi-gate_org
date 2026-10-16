import { useState, useEffect } from 'react';
import { 
  Clock, Coffee, Sun, CalendarDays, Plus, Trash2, 
  User, ChevronLeft, ChevronRight, Save, Calendar 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hostApi } from '@/api/services';
import type { Host } from '@/types';

const ALL_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HostAvailability() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [host, setHost] = useState<Host | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [workingDays, setWorkingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [lunchStartTime, setLunchStartTime] = useState('13:00');
  const [lunchEndTime, setLunchEndTime] = useState('14:00');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dateOverrides, setDateOverrides] = useState<Record<string, any>>({});

  // Override / Leave Adder State
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

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const hostId = user?.id ? Number(user.id) : null;

  useEffect(() => {
    const fetchHostData = async () => {
      if (!hostId) {
        setLoading(false);
        return;
      }
      try {
        const res = await hostApi.getById(hostId);
        if (res.data.success && res.data.data) {
          const h = res.data.data;
          setHost(h);
          setWorkingDays(
            Array.isArray(h.working_days) && h.working_days.length > 0
              ? h.working_days
              : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          );
          setWorkStartTime(h.available_from ? h.available_from.slice(0, 5) : '09:00');
          setWorkEndTime(h.available_to ? h.available_to.slice(0, 5) : '18:00');
          setLunchStartTime(h.lunch_from ? h.lunch_from.slice(0, 5) : '13:00');
          setLunchEndTime(h.lunch_to ? h.lunch_to.slice(0, 5) : '14:00');
          setSelectedDates(Array.isArray(h.unavailable_dates) ? h.unavailable_dates : []);
          setDateOverrides(
            typeof h.date_overrides === 'object' && h.date_overrides !== null
              ? h.date_overrides
              : {}
          );
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to load host profile' });
      } finally {
        setLoading(false);
      }
    };

    fetchHostData();
  }, [hostId]);

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

  const handleSave = async () => {
    if (!hostId) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await hostApi.updateAvailability(hostId, {
        unavailable_dates: selectedDates,
        available_from: workStartTime ? `${workStartTime}:00` : '09:00:00',
        available_to: workEndTime ? `${workEndTime}:00` : '18:00:00',
        lunch_from: lunchStartTime ? `${lunchStartTime}:00` : '13:00:00',
        lunch_to: lunchEndTime ? `${lunchEndTime}:00` : '14:00:00',
        working_days: workingDays,
        date_overrides: dateOverrides,
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Availability and schedule saved successfully!' });
        if (res.data.data) {
          setHost(res.data.data);
        }
      } else {
        setMessage({ type: 'error', text: res.data.error || 'Failed to save availability' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update availability schedule' });
    } finally {
      setSaving(false);
    }
  };

  // Real-time live availability calculation
  const getHostLiveAvailability = () => {
    if (!host) return { label: 'Checking...', dotClass: 'bg-slate-400' };

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayWeekday = weekdays[now.getDay()];
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    const todayOverride = dateOverrides[todayStr];

    if (selectedDates.includes(todayStr) || todayOverride?.type === 'off') {
      return { label: 'On Leave Today', dotClass: 'bg-rose-500' };
    }

    if (!todayOverride && !workingDays.includes(todayWeekday)) {
      return { label: 'Off Duty Today', dotClass: 'bg-slate-400' };
    }

    const formatT = (t: string | undefined, fallback: string) => (!t ? fallback : String(t).slice(0, 5));
    const inTime = formatT(todayOverride?.available_from || workStartTime, '09:00');
    const outTime = formatT(todayOverride?.available_to || workEndTime, '18:00');
    const lunchIn = formatT(todayOverride?.lunch_from || lunchStartTime, '13:00');
    const lunchOut = formatT(todayOverride?.lunch_to || lunchEndTime, '14:00');

    if (lunchIn && lunchOut && currentTime >= lunchIn && currentTime < lunchOut) {
      return { label: 'On Lunch', dotClass: 'bg-amber-500' };
    }

    if (currentTime < inTime || currentTime >= outTime) {
      return { label: 'Out of Office', dotClass: 'bg-slate-400' };
    }

    return { label: 'Available', dotClass: 'bg-emerald-500' };
  };

  const liveAvail = getHostLiveAvailability();

  // Multi-date mini calendar helpers
  const mYear = multiMonthDate.getFullYear();
  const mMonth = multiMonthDate.getMonth();
  const daysInMonth = new Date(mYear, mMonth + 1, 0).getDate();
  const firstDayIndex = new Date(mYear, mMonth, 1).getDay();

  if (loading) {
    return (
      <div className="min-h-[350px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 text-[#035352]">
          <div className="w-8 h-8 border-3 border-[#035352] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold">Loading Host Availability...</p>
        </div>
      </div>
    );
  }

  const allActiveOverrideDates = Array.from(
    new Set([...selectedDates, ...Object.keys(dateOverrides)])
  ).sort();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#172525]">My Availability</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure your regular working schedule, daily shift timings, lunch breaks, and scheduled leaves.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Availability'}</span>
        </button>
      </div>

      {/* Message Banner */}
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

      {/* Host Profile Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-5 sm:p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {host?.profile_pic ? (
            <img
              src={host.profile_pic}
              alt={host.full_name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#035352]/30 shadow-xs"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <User className="w-7 h-7 text-slate-400" />
            </div>
          )}

          <div>
            <h2 className="text-base font-black text-[#172525]">{host?.full_name || user?.full_name || 'Staff Member'}</h2>
            <p className="text-xs text-slate-500 font-medium">
              {[host?.designation, host?.department].filter(Boolean).join(' • ') || 'Host'}
            </p>
            <p className="text-[11px] text-slate-400">{host?.email || user?.email}</p>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <span className={`w-2.5 h-2.5 rounded-full ${liveAvail.dotClass}`} />
          <div className="text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Status</span>
            <span className="text-xs font-bold text-slate-800">{liveAvail.label}</span>
          </div>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-6 sm:p-8 space-y-8">
        
        {/* Section 1: Weekly Working Days */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#035352]" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Regular Working Days</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Select the days of the week you regularly work. On unselected days, you will automatically be marked as "Off Duty".
          </p>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
            {ALL_WEEKDAYS.map((day) => {
              const active = workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWorkingDay(day)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    active
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

        {/* Section 2: Shift Timings & Lunch Break */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#035352]" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Standard Working & Lunch Hours</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Your daily shift hours and lunch break timings applied throughout the year.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Shift Timings */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Daily Shift Hours</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 mb-1">Coming Time</span>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352]"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 mb-1">Going Time</span>
                  <input
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352]"
                  />
                </div>
              </div>
            </div>

            {/* Lunch Break */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Coffee className="w-4 h-4 text-amber-700" />
                <span>Lunch Break Timing</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 mb-1">Lunch Start</span>
                  <input
                    type="time"
                    value={lunchStartTime}
                    onChange={(e) => setLunchStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352]"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 mb-1">Lunch End</span>
                  <input
                    type="time"
                    value={lunchEndTime}
                    onChange={(e) => setLunchEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Planned Leaves & Special Dates */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#035352]" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Leaves & Date Exceptions</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Schedule planned leaves or adjust your availability hours for specific dates.
              </p>
            </div>

            {!showAddOverride && (
              <button
                type="button"
                onClick={() => setShowAddOverride(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#035352]/10 text-[#035352] hover:bg-[#035352]/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Mark Leave / Exception</span>
              </button>
            )}
          </div>

          {/* Add Override Inline Panel */}
          {showAddOverride && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">Add Date Exception</span>
                <button
                  type="button"
                  onClick={() => setShowAddOverride(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Selection Mode Toggle */}
              <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setOverrideMode('range')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    overrideMode === 'range' ? 'bg-white text-[#035352] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📅 Date Range (or Single Date)
                </button>
                <button
                  type="button"
                  onClick={() => setOverrideMode('multi')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    overrideMode === 'multi' ? 'bg-white text-[#035352] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🗓️ Pick Multiple Dates
                </button>
              </div>

              {/* Mode: Range */}
              {overrideMode === 'range' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-500 mb-1">Start Date</span>
                    <input
                      type="date"
                      min={todayStr}
                      value={overrideDate}
                      onChange={(e) => setOverrideDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352]"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-500 mb-1">End Date (Optional)</span>
                    <input
                      type="date"
                      min={overrideDate || todayStr}
                      value={overrideEndDate}
                      onChange={(e) => setOverrideEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352]"
                    />
                  </div>
                </div>
              )}

              {/* Mode: Multi Picker Calendar */}
              {overrideMode === 'multi' && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 max-w-sm mx-auto space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <button
                      type="button"
                      onClick={() => setMultiMonthDate(new Date(mYear, mMonth - 1, 1))}
                      className="p-1 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>
                      {multiMonthDate.toLocaleString('default', { month: 'long' })} {mYear}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMultiMonthDate(new Date(mYear, mMonth + 1, 1))}
                      className="p-1 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <span key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dStr = `${mYear}-${String(mMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isPast = dStr < todayStr;
                      const isSelected = multiDates.includes(dStr);
                      return (
                        <button
                          key={dStr}
                          type="button"
                          disabled={isPast}
                          onClick={() => toggleMultiDate(dStr)}
                          className={`h-7 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isSelected
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
                    <div className="text-[11px] font-bold text-[#035352] text-center pt-1">
                      {multiDates.length} date{multiDates.length > 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              )}

              {/* Exception Type: Leave vs Custom Hours */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <span className="block text-[11px] font-bold text-slate-500">Status for Selected Date(s)</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOverrideType('off')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      overrideType === 'off'
                        ? 'border-rose-300 bg-rose-50 text-rose-800 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🏖️ Full Day Leave
                  </button>

                  <button
                    type="button"
                    onClick={() => setOverrideType('custom')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      overrideType === 'custom'
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-800 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ⏱️ Custom Hours for Date
                  </button>
                </div>

                {overrideType === 'custom' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-1">Coming</span>
                      <input
                        type="time"
                        value={overrideWorkIn}
                        onChange={(e) => setOverrideWorkIn(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-1">Going</span>
                      <input
                        type="time"
                        value={overrideWorkOut}
                        onChange={(e) => setOverrideWorkOut(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-1">Lunch In</span>
                      <input
                        type="time"
                        value={overrideLunchIn}
                        onChange={(e) => setOverrideLunchIn(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-1">Lunch Out</span>
                      <input
                        type="time"
                        value={overrideLunchOut}
                        onChange={(e) => setOverrideLunchOut(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddOverride}
                className="w-full py-2 bg-[#035352] text-white rounded-xl text-xs font-bold hover:bg-[#023e3d] transition-all cursor-pointer"
              >
                Add to Scheduled Exceptions
              </button>
            </div>
          )}

          {/* List of Active Overrides & Leaves */}
          {allActiveOverrideDates.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs font-medium">
              No planned leaves or special date exceptions configured. Standard weekly schedule applies.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {allActiveOverrideDates.map((dStr) => {
                const isLeave = selectedDates.includes(dStr) || dateOverrides[dStr]?.type === 'off';
                const custom = dateOverrides[dStr];
                return (
                  <div
                    key={dStr}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="block text-xs font-bold text-slate-800">{dStr}</span>
                      {isLeave ? (
                        <span className="text-[11px] font-bold text-rose-600">🏖️ On Leave</span>
                      ) : (
                        <span className="text-[11px] font-bold text-indigo-700">
                          ⏱️ {custom?.available_from?.slice(0, 5)} - {custom?.available_to?.slice(0, 5)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOverride(dStr)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-all cursor-pointer"
                      title="Remove date exception"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
