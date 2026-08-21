import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, X, User, Building2, Calendar, Clock, FileText, UserCheck, UserX, ClipboardList } from 'lucide-react';
import { visitApi } from '@/api/services';
import type { VisitorVisit } from '@/types';
import { useAuth } from '../context/AuthContext';

export default function Visits() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<VisitorVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedVisit, setSelectedVisit] = useState<VisitorVisit | null>(null);
  const [showModal, setShowModal] = useState(false);
  const limit = 10;

  const organisationId = user?.organisation_id || 1;

  useEffect(() => {
    fetchVisits();
  }, [page]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await visitApi.getAll(organisationId, { page, limit });
      if (res.data.success) {
        setVisits(res.data.data);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const openModal = (visit: VisitorVisit) => {
    setSelectedVisit(visit);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
    setTimeout(() => setSelectedVisit(null), 300);
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 text-[#035352]">
          <div className="w-8 h-8 border-3 border-[#035352] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold">Loading Visit Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#172525]">Visit Log History</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Audit log of all gate clearances and visitor check-ins</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Visitor</th>
                <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Host Staff</th>
                <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Purpose</th>
                <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Check-In Time</th>
                <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium text-xs">
                    No visit records found
                  </td>
                </tr>
              ) : (
                visits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#172525]">
                      {visit.visitor?.full_name || 'Unknown'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#035352]">
                      {visit.host?.full_name || 'Unknown'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium max-w-xs truncate">
                      {visit.purpose_of_visit}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">
                      {new Date(visit.check_in_time).toLocaleDateString()} {new Date(visit.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full font-extrabold border ${
                        visit.host_available_at_submission
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {visit.host_available_at_submission ? 'Completed' : 'Host Unavailable'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => openModal(visit)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-[#035352] hover:bg-[#035352]/10 transition-all"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <div className="text-xs font-medium text-slate-500">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-xs font-bold text-[#035352]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedVisit && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#035352]/10 text-[#035352] flex items-center justify-center font-bold">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-[#172525]">Visit Details Pass</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Selfie */}
              <div className="flex justify-center">
                {selectedVisit.selfie_url ? (
                  <img 
                    src={selectedVisit.selfie_url} 
                    alt="Selfie" 
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-[#035352] shadow-md shadow-[#035352]/20"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-slate-100 border-4 border-[#035352] flex items-center justify-center text-slate-400">
                    <User className="h-10 w-10" />
                  </div>
                )}
              </div>

              {/* Visitor & Host Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#035352] mb-1.5 uppercase tracking-wider">
                    <User className="h-4 w-4" />
                    Visitor Info
                  </div>
                  <p className="font-bold text-sm text-[#172525]">{selectedVisit.visitor?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{selectedVisit.visitor?.company || 'No company'}</p>
                  <p className="text-xs text-slate-500 font-medium">{selectedVisit.visitor?.designation || 'No designation'}</p>
                  <p className="text-xs text-[#035352] font-mono font-bold mt-1">{selectedVisit.visitor?.mobile_number || 'No mobile'}</p>
                </div>

                <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#035352] mb-1.5 uppercase tracking-wider">
                    <Building2 className="h-4 w-4" />
                    Host Info
                  </div>
                  <p className="font-bold text-sm text-[#172525]">{selectedVisit.host?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{selectedVisit.host?.designation || 'No designation'}</p>
                  <p className="text-xs text-slate-500 font-medium">{selectedVisit.host?.email || 'No email'}</p>
                </div>
              </div>

              {/* Purpose & Reference */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    <FileText className="h-4 w-4 text-[#035352]" />
                    Purpose of Visit
                  </div>
                  <p className="text-xs font-bold text-[#172525]">{selectedVisit.purpose_of_visit}</p>
                </div>

                <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    <FileText className="h-4 w-4 text-[#035352]" />
                    Reference
                  </div>
                  <p className="text-xs font-bold text-[#172525]">{selectedVisit.reference || 'N/A'}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    <Calendar className="h-4 w-4 text-[#035352]" />
                    Check-In Date
                  </div>
                  <p className="text-xs font-bold text-[#172525]">
                    {new Date(selectedVisit.check_in_time).toLocaleDateString()}
                  </p>
                </div>

                <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    <Clock className="h-4 w-4 text-[#035352]" />
                    Check-In Time
                  </div>
                  <p className="text-xs font-bold text-[#172525]">
                    {new Date(selectedVisit.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  {selectedVisit.host_available_at_submission ? (
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <UserX className="h-4 w-4 text-rose-600" />
                  )}
                  Gate Clearance Status
                </div>
                <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-extrabold border ${
                  selectedVisit.host_available_at_submission
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {selectedVisit.host_available_at_submission ? 'Completed / Host Notified' : 'Host Unavailable'}
                </span>
                {selectedVisit.confirmation_message && (
                  <p className="text-xs font-medium text-slate-600 mt-2 bg-white p-3 rounded-xl border border-slate-200">{selectedVisit.confirmation_message}</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-slate-100">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#035352] text-white hover:bg-[#023e3d] shadow-md shadow-[#035352]/20 transition-all"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}