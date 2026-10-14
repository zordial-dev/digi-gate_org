import { useState, useEffect } from 'react';
import { 
  Send, Plus, Search, Copy, Check, Calendar, 
  User, CheckCircle2, AlertCircle, Share2, X, RefreshCw,
  Phone, Sparkles, Ban
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { invitationApi, hostApi } from '@/api/services';
import type { Invitation, Host } from '@/types';

export default function Invitations() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');
  
  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  
  // Create Form State
  const [visitorName, setVisitorName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [purpose, setPurpose] = useState('Meeting');
  const [customPurpose, setCustomPurpose] = useState('');
  const [selectedHostId, setSelectedHostId] = useState<string>('');
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [validityDuration, setValidityDuration] = useState('today');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Success Modal
  const [createdInvitation, setCreatedInvitation] = useState<Invitation | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const isHost = user?.role === 'host' || user?.org_user_role === 'host';
  const organisationId = user?.organisation_id || (user as any)?.org_id || 1;
  const currentHostId = isHost && user?.id ? String(user.id) : '';

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const params: any = {
        organisation_id: organisationId,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      if (isHost && user?.id) {
        params.host_id = user.id;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await invitationApi.getAll(params);
      if (res.data.success && res.data.data) {
        setInvitations(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [statusFilter, searchQuery]);

  // Load hosts list if admin/subadmin
  useEffect(() => {
    if (!isHost) {
      hostApi.getAll(organisationId, { is_active: true }).then((res) => {
        if (res.data.success && res.data.data) {
          setHosts(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedHostId(String(res.data.data[0].id));
          }
        }
      }).catch(console.error);
    } else {
      setSelectedHostId(currentHostId);
    }
  }, [isHost, organisationId, currentHostId]);

  const handleOpenCreateModal = () => {
    setVisitorName('');
    setMobileNumber('');
    setPurpose('Meeting');
    setCustomPurpose('');
    setSelectedHostId(isHost ? currentHostId : (hosts[0]?.id ? String(hosts[0].id) : ''));
    setVisitDate(new Date().toISOString().slice(0, 10));
    setValidityDuration('today');
    setAdditionalNotes('');
    setCreateError('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!visitorName.trim()) {
      setCreateError('Visitor full name is required');
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10 || !/^[6-9]/.test(cleanMobile)) {
      setCreateError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    const effectivePurpose = purpose === 'Other' ? customPurpose.trim() : purpose;
    if (!effectivePurpose) {
      setCreateError('Purpose of visit is required');
      return;
    }

    const hostIdToUse = isHost ? parseInt(currentHostId, 10) : parseInt(selectedHostId, 10);
    if (!hostIdToUse) {
      setCreateError('Please select a host for this invitation');
      return;
    }

    setSubmitting(true);
    try {
      const res = await invitationApi.create({
        organisation_id: organisationId,
        host_id: hostIdToUse,
        visitor_name: visitorName.trim(),
        mobile_number: cleanMobile,
        purpose_of_visit: effectivePurpose,
        valid_date: visitDate,
        validity_duration: validityDuration,
        additional_notes: additionalNotes.trim() || undefined,
      });

      if (res.data.success && res.data.data) {
        setShowCreateModal(false);
        setCreatedInvitation(res.data.data);
        fetchInvitations();
      } else {
        setCreateError(res.data.error || 'Failed to create invitation');
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.error || err.message || 'Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInvitation = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) return;
    try {
      await invitationApi.cancel(id);
      fetchInvitations();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel invitation');
    }
  };

  const copyToClipboard = (text: string, type: 'code' | 'msg') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  const formatShareMessage = (inv: Invitation) => {
    const hostName = inv.host?.full_name || user?.full_name || 'Your Host';
    const orgName = inv.organisation?.name || 'DigiGate Organisation';
    return `Hi ${inv.visitor_name},\n\nYou have been invited to visit ${orgName} by ${hostName}.\n\n` +
      `🔑 Your Invitation Code: ${inv.invitation_code}\n` +
      `📅 Date: ${inv.valid_date}\n` +
      `🎯 Purpose: ${inv.purpose_of_visit}\n` +
      (inv.additional_notes ? `📝 Note: ${inv.additional_notes}\n` : '') +
      `\nPlease present this code at the gate entrance for fast-track entry.`;
  };

  // Stats calculation
  const totalCount = invitations.length;
  const activeCount = invitations.filter((i) => i.status === 'active').length;
  const usedCount = invitations.filter((i) => i.status === 'used').length;
  const expiredCount = invitations.filter((i) => i.status === 'expired' || i.status === 'cancelled').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold">
              <Send className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#172525]">
              {isHost ? 'My Visitor Invitations' : 'Visitor Invitations'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Pre-approve guests and generate unique invitation codes for streamlined, fast-track check-in.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Visitor</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Invitations</p>
          <p className="text-2xl font-black text-[#172525] mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active Passes</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Used / Checked-In</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{usedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expired / Closed</p>
          <p className="text-2xl font-black text-slate-600 mt-1">{expiredCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, or code..."
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-[#035352] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'active', 'used', 'expired'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-[#035352] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'all' ? 'All Invitations' : tab}
            </button>
          ))}
          <button
            onClick={fetchInvitations}
            title="Refresh"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Invitations List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#035352] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold">Loading invitations...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">No invitations found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search query or filter tab.' 
                  : 'Create your first invitation to grant fast-track entry to guests.'}
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#035352] hover:bg-[#023e3d] transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite New Visitor</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Visitor</th>
                  {!isHost && <th className="py-3 px-4">Host</th>}
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Visit Date & Validity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {invitations.map((inv) => {
                  const isActive = inv.status === 'active';
                  const isUsed = inv.status === 'used';
                  const isExpired = inv.status === 'expired';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#035352]">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200/80">
                            {inv.invitation_code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(inv.invitation_code, 'code')}
                            title="Copy code"
                            className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-extrabold text-[#172525]">{inv.visitor_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">+91 {inv.mobile_number}</p>
                        </div>
                      </td>

                      {!isHost && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {inv.host?.profile_pic ? (
                              <img src={inv.host.profile_pic} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                                {inv.host?.full_name?.charAt(0) || 'H'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-[#172525]">{inv.host?.full_name || 'Staff'}</p>
                              <p className="text-[10px] text-slate-400">{inv.host?.department || ''}</p>
                            </div>
                          </div>
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{inv.purpose_of_visit}</p>
                        {inv.additional_notes && (
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {inv.additional_notes}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{inv.valid_date}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Until {new Date(inv.valid_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        )}
                        {isUsed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                            <CheckCircle2 className="w-3 h-3 text-blue-500" />
                            Used
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
                            Expired
                          </span>
                        )}
                        {inv.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                            Cancelled
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const shareText = formatShareMessage(inv);
                              copyToClipboard(shareText, 'msg');
                              alert('Invitation message copied to clipboard!');
                            }}
                            title="Copy share message"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#035352] hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {isActive && (
                            <button
                              onClick={() => handleCancelInvitation(inv.id)}
                              title="Cancel Invitation"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Invite Visitor Form */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#172525]">Invite Visitor</h3>
                  <p className="text-xs text-slate-500">Generate a pre-approved pass code for your guest</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-semibold">
              {/* Visitor Name */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Visitor Full Name *
                </label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#035352] focus:ring-1 focus:ring-[#035352] outline-none text-xs font-bold"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Visitor Mobile Number *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 border border-r-0 border-slate-300 rounded-l-xl font-bold bg-slate-50 text-slate-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-r-xl border border-slate-300 focus:border-[#035352] focus:ring-1 focus:ring-[#035352] outline-none text-xs font-bold"
                    required
                  />
                </div>
              </div>

              {/* Host Selection (If admin) */}
              {!isHost ? (
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Host Person *
                  </label>
                  <select
                    value={selectedHostId}
                    onChange={(e) => setSelectedHostId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#035352] outline-none text-xs font-bold bg-white"
                  >
                    {hosts.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.full_name} ({h.department || 'Host'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#035352]" />
                    <span className="text-xs font-bold text-[#035352]">
                      Host: {user?.full_name || 'You'}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-100 text-[#035352]">
                    Linked Host
                  </span>
                </div>
              )}

              {/* Purpose of Visit */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Purpose of Visit *
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['Meeting', 'Interview', 'Client Visit', 'Vendor / Supplier', 'Delivery', 'Other'].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPurpose(p)}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                        purpose === p
                          ? 'bg-[#035352] text-white border-[#035352] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {purpose === 'Other' && (
                  <input
                    type="text"
                    value={customPurpose}
                    onChange={(e) => setCustomPurpose(e.target.value)}
                    placeholder="Enter custom purpose of visit..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#035352] outline-none text-xs font-bold mt-1"
                  />
                )}
              </div>

              {/* Visit Date & Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#035352] outline-none text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Validity Duration
                  </label>
                  <select
                    value={validityDuration}
                    onChange={(e) => setValidityDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#035352] outline-none text-xs font-bold bg-white"
                  >
                    <option value="today">Today Only (Until Midnight)</option>
                    <option value="24h">24 Hours from now</option>
                    <option value="48h">48 Hours (2 Days)</option>
                    <option value="3d">3 Days</option>
                    <option value="7d">7 Days</option>
                  </select>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / Instructions (Optional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Please bring laptop and report to 3rd Floor Reception..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-[#035352] outline-none text-xs font-semibold resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#035352] hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Code...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Create Invitation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Invitation Created Success Modal */}
      {createdInvitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200/80">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-[#172525]">Invitation Created!</h3>
              <p className="text-xs text-slate-500 font-medium">
                Share this unique code with <strong className="text-slate-800">{createdInvitation.visitor_name}</strong>
              </p>
            </div>

            {/* Code Highlight Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-[#035352]/40 text-center space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#035352]">
                Invitation Pass Code
              </span>
              <div className="text-3xl font-mono font-black text-[#035352] tracking-wider">
                {createdInvitation.invitation_code}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Valid on {createdInvitation.valid_date} • Mobile: +91 {createdInvitation.mobile_number}
              </p>
            </div>

            {/* Quick Share Actions */}
            <div className="space-y-2">
              <button
                onClick={() => copyToClipboard(createdInvitation.invitation_code, 'code')}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Code Only'}</span>
              </button>

              <button
                onClick={() => {
                  const shareMsg = formatShareMessage(createdInvitation);
                  copyToClipboard(shareMsg, 'msg');
                }}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#035352] hover:bg-[#023e3d] text-white flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#035352]/20 transition-all"
              >
                {copiedMessage ? <Check className="w-4 h-4 text-[#F3E8BC]" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedMessage ? 'Message Copied!' : 'Copy Invitation Message'}</span>
              </button>

              <a
                href={`https://wa.me/91${createdInvitation.mobile_number}?text=${encodeURIComponent(formatShareMessage(createdInvitation))}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>
            </div>

            <button
              onClick={() => setCreatedInvitation(null)}
              className="w-full py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer text-center"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
