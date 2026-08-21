import { useState, useEffect } from 'react';
import { Save, Edit2, X, Upload, Building2, MapPin, Phone, Mail, Globe, Settings as SettingsIcon } from 'lucide-react';
import { organisationApi } from '@/api/services';
import type { Organisation } from '@/types';
import { useAuth } from '../context/AuthContext';
import QRCodeSection from '../components/UI/QRCodeSection';
import MessageVariableBuilder from '../components/UI/MessageVariableBuilder';

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
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key as keyof typeof formData]);
      });
      
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      const token = localStorage.getItem('digi_gate_token') || sessionStorage.getItem('digi_gate_token');
      const res = await fetch(`http://localhost:5000/api/organisations/${organisationId}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formDataToSend,
      });

      const result = await res.json();

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
      });
      setLogoPreview(null);
      setLogoFile(null);
    }
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

  const InfoField = ({ label, value, icon: Icon }: any) => (
    <div className="py-3 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5 text-[#035352]" />
        {label}
      </div>
      <div className="font-bold text-xs text-[#172525]">{value || 'Not set'}</div>
    </div>
  );

  const EditField = ({ label, name, value, type = 'text', icon: Icon, disabled = false }: any) => (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[#035352]" />
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20 transition-all shadow-sm ${
          disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : ''
        }`}
      />
    </div>
  );

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
          <p className="text-xs text-slate-500 font-medium mt-1">Configure organisation details, logo branding, and gate messaging</p>
        </div>

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all disabled:opacity-50"
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

      {/* QR Code Section */}
      <QRCodeSection
        orgId={organisationId}
        orgName={formData.name || 'Organisation'}
        orgCode={formData.code}
        logoUrl={formData.logo_url}
      />

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-6 sm:p-8 space-y-6">
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

        {!editMode ? (
          /* View Mode Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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

            {/* Interactive Custom Messages in View Mode */}
            <div className="md:col-span-2 pt-4 border-t border-slate-100 space-y-4">
              <MessageVariableBuilder
                label="Host Available Confirmation Message"
                name="host_available_message"
                value={formData.host_available_message}
                onChange={handleChange}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, host_available_message: val }))}
                defaultMessage={defaultAvailableMsg}
                disabled={true}
              />

              <MessageVariableBuilder
                label="Host Unavailable Notification Message"
                name="host_unavailable_message"
                value={formData.host_unavailable_message}
                onChange={handleChange}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, host_unavailable_message: val }))}
                defaultMessage={defaultUnavailableMsg}
                disabled={true}
              />
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditField label="Organisation Name" name="name" value={formData.name} icon={Building2} />
              <EditField label="Code" name="code" value={formData.code} icon={Building2} disabled />
              <EditField label="Street Address" name="address" value={formData.address} icon={MapPin} />
              <EditField label="City" name="city" value={formData.city} icon={MapPin} />
              <EditField label="State" name="state" value={formData.state} icon={MapPin} />
              <EditField label="Country" name="country" value={formData.country} icon={MapPin} />
              <EditField label="Pincode" name="pincode" value={formData.pincode} icon={MapPin} />
              <EditField label="Phone Contact" name="phone" value={formData.phone} icon={Phone} />
              <EditField label="Email Address" name="email" value={formData.email} icon={Mail} />
              <EditField label="Website URL" name="website" value={formData.website} icon={Globe} />
            </div>

            {/* No-Code Interactive Message Variable Builders */}
            <div className="pt-4 border-t border-slate-100 space-y-6">
              <div>
                <h3 className="text-sm font-black text-[#172525] mb-1">Custom Gate Confirmation Messaging</h3>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  Design custom clearance responses for your visitors. Use the interactive variable buttons below to insert visitor & host names automatically.
                </p>
              </div>

              <MessageVariableBuilder
                label="Host Available Confirmation Message"
                name="host_available_message"
                value={formData.host_available_message}
                onChange={handleChange}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, host_available_message: val }))}
                defaultMessage={defaultAvailableMsg}
                disabled={false}
              />

              <MessageVariableBuilder
                label="Host Unavailable Notification Message"
                name="host_unavailable_message"
                value={formData.host_unavailable_message}
                onChange={handleChange}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, host_unavailable_message: val }))}
                defaultMessage={defaultUnavailableMsg}
                disabled={false}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}