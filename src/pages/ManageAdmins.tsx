import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  UserCog, 
  RefreshCw,
  XCircle,
  Plus,
  Edit2,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
  UserX
} from 'lucide-react';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Modal from '@/components/UI/Modal';
import { organisationUserApi } from '@/api/services';
import { OrganisationUserItem } from '@/types';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function ManageAdmins() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [admins, setAdmins] = useState<OrganisationUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<OrganisationUserItem | null>(null);

  // Add form fields
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Edit form fields
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  // Fetch admin users
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await organisationUserApi.getAll();
      if (response.data.success) {
        setAdmins(response.data.data);
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.error || err.message || 'Failed to load organisation administrators.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Open Create Modal
  const openAddModal = () => {
    setAddEmail('');
    setAddPassword('');
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (admin: OrganisationUserItem) => {
    setSelectedAdmin(admin);
    setEditIsActive(admin.is_active);
    setIsEditModalOpen(true);
  };


  // Handle Add Admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim() || !addPassword.trim()) {
      showToast('Validation Error', 'Email and password are required.', 'error');
      return;
    }

    if (addPassword.trim().length < 6) {
      showToast('Validation Error', 'Password must be at least 6 characters.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await organisationUserApi.create({
        email: addEmail.trim(),
        password: addPassword.trim(),
        role: 'sub_admin',
      });

      if (res.data.success) {
        showToast(
          'Sub Admin Created',
          `${addEmail} has been added as a Sub Admin.`,
          'success'
        );
        setIsAddModalOpen(false);
        fetchAdmins();
      }
    } catch (err: any) {
      showToast('Creation Failed', err.response?.data?.error || err.message || 'Failed to create sub administrator.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Admin
  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    setSubmitting(true);
    try {
      const res = await organisationUserApi.update(selectedAdmin.id, {
        is_active: editIsActive,
      });

      if (res.data.success) {
        showToast(
          'Account Updated',
          `Account status for ${selectedAdmin.email} has been updated.`,
          'success'
        );
        setIsEditModalOpen(false);
        fetchAdmins();
      }
    } catch (err: any) {
      showToast('Update Failed', err.response?.data?.error || err.message || 'Failed to update administrator.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Quick Toggle Active
  const handleToggleActive = async (admin: OrganisationUserItem) => {
    const nextState = !admin.is_active;
    try {
      await organisationUserApi.update(admin.id, { is_active: nextState });
      showToast(
        nextState ? 'Admin Activated' : 'Admin Deactivated',
        `${admin.email} has been ${nextState ? 'activated' : 'deactivated'}.`,
        nextState ? 'success' : 'info'
      );
      fetchAdmins();
    } catch (err: any) {
      showToast('Action Failed', err.response?.data?.error || err.message || 'Failed to update status.', 'error');
    }
  };


  // Search & Filters
  const filteredAdmins = admins.filter((a) => {
    const term = search.toLowerCase();
    const roleDisplay = a.role === 'sub_admin' ? 'sub admin' : 'admin';
    return (
      a.email.toLowerCase().includes(term) ||
      a.role.toLowerCase().includes(term) ||
      roleDisplay.includes(term)
    );
  });

  const totalAdmins = admins.length;
  const superAdminCount = admins.filter((a) => a.role === 'admin' || a.role === 'super_admin').length;
  const subAdmins = admins.filter((a) => a.role === 'sub_admin').length;
  const inactiveCount = admins.filter((a) => !a.is_active).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#035352]/10 flex items-center justify-center text-[#035352] shrink-0 border border-[#035352]/20">
            <UserCog className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#172525] tracking-tight">Manage Administrators</h1>
            <p className="text-xs text-slate-500 font-medium">
              Organisation Administrator Control Panel to manage administrator and sub-admin accounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAdmins}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Sub Admin
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Accounts</p>
            <p className="text-2xl font-black text-[#172525] mt-1">{totalAdmins}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <UserCog className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Super Admin</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{superAdminCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sub Admins</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{subAdmins}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inactive Accounts</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{inactiveCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="max-w-md w-full">
            <Input
              placeholder="Search administrators by email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <span className="text-xs font-bold text-slate-500">
            Showing {filteredAdmins.length} of {admins.length} accounts
          </span>
        </div>

        {/* Admins Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#035352] animate-spin" />
            <p className="text-sm font-semibold">Loading administrators...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <UserCog className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">No Administrators Found</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add Admin" to create an administrator or sub-admin account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Admin Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAdmins.map((admin) => {
                  const isCurrent = currentUser?.id === admin.id || currentUser?.email?.toLowerCase() === admin.email.toLowerCase();
                  const isAdminRole = admin.role === 'admin' || admin.role === 'super_admin';
                  const adminCount = admins.filter((a) => a.role === 'admin' || a.role === 'super_admin').length;
                  const isLastAdmin = isAdminRole && adminCount <= 1;

                  return (
                    <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Email */}
                      <td className="py-4 px-4 font-bold text-[#172525]">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isAdminRole ? 'bg-[#035352] text-[#F3E8BC]' : 'bg-blue-600 text-white'
                          }`}>
                            {admin.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#172525] text-sm flex items-center gap-2">
                              {admin.email}
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">User ID: #{admin.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        {admin.role === 'super_admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-[#F3E8BC]/40 text-[#035352] border border-[#035352]/30">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#035352]" />
                            Super Admin
                          </span>
                        ) : admin.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-[#035352]/10 text-[#035352] border border-[#035352]/20">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#035352]" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                            <Shield className="w-3.5 h-3.5 text-blue-600" />
                            Sub Admin
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {admin.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Active Status */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(admin)}
                            disabled={isCurrent || (isLastAdmin && admin.is_active)}
                            title={
                              isCurrent
                                ? 'Cannot deactivate yourself'
                                : isLastAdmin && admin.is_active
                                ? 'Cannot deactivate the last administrator'
                                : admin.is_active
                                ? 'Deactivate Account'
                                : 'Activate Account'
                            }
                            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                              isCurrent || (isLastAdmin && admin.is_active)
                                ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                                : admin.is_active
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 cursor-pointer'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                            }`}
                          >
                            {admin.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(admin)}
                            title="Edit Role & Status"
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                          </button>
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

      {/* ============================================================ */}
      {/* 1. Add Sub-Administrator Modal */}
      {/* ============================================================ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !submitting && setIsAddModalOpen(false)}
        title="Add Sub Administrator"
        description="Create a new sub-admin login for your organisation portal."
      >
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="e.g. subadmin@organisation.com"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                required
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Assigned Role
            </label>
            <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Sub Admin
              </span>
              <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
                Fixed Role
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Super Admin is unique to this organisation. New accounts are created as Sub Admins.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
            >
              Create Sub Admin
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* 2. Edit Administrator Modal */}
      {/* ============================================================ */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !submitting && setIsEditModalOpen(false)}
        title="Edit Administrator"
        description="Update account active status for this administrator."
      >
        <form onSubmit={handleUpdateAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              value={selectedAdmin?.email || ''}
              disabled
              className="bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Role
            </label>
            <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2">
              {selectedAdmin?.role === 'super_admin' ? (
                <span className="inline-flex items-center gap-1.5 text-[#035352]">
                  <ShieldCheck className="w-4 h-4 text-[#035352]" />
                  Super Admin (Primary Owner)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-blue-700">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Sub Admin
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Account Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={editIsActive ? 'active' : 'inactive'}
              onChange={(e) => setEditIsActive(e.target.value === 'active')}
              disabled={submitting}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#035352]/20 focus:border-[#035352] transition-all"
            >
              <option value="active">Active (Can log in)</option>
              <option value="inactive">Inactive / Deactivated (Access blocked)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
