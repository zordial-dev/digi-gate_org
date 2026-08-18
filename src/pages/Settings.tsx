import { useState, useEffect } from 'react';
import { Save, Edit2, X, Upload, Building2, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { organisationApi } from '@/api/services';
import type { Organisation } from '@/types';

import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
            host_available_message: data.host_available_message || '',
            host_unavailable_message: data.host_unavailable_message || '',
          });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load organisation data' });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisation();
  }, []);

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
        host_available_message: organisation.host_available_message || '',
        host_unavailable_message: organisation.host_unavailable_message || '',
      });
      setLogoPreview(null);
      setLogoFile(null);
    }
    setEditMode(false);
    setMessage(null);
  };

  if (loading) {
    return <div className="text-center py-8" style={{ color: '#64748b' }}>Loading...</div>;
  }

  const InfoField = ({ label, value, icon: Icon }: any) => (
    <div className="py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
      <div className="flex items-center gap-2 text-sm mb-1" style={{ color: '#64748b' }}>
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="font-semibold" style={{ color: '#0f172a' }}>{value || 'Not set'}</div>
    </div>
  );

  const EditField = ({ label, name, value, type = 'text', icon: Icon, disabled = false }: any) => (
    <div>
      <label className="block text-sm font-semibold mb-1.5 flex items-center gap-2" style={{ color: '#3F5885' }}>
        <Icon className="h-4 w-4" style={{ color: '#94a3b8' }} />
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-all ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
        style={{
          borderColor: '#021767',
          color: '#3F5885',
          fontWeight: 500,
          fontSize: '0.95rem',
          backgroundColor: disabled ? '#f8fafc' : '#ffffff'
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = '#289CD8';
            e.target.style.boxShadow = '0 0 0 3px rgba(40, 156, 216, 0.2)';
          }
        }}
        onBlur={(e) => {
          if (!disabled) {
            e.target.style.borderColor = '#021767';
            e.target.style.boxShadow = 'none';
          }
        }}
      />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#06216B' }}>Settings</h1>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #153D9F 0%, #06216B 100%)',
              boxShadow: '0 6px 18px rgba(2, 29, 91, 0.2)',
              border: '1px solid #021767'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #06216B 0%, #021D5B 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #153D9F 0%, #06216B 100%)';
            }}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all"
              style={{
                border: '1px solid #021767',
                color: '#3F5885',
                backgroundColor: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(6, 33, 107, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #153D9F 0%, #06216B 100%)',
                boxShadow: '0 6px 18px rgba(2, 29, 91, 0.2)',
                border: '1px solid #021767'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #06216B 0%, #021D5B 100%)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #153D9F 0%, #06216B 100%)';
                }
              }}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div 
          className={`mb-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div 
        className="rounded-xl p-6"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #021767',
          boxShadow: '0 4px 16px rgba(2, 29, 91, 0.08)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-4 mb-6">
          <div 
            className="w-20 h-20 overflow-hidden rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#f8fafc', border: '1px solid #021767' }}
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
            ) : formData.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Building2 className="h-10 w-10" style={{ color: '#94a3b8' }} />
            )}
          </div>
          {editMode && (
            <div>
              <label 
                className="cursor-pointer px-4 py-2 rounded-xl font-semibold transition-all"
                style={{
                  border: '1px solid #021767',
                  color: '#3F5885',
                  backgroundColor: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(6, 33, 107, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <Upload className="h-4 w-4 inline mr-2" />
                Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>PNG, JPG up to 2MB</p>
            </div>
          )}
          {!editMode && formData.logo_url && (
            <p className="text-sm" style={{ color: '#64748b' }}>Logo uploaded</p>
          )}
        </div>

        {!editMode ? (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Organisation Name" value={formData.name} icon={Building2} />
            <InfoField label="Code" value={formData.code} icon={Building2} />
            <InfoField label="Address" value={formData.address} icon={MapPin} />
            <InfoField label="City" value={formData.city} icon={MapPin} />
            <InfoField label="State" value={formData.state} icon={MapPin} />
            <InfoField label="Country" value={formData.country} icon={MapPin} />
            <InfoField label="Pincode" value={formData.pincode} icon={MapPin} />
            <InfoField label="Phone" value={formData.phone} icon={Phone} />
            <InfoField label="Email" value={formData.email} icon={Mail} />
            <InfoField label="Website" value={formData.website} icon={Globe} />
            <div className="md:col-span-2">
              <div className="py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div className="text-sm mb-1" style={{ color: '#64748b' }}>Host Available Message</div>
                <div className="font-semibold" style={{ color: '#0f172a' }}>{formData.host_available_message || 'Not set'}</div>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="py-3">
                <div className="text-sm mb-1" style={{ color: '#64748b' }}>Host Unavailable Message</div>
                <div className="font-semibold" style={{ color: '#0f172a' }}>{formData.host_unavailable_message || 'Not set'}</div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditField label="Organisation Name" name="name" value={formData.name} icon={Building2} />
              <EditField label="Code" name="code" value={formData.code} icon={Building2} disabled />
              <EditField label="Address" name="address" value={formData.address} icon={MapPin} />
              <EditField label="City" name="city" value={formData.city} icon={MapPin} />
              <EditField label="State" name="state" value={formData.state} icon={MapPin} />
              <EditField label="Country" name="country" value={formData.country} icon={MapPin} />
              <EditField label="Pincode" name="pincode" value={formData.pincode} icon={MapPin} />
              <EditField label="Phone" name="phone" value={formData.phone} icon={Phone} />
              <EditField label="Email" name="email" value={formData.email} icon={Mail} />
              <EditField label="Website" name="website" value={formData.website} icon={Globe} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Host Available Message</label>
              <textarea
                name="host_available_message"
                value={formData.host_available_message}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all resize-none"
                style={{
                  borderColor: '#021767',
                  color: '#3F5885',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  backgroundColor: '#ffffff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#289CD8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(40, 156, 216, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#021767';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Use {'{visitor_name}'} and {'{host_name}'} as placeholders</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Host Unavailable Message</label>
              <textarea
                name="host_unavailable_message"
                value={formData.host_unavailable_message}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all resize-none"
                style={{
                  borderColor: '#021767',
                  color: '#3F5885',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  backgroundColor: '#ffffff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#289CD8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(40, 156, 216, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#021767';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Use {'{visitor_name}'} and {'{host_name}'} as placeholders</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}