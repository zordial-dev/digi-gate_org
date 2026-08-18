import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import VisitorsTable from '@/components/Visitors/VisitorsTable';
import { visitorApi } from '@/api/services';
import type { Visitor } from '@/types';

import { useAuth } from '../context/AuthContext';

export default function Visitors() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const organisationId = user?.organisation_id || 1;

  useEffect(() => {
    fetchVisitors();
  }, [page, search]);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await visitorApi.getAll(organisationId, { 
        page, 
        limit, 
        search: search || undefined 
      });
      if (res.data.success) {
        setVisitors(res.data.data);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#06216B' }}>Visitors</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search visitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-xl outline-none transition-all pr-10"
            style={{
              borderColor: '#021767',
              color: '#3F5885',
              fontWeight: 500,
              fontSize: '0.95rem',
              backgroundColor: '#ffffff',
              minWidth: '250px'
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
          <Search className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
        </div>
      </div>

      <div 
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #021767',
          boxShadow: '0 4px 16px rgba(2, 29, 91, 0.08)'
        }}
      >
        <VisitorsTable visitors={visitors} loading={loading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div 
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid #021767', backgroundColor: '#f8fafc' }}
          >
            <div className="text-sm" style={{ color: '#64748b' }}>
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="p-2 border rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: '#021767',
                  color: '#3F5885',
                  backgroundColor: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  if (page !== 1) {
                    e.currentTarget.style.backgroundColor = 'rgba(6, 33, 107, 0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-sm font-semibold" style={{ color: '#3F5885' }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 border rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: '#021767',
                  color: '#3F5885',
                  backgroundColor: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  if (page !== totalPages) {
                    e.currentTarget.style.backgroundColor = 'rgba(6, 33, 107, 0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}