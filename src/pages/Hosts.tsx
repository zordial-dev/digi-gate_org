import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload, User } from 'lucide-react';
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
      is_available: host.is_available ?? true,
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

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);    
  setMessage(null);

  try {
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      // Convert boolean to string for FormData
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

  if (loading) {
    return <div className="text-center py-8" style={{ color: '#64748b' }}>Loading hosts...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#06216B' }}>Hosts</h1>
        <button
          onClick={openCreateModal}
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
          <Plus className="h-4 w-4" />
          Add Host
        </button>
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
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #021767',
          boxShadow: '0 4px 16px rgba(2, 29, 91, 0.08)'
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #021767' }}>
              <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Profile</th>
              <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Name</th>
              <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Designation</th>
              <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Department</th>
              <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Email</th>
              <th className="text-left px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Status</th>
              <th className="text-right px-4 py-3 font-bold" style={{ color: '#3F5885' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8" style={{ color: '#94a3b8' }}>No hosts found</td>
              </tr>
            ) : (
              hosts.map((host) => (
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
                  <td className="px-4 py-3 font-semibold" style={{ color: '#0f172a' }}>{host.full_name}</td>
                  <td className="px-4 py-3" style={{ color: '#3F5885' }}>{host.designation || '-'}</td>
                  <td className="px-4 py-3" style={{ color: '#3F5885' }}>{host.department || '-'}</td>
                  <td className="px-4 py-3" style={{ color: '#3F5885' }}>{host.email}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAvailability(host.id, host.is_available)}
                      className="text-xs px-2 py-1 rounded-full font-semibold transition-all"
                      style={{
                        backgroundColor: host.is_available ? '#dcfce7' : '#fee2e2',
                        color: host.is_available ? '#15803d' : '#dc2626'
                      }}
                    >
                      {host.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(host)}
                        className="p-1.5 rounded-lg transition-all"
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal with Zordial styling */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            style={{
              border: '1px solid #021767',
              boxShadow: '0 20px 60px rgba(2, 29, 91, 0.25)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#06216B' }}>
                {editingHost ? 'Edit Host' : 'Add New Host'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: '#94a3b8' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#3F5885';
                  e.currentTarget.style.backgroundColor = 'rgba(6, 33, 107, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X className="h-5 w-5" />
              </button>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: '#f1f5f9', border: '1px solid #021767' }}
                  >
                    {profilePicPreview ? (
                      <img src={profilePicPreview} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8" style={{ color: '#94a3b8' }} />
                    )}
                  </div>
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
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F5885' }}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl outline-none transition-all"
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
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                    className="w-4 h-4 rounded focus:ring-2"
                    style={{
                      borderColor: '#021767',
                      accentColor: '#06216B'
                    }}
                  />
                  <span className="text-sm font-semibold" style={{ color: '#3F5885' }}>Available</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-all"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #153D9F 0%, #06216B 100%)',
                    boxShadow: '0 6px 18px rgba(2, 29, 91, 0.2)',
                    border: '1px solid #021767'
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #06216B 0%, #021D5B 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #153D9F 0%, #06216B 100%)';
                    }
                  }}
                >
                  {submitting ? 'Saving...' : editingHost ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}