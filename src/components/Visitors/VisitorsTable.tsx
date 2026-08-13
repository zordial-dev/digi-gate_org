import { Visitor } from '@/types';

interface VisitorsTableProps {
  visitors: Visitor[];
  loading?: boolean;
}

export default function VisitorsTable({ visitors, loading }: VisitorsTableProps) {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (visitors.length === 0) {
    return <div className="text-center py-8 text-gray-500">No visitors found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Designation</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Mobile</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Visits</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((visitor) => (
            <tr key={visitor.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{visitor.full_name}</td>
              <td className="px-4 py-3 text-gray-600">{visitor.company}</td>
              <td className="px-4 py-3 text-gray-600">{visitor.designation}</td>
              <td className="px-4 py-3 text-gray-600">{visitor.mobile_number}</td>
              <td className="px-4 py-3 text-gray-600">-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}