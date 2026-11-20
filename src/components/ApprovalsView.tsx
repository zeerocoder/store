import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Building2,
  FileText,
  Percent,
} from 'lucide-react';
import { ApprovalRequest, StaffUser } from '../types';

interface ApprovalsViewProps {
  approvals: ApprovalRequest[];
  currentUser: StaffUser;
  onResolveApproval: (approvalId: string, decision: 'approved' | 'rejected', reason?: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  currentUser,
  onResolveApproval,
}) => {
  const [filterStatus, setFilterStatus] = useState<'pending' | 'resolved' | 'all'>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const canAuthorize = ['owner', 'general_manager', 'branch_manager'].includes(currentUser.role);

  const filtered = approvals.filter((a) => {
    if (filterStatus === 'pending') return a.status === 'pending';
    if (filterStatus === 'resolved') return a.status !== 'pending';
    return true;
  });

  const handleConfirmReject = () => {
    if (!rejectingId) return;
    onResolveApproval(rejectingId, 'rejected', rejectReason || 'Declined by Management');
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Senior Management Governance</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Sensitive Operations & Threshold Authorization Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enforces strict internal controls on large cashier discounts, stock write-offs, price changes, and unbudgeted expenses.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-md transition ${
              filterStatus === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Tickets ({approvals.filter((a) => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1.5 rounded-md transition ${
              filterStatus === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved History
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-md transition ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tickets
          </button>
        </div>
      </div>

      {!canAuthorize && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            You are logged in as <strong>{currentUser.name} ({currentUser.role})</strong>. Approvals require Owner, General Manager, or Branch Manager credentials. Switch operator in the top header to authorize.
          </span>
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            No approval requests matching this filter.
          </div>
        ) : (
          filtered.map((appr) => {
            const isPending = appr.status === 'pending';

            return (
              <div
                key={appr.id}
                className={`p-5 rounded-xl border transition shadow-xs bg-white ${
                  isPending ? 'border-amber-200' : 'border-slate-200 opacity-90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                        {appr.id}
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                        {appr.actionType.replace('_', ' ')}
                      </span>
                      <span
                        className={`capitalize px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          appr.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : appr.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-red-50 text-red-700 border-red-300'
                        }`}
                      >
                        {appr.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{appr.description}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Requested by: <strong className="text-slate-800">{appr.requestedByName}</strong></span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{appr.branchName}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(appr.createdAt).toLocaleString()}</span>
                      </span>
                    </div>

                    {appr.rejectionReason && (
                      <div className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                        Rejection Reason: {appr.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Right side: Amount/Value & Actions */}
                  <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Impact Value</span>
                      <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                        {appr.actionType === 'discount' ? `${appr.value}%` : `₦${appr.value.toLocaleString()}`}
                      </div>
                    </div>

                    {isPending && canAuthorize && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRejectingId(appr.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onResolveApproval(appr.id, 'approved')}
                          className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                        >
                          Authorize
                        </button>
                      </div>
                    )}

                    {!isPending && (
                      <div className="text-[11px] text-slate-500 font-medium">
                        Resolved by {appr.resolvedByName || 'Management'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Reason Dialog */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-slate-300 p-5 space-y-4 text-slate-900">
            <h3 className="text-sm font-bold">State Reason for Rejection</h3>
            <textarea
              placeholder="e.g. Discount exceeds gross margin threshold; alternative wholesale tier offered."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
              rows={3}
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setRejectingId(null)} className="px-3 py-1.5 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
