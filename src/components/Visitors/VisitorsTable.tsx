import { Visitor } from '@/types';
import { User, Building2, Phone, Briefcase } from 'lucide-react';

interface VisitorsTableProps {
  visitors: Visitor[];
  loading?: boolean;
}

export default function VisitorsTable({ visitors, loading }: VisitorsTableProps) {
  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 text-[#035352]">
          <div className="w-8 h-8 border-3 border-[#035352] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold">Loading Visitors Directory...</p>
        </div>
      </div>
    );
  }

  if (visitors.length === 0) {
    return (
      <div className="text-center py-12 px-4 text-slate-400 font-medium text-xs">
        No registered visitors found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/80">
            <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">
              Visitor Name
            </th>
            <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">
              Company
            </th>
            <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">
              Designation
            </th>
            <th className="px-5 py-3.5 font-bold text-[#035352] uppercase tracking-wider text-[11px]">
              Mobile Contact
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {visitors.map((visitor) => (
            <tr key={visitor.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-5 py-3.5 font-bold text-[#172525]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#035352]/10 border border-[#035352]/20 flex items-center justify-center text-[#035352] font-bold text-xs shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#172525]">{visitor.full_name}</p>
                    {visitor.email && <p className="text-[11px] font-medium text-slate-400">{visitor.email}</p>}
                  </div>
                </div>
              </td>

              <td className="px-5 py-3.5 text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{visitor.company || '-'}</span>
                </div>
              </td>

              <td className="px-5 py-3.5 text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{visitor.designation || '-'}</span>
                </div>
              </td>

              <td className="px-5 py-3.5 text-slate-600 font-mono font-medium">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#035352] shrink-0" />
                  <span>{visitor.mobile_number}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}