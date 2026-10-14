import { useState, useEffect } from 'react';
import { 
  Save, Edit2, X, Upload, Building2, MapPin, Phone, Mail, Globe, 
  Settings as SettingsIcon, Calendar, Clock, Plus, Trash2, CalendarDays, Sparkles 
} from 'lucide-react';
import { organisationApi } from '@/api/services';
import type { Organisation, Holiday } from '@/types';
import { useAuth } from '../context/AuthContext';
import MessageVariableBuilder from '../components/UI/MessageVariableBuilder';

interface InfoFieldProps {
  label: string;
  value?: string;
  icon: React.ComponentType<{ className?: string }>;
}

function InfoField({ label, value, icon: Icon }: InfoFieldProps) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5 text-[#035352]" />
        {label}
      </div>
      <div className="font-bold text-xs text-[#172525]">{value || 'Not set'}</div>
    </div>
  );
}

interface EditFieldProps {
  label: string;
  name: string;
  value: string;
  type?: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function EditField({ label, name, value, type = 'text', icon: Icon, disabled = false, onChange }: EditFieldProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[#035352]" />
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm ${
          disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : ''
        }`}
      />
    </div>
  );
}

const ALL_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatDateBadge(dStr: string) {
  try {
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return dStr;
  } catch (_) {
    return dStr;
  }
}

function formatTime12(t?: string) {
  if (!t) return '09:00 AM';
  const parts = t.split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  if (isNaN(h)) return t;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
}

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const defaultAvailableMsg = 'Thank you for visiting :visitor_name! :host_name will be with you shortly.';
  const defaultUnavailableMsg = 'Thank you for your interest :visitor_name. :host_name is currently unavailable.';

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: '',  
    pincode: '',
    phone: '',
    email: '',
    website: '',
    logo_url: '',
    host_available_message: '',
    host_unavailable_message: '',
    working_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as string[],
    opening_time: '09:00',
    closing_time: '18:00',
    holidays: [] as Holiday[],
  });

  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayTitle, setNewHolidayTitle] = useState('');
  const [holidayError, setHolidayError] = useState('');

  const organisationId = user?.organisation_id || 1;

  useEffect(() => {
    const fetchOrganisation = async () => {
      try {
        const res = await organisationApi.getById(organisationId);
        if (res.data.success) {
          const data = res.data.data;
          setOrganisation(data);
          setFormData({
            name: data.name || '',
            code: data.code || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || '',
            pincode: data.pincode || '',
            phone: data.phone || '',
            email: data.email || '',
            website: data.website || '',
            logo_url: data.logo_url || '',
            host_available_message: data.host_available_message || defaultAvailableMsg,
            host_unavailable_message: data.host_unavailable_message || defaultUnavailableMsg,
            working_days: Array.isArray(data.working_days) && data.working_days.length > 0 
              ? data.working_days 
              : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            opening_time: data.opening_time ? data.opening_time.slice(0, 5) : '09:00',
            closing_time: data.closing_time ? data.closing_time.slice(0, 5) : '18:00',
            holidays: Array.isArray(data.holidays) ? data.holidays : [],
          });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load organisation data' });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisation();
  }, [organisationId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const toggleWorkingDay = (day: string) => {
    setFormData((prev) => {
      const exists = prev.working_days.includes(day);
      const nextDays = exists 
        ? prev.working_days.filter((d) => d !== day)
        : [...prev.working_days, day];
      return { ...prev, working_days: nextDays };
    });
  };

  const addHoliday = () => {
    setHolidayError('');
    if (!newHolidayDate) {
      setHolidayError('Please select a date for the holiday');
      return;
    }
    const title = newHolidayTitle.trim() || 'Official Holiday';
    if (formData.holidays.some((h) => h.date === newHolidayDate)) {
      setHolidayError('A holiday is already added for this date');
      return;
    }

    const updated = [...formData.holidays, { date: newHolidayDate, title }].sort((a, b) => 
      a.date.localeCompare(b.date)
    );
    setFormData((prev) => ({ ...prev, holidays: updated }));
    setNewHolidayDate('');
    setNewHolidayTitle('');
  };

  const removeHoliday = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((h) => h.date !== date),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'working_days' || key === 'holidays') {
          formDataToSend.append(key, JSON.stringify(formData[key as 'working_days' | 'holidays']));
        } else {
          formDataToSend.append(key, (formData as any)[key] || '');
        }
      });
      
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      const res = await organisationApi.update(organisationId, formDataToSend);
      const result = res.data;

      if (result.success) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        setOrganisation(result.data);
        setEditMode(false);
        setLogoFile(null);
        setLogoPreview(null);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (organisation) {
      setFormData({
        name: organisation.name || '',
        code: organisation.code || '',
        address: organisation.address || '',
        city: organisation.city || '',
        state: organisation.state || '',
        country: organisation.country || '',
        pincode: organisation.pincode || '',
        phone: organisation.phone || '',
        email: organisation.email || '',
        website: organisation.website || '',
        logo_url: organisation.logo_url || '',
        host_available_message: organisation.host_available_message || defaultAvailableMsg,
        host_unavailable_message: organisation.host_unavailable_message || defaultUnavailableMsg,
        working_days: Array.isArray(organisation.working_days) && organisation.working_days.length > 0 
          ? organisation.working_days 
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        opening_time: organisation.opening_time ? organisation.opening_time.slice(0, 5) : '09:00',
        closing_time: organisation.closing_time ? organisation.closing_time.slice(0, 5) : '18:00',
        holidays: Array.isArray(organisation.holidays) ? organisation.holidays : [],
      });
      setLogoPreview(null);
      setLogoFile(null);
    }
    setNewHolidayDate('');
    setNewHolidayTitle('');
    setHolidayError('');
    setEditMode(false);
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 text-[#035352]">
          <div className="w-8 h-8 border-3 border-[#035352] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold">Loading Organisation Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#172525]">Organisation Settings</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure organisation details, working days, visiting hours, official holidays, and gate messaging
          </p>
        </div>

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
            Edit Settings
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
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

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-6 sm:p-8 space-y-8">
        {/* Logo Section */}
        <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
          <div className="w-20 h-20 overflow-hidden rounded-2xl border-2 border-[#035352]/30 bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-1" />
            ) : formData.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <Building2 className="h-10 w-10 text-slate-300" />
            )}
          </div>
          {editMode ? (
            <div>
              <label className="cursor-pointer px-4 py-2.5 rounded-xl font-bold text-xs bg-[#035352]/10 text-[#035352] border border-[#035352]/20 hover:bg-[#035352]/20 transition-all inline-flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Upload Logo Image</span>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">PNG, JPG formats supported</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-[#172525]">{formData.name || 'Organisation Logo'}</p>
              <p className="text-xs text-slate-400 font-medium">Branding logo displayed on visitor gate pass</p>
            </div>
          )}
        </div>

        {/* Section 1: Organisation Details */}
        <div>
          <h2 className="text-sm font-black text-[#172525] mb-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#035352]" />
            Organisation Profile & Contact
          </h2>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Official company address, contact phone, and public registration credentials
          </p>

          {!editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <InfoField label="Organisation Name" value={formData.name} icon={Building2} />
              <InfoField label="Organisation Code" value={formData.code} icon={Building2} />
              <InfoField label="Street Address" value={formData.address} icon={MapPin} />
              <InfoField label="City" value={formData.city} icon={MapPin} />
              <InfoField label="State" value={formData.state} icon={MapPin} />
              <InfoField label="Country" value={formData.country} icon={MapPin} />
              <InfoField label="Pincode" value={formData.pincode} icon={MapPin} />
              <InfoField label="Phone Contact" value={formData.phone} icon={Phone} />
              <InfoField label="Email Address" value={formData.email} icon={Mail} />
              <InfoField label="Website URL" value={formData.website} icon={Globe} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditField label="Organisation Name" name="name" value={formData.name} icon={Building2} onChange={handleChange} />
              <EditField label="Code" name="code" value={formData.code} icon={Building2} disabled onChange={handleChange} />
              <EditField label="Street Address" name="address" value={formData.address} icon={MapPin} onChange={handleChange} />
              <EditField label="City" name="city" value={formData.city} icon={MapPin} onChange={handleChange} />
              <EditField label="State" name="state" value={formData.state} icon={MapPin} onChange={handleChange} />
              <EditField label="Country" name="country" value={formData.country} icon={MapPin} onChange={handleChange} />
              <EditField label="Pincode" name="pincode" value={formData.pincode} icon={MapPin} onChange={handleChange} />
              <EditField label="Phone Contact" name="phone" value={formData.phone} icon={Phone} onChange={handleChange} />
              <EditField label="Email Address" name="email" value={formData.email} icon={Mail} onChange={handleChange} />
              <EditField label="Website URL" name="website" value={formData.website} icon={Globe} onChange={handleChange} />
            </div>
          )}
        </div>

        {/* Section 2: Operating Schedule & Visiting Hours */}
        <div className="pt-6 border-t border-slate-100 space-y-6">
          <div>
            <h2 className="text-sm font-black text-[#172525] mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#035352]" />
              Opening Days & Visiting Hours
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Configure overall working days and daily gate timings. Visitors arriving outside these hours or on off-days will see that the premises are closed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            {/* Opening Days */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-[#035352]" />
                Weekly Working Days
              </label>

              <div className="flex flex-wrap gap-2">
                {ALL_WEEKDAYS.map((day) => {
                  const isActive = formData.working_days.includes(day);
                  if (!editMode) {
                    return (
                      <span
                        key={day}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isActive
                            ? 'bg-[#035352] text-white border-[#035352] shadow-xs'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        {day}
                      </span>
                    );
                  }

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWorkingDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isActive
                          ? 'bg-[#035352] text-white border-[#035352] shadow-xs'
                          : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {editMode ? 'Click days to toggle organisation working schedule.' : 'Active days when the gate pass reception is open.'}
              </p>
            </div>

            {/* Daily Timings */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#035352]" />
                Visiting & Reception Hours
              </label>

              {!editMode ? (
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2 text-xs font-bold text-[#172525]">
                    <span className="text-slate-400 font-medium">Opens:</span>
                    <span>{formatTime12(formData.opening_time)}</span>
                  </div>
                  <span className="text-slate-400 font-bold">to</span>
                  <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2 text-xs font-bold text-[#172525]">
                    <span className="text-slate-400 font-medium">Closes:</span>
                    <span>{formatTime12(formData.closing_time)}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-500 mb-1">Opening Time</span>
                    <input
                      type="time"
                      name="opening_time"
                      value={formData.opening_time}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 shadow-sm"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-500 mb-1">Closing Time</span>
                    <input
                      type="time"
                      name="closing_time"
                      value={formData.closing_time}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 shadow-sm"
                    />
                  </div>
                </div>
              )}
              <p className="text-[11px] text-slate-400 font-medium">
                Visitors registering before or after these hours will be notified that the organisation is closed.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Official Holidays & Special Closures */}
        <div className="pt-6 border-t border-slate-100 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-black text-[#172525] mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#035352]" />
                Official Holidays & Closures
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Add public holidays and festive closures with their occasion titles. When visitors arrive on these dates, Digi-Gate clearly states that the premises are closed on behalf of the specific holiday.
              </p>
            </div>
          </div>

          {/* Add Holiday Form (Only in Edit Mode) */}
          {editMode && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Add New Holiday
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="w-full sm:w-48">
                  <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newHolidayDate}
                    onChange={(e) => {
                      setNewHolidayDate(e.target.value);
                      setHolidayError('');
                    }}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-[#035352] shadow-sm"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                    Occasion / Holiday Title (e.g., Independence Day, Diwali, Annual Off)
                  </label>
                  <input
                    type="text"
                    value={newHolidayTitle}
                    placeholder="e.g. Independence Day, Diwali, Annual Company Off"
                    onChange={(e) => {
                      setNewHolidayTitle(e.target.value);
                      setHolidayError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHoliday();
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl outline-none text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#035352] shadow-sm"
                  />
                </div>

                <div className="sm:self-end">
                  <button
                    type="button"
                    onClick={addHoliday}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#035352] text-white rounded-xl text-xs font-bold hover:bg-[#023e3d] transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Holiday</span>
                  </button>
                </div>
              </div>

              {holidayError && (
                <p className="text-xs font-bold text-rose-600 mt-1">{holidayError}</p>
              )}
            </div>
          )}

          {/* Holiday List */}
          {formData.holidays.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs font-medium space-y-1">
              <Calendar className="w-6 h-6 mx-auto text-slate-300" />
              <p>No official holidays added yet.</p>
              <p className="text-[11px] text-slate-400">Standard working schedule applies every week.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {formData.holidays.map((h) => (
                <div
                  key={h.date}
                  className="p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between gap-3 group hover:border-[#035352]/40 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#035352] shrink-0" />
                      <span className="text-xs font-black text-slate-800 tracking-tight">
                        {formatDateBadge(h.date)}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 inline-block truncate max-w-full">
                      🎉 {h.title}
                    </div>
                  </div>

                  {editMode && (
                    <button
                      type="button"
                      onClick={() => removeHoliday(h.date)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      title="Remove Holiday"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Gate Confirmation Messaging */}
        <div className="pt-6 border-t border-slate-100 space-y-6">
          <div>
            <h2 className="text-sm font-black text-[#172525] mb-1">Custom Gate Confirmation Messaging</h2>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Design custom clearance responses for your visitors. Use the interactive variable buttons below to insert visitor & host names automatically.
            </p>
          </div>

          <MessageVariableBuilder
            label="Host Available Confirmation Message"
            name="host_available_message"
            value={formData.host_available_message}
            onValueChange={(val) => setFormData((prev) => ({ ...prev, host_available_message: val }))}
            defaultMessage={defaultAvailableMsg}
            disabled={!editMode}
          />

          <MessageVariableBuilder
            label="Host Unavailable Notification Message"
            name="host_unavailable_message"
            value={formData.host_unavailable_message}
            onValueChange={(val) => setFormData((prev) => ({ ...prev, host_unavailable_message: val }))}
            defaultMessage={defaultUnavailableMsg}
            disabled={!editMode}
          />
        </div>
      </div>
    </div>
  );
}