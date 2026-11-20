import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Lock,
  User,
  Building2,
  Clock,
  Download,
} from 'lucide-react';
import { AuditLogEntry, StaffUser } from '../types';

interface AuditTrailViewProps {
  auditLogs: AuditLogEntry[];
  currentUser: StaffUser;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  auditLogs,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const actionTypes = ['all', ...Array.from(new Set(auditLogs.map((l) => l.action)))];

  const filtered = auditLogs.filter((log) => {
    const matchAction = selectedAction === 'all' || log.action === selectedAction;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.locationName.toLowerCase().includes(q);
    return matchAction && matchSearch;
  });

  const exportAuditCsv = () => {
    const header = ['Timestamp', 'Operator', 'Role', 'Location', 'Action', 'Details', 'Previous Value', 'New Value'];
    const rows = filtered.map((l) => [
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      `"${l.locationName}"`,
      l.action,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${(l.previousValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EliteEnergy_AuditLog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-sky-600" />
            <span>Immutable Security Operations</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Cryptographic Audit Trail & Operator Activity Log
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Permanent, tamper-evident log of all sensitive financial, inventory movements, discount overrides, and authorizations.
          </p>
        </div>

        <button
          onClick={exportAuditCsv}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
        >
          <Download className="w-4 h-4 text-sky-600" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by operator, action, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
          {actionTypes.map((act) => (
            <button
              key={act}
              onClick={() => setSelectedAction(act)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-mono ${
                selectedAction === act
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {act === 'all' ? 'All Operations' : act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4 font-mono">Timestamp</th>
                <th className="py-3 px-3">Operator</th>
                <th className="py-3 px-3 font-mono">Operation Code</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-4">Audit Details & State Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-sky-700 font-mono capitalize">{log.userRole.replace('_', ' ')}</div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                    {log.locationName}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 leading-relaxed">{log.details}</div>
                    {(log.previousValue || log.newValue) && (
                      <div className="mt-1 text-[11px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded-md border border-slate-200/60 inline-block">
                        {log.previousValue && <span>Old: {log.previousValue} → </span>}
                        {log.newValue && <span className="font-semibold text-slate-800">New: {log.newValue}</span>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
