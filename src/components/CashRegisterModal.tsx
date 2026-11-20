import React, { useState } from 'react';
import {
  Coins,
  Banknote,
  X,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldAlert,
  ArrowDownCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { CashRegisterSession, CashDenominationCount, StaffUser, MidDayCashDrop } from '../types';

interface CashRegisterModalProps {
  cashRegister: CashRegisterSession;
  currentUser: StaffUser;
  onClose: () => void;
  onRecordDrop: (amount: number, witnessName: string) => void;
  onBlindCloseout: (counts: CashDenominationCount, notes?: string) => { countedTotal: number; discrepancy: number; status: 'balanced' | 'overage' | 'shortage' };
}

export const CashRegisterModal: React.FC<CashRegisterModalProps> = ({
  cashRegister,
  currentUser,
  onClose,
  onRecordDrop,
  onBlindCloseout,
}) => {
  const [activeTab, setActiveTab] = useState<'blind_close' | 'vault_drop' | 'history'>('blind_close');

  // Vault Drop State
  const [dropAmount, setDropAmount] = useState<number>(100000);
  const [witnessName, setWitnessName] = useState<string>('Chioma Okonkwo (Regional Dir)');
  const [dropSuccess, setDropSuccess] = useState<boolean>(false);

  // Blind Closeout State
  const [denominations, setDenominations] = useState<CashDenominationCount>({
    n1000: 440,
    n500: 90,
    n200: 25,
    n100: 10,
    n50: 0,
  });
  const [closeNotes, setCloseNotes] = useState<string>('Standard evening shift handover.');
  const [reconciliationResult, setReconciliationResult] = useState<{
    countedTotal: number;
    discrepancy: number;
    status: 'balanced' | 'overage' | 'shortage';
  } | null>(null);

  const handleDenominationChange = (key: keyof CashDenominationCount, val: number) => {
    setDenominations((prev) => ({
      ...prev,
      [key]: Math.max(0, val),
    }));
  };

  const currentCountedTotal =
    (denominations.n1000 || 0) * 1000 +
    (denominations.n500 || 0) * 500 +
    (denominations.n200 || 0) * 200 +
    (denominations.n100 || 0) * 100 +
    (denominations.n50 || 0) * 50;

  const handleDropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dropAmount <= 0) return;
    onRecordDrop(dropAmount, witnessName);
    setDropSuccess(true);
    setTimeout(() => setDropSuccess(false), 3000);
  };

  const handleCloseoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onBlindCloseout(denominations, closeNotes);
    setReconciliationResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Cash Register Security & Till Management
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cashRegister.status === 'open'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {cashRegister.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Shift: {cashRegister.cashierName} · Opened {new Date(cashRegister.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex gap-2 text-xs">
          <button
            onClick={() => setActiveTab('blind_close')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'blind_close'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Blind End-of-Day Closeout (Z-Report)</span>
          </button>

          <button
            onClick={() => setActiveTab('vault_drop')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'vault_drop'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Mid-Day Safe Vault Drop</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Vault Drops History</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'blind_close' && !reconciliationResult && (
            <form onSubmit={handleCloseoutSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Anti-Theft Blind Closeout Protocol: </span>
                  System expected cash is hidden from the screen. Count physical currency notes in the drawer and input exact piece counts. The system will verify and produce the official Z-Report.
                </div>
              </div>

              {/* Denomination Input Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500">
                    <tr>
                      <th className="py-2.5 px-4">Denomination</th>
                      <th className="py-2.5 px-3 text-center">Piece Count</th>
                      <th className="py-2.5 px-4 text-right">Subtotal (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-600" /> ₦1,000 Note
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={denominations.n1000}
                          onChange={(e) => handleDenominationChange('n1000', Number(e.target.value))}
                          className="w-20 text-center font-mono text-xs border rounded p-1 font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₦{(denominations.n1000 * 1000).toLocaleString()}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-600" /> ₦500 Note
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={denominations.n500}
                          onChange={(e) => handleDenominationChange('n500', Number(e.target.value))}
                          className="w-20 text-center font-mono text-xs border rounded p-1 font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₦{(denominations.n500 * 500).toLocaleString()}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-600" /> ₦200 Note
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={denominations.n200}
                          onChange={(e) => handleDenominationChange('n200', Number(e.target.value))}
                          className="w-20 text-center font-mono text-xs border rounded p-1 font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₦{(denominations.n200 * 200).toLocaleString()}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-600" /> ₦100 Note
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={denominations.n100}
                          onChange={(e) => handleDenominationChange('n100', Number(e.target.value))}
                          className="w-20 text-center font-mono text-xs border rounded p-1 font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₦{(denominations.n100 * 100).toLocaleString()}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-600" /> ₦50 Note
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={denominations.n50}
                          onChange={(e) => handleDenominationChange('n50', Number(e.target.value))}
                          className="w-20 text-center font-mono text-xs border rounded p-1 font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₦{(denominations.n50 * 50).toLocaleString()}
                      </td>
                    </tr>

                    <tr className="bg-slate-900 text-white font-bold text-sm">
                      <td colSpan={2} className="py-3 px-4 text-right uppercase text-xs text-slate-300">
                        Physical Drawer Count Total:
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-400 font-black">
                        ₦{currentCountedTotal.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Cashier Closeout Notes
                </label>
                <input
                  type="text"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="e.g. Completed evening handover with zero pending customer change."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-md flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Submit Blind Count & Generate Z-Report</span>
                </button>
              </div>
            </form>
          )}

          {/* Reconciliation Result Z-Report */}
          {activeTab === 'blind_close' && reconciliationResult && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  reconciliationResult.status === 'balanced'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : reconciliationResult.status === 'overage'
                    ? 'bg-blue-50 border-blue-300 text-blue-950'
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}
              >
                {reconciliationResult.status === 'balanced' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-black text-sm uppercase">
                    Register Handover: {reconciliationResult.status.toUpperCase()}
                  </h4>
                  <p className="text-xs">
                    {reconciliationResult.status === 'balanced'
                      ? 'The cash drawer balanced with zero variance against recorded sales.'
                      : reconciliationResult.status === 'overage'
                      ? `Surplus cash detected: +₦${Math.abs(reconciliationResult.discrepancy).toLocaleString()}. Logged in audit trail.`
                      : `Cash shortage detected: -₦${Math.abs(reconciliationResult.discrepancy).toLocaleString()}. Escalated to Store Manager.`}
                  </p>
                </div>
              </div>

              {/* Z-Report Paper Layout */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 font-mono text-xs space-y-2 text-slate-800">
                <div className="text-center pb-2 border-b border-dashed border-slate-400">
                  <div className="font-bold text-sm">ELITE ENERGY TECHNOLOGY LTD</div>
                  <div className="text-[10px] text-slate-500">OFFICIAL END-OF-DAY REGISTER Z-REPORT</div>
                  <div className="text-[10px] text-slate-500">{new Date().toLocaleString()}</div>
                </div>

                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Cashier Terminal:</span>
                    <span className="font-bold">{cashRegister.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opening Cash Float:</span>
                    <span>₦{cashRegister.openingCash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Cash Sales Recorded:</span>
                    <span>₦{cashRegister.cashSalesRecorded.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mid-Day Vault Drops / Payouts:</span>
                    <span>-₦{cashRegister.cashPaidOut.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-300 pt-1">
                    <span>System Expected Cash:</span>
                    <span>₦{cashRegister.expectedClosingCash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Physical Cash Counted:</span>
                    <span>₦{reconciliationResult.countedTotal.toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between font-black text-xs pt-1 border-t border-dashed border-slate-400 ${
                    reconciliationResult.discrepancy === 0 ? 'text-emerald-700' : reconciliationResult.discrepancy > 0 ? 'text-blue-700' : 'text-red-700'
                  }`}>
                    <span>VARIANCE / DISCREPANCY:</span>
                    <span>{reconciliationResult.discrepancy >= 0 ? '+' : ''}₦{reconciliationResult.discrepancy.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-dashed border-slate-400 flex justify-between text-[10px] text-slate-500">
                  <span>Sign: ___________________</span>
                  <span>Supervisor: ___________________</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Z-Report
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Mid-Day Safe Vault Drop Form */}
          {activeTab === 'vault_drop' && (
            <form onSubmit={handleDropSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
                <ArrowDownCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Branch Vault Drop Protocol: </span>
                  Transfer excess accumulated cash from counter till to branch reinforced safe. Reduces counter exposure and armed robbery risk. Requires verified witness signature.
                </div>
              </div>

              {dropSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Vault Drop of ₦{dropAmount.toLocaleString()} recorded and logged!
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Cash Amount to Transfer into Vault (₦)
                </label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={dropAmount}
                  onChange={(e) => setDropAmount(Number(e.target.value))}
                  className="w-full text-sm font-mono font-bold rounded-lg border border-slate-300 p-2.5"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Branch Supervisor / Witness Name
                </label>
                <input
                  type="text"
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-md flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Execute Safe Vault Drop</span>
                </button>
              </div>
            </form>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700">
                Shift Vault Drops & Petty Cash Handlers
              </h4>

              {cashRegister.midDayDrops && cashRegister.midDayDrops.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">Receipt Ref</th>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Witness</th>
                        <th className="py-2.5 px-3 text-right">Amount (₦)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cashRegister.midDayDrops.map((drop) => (
                        <tr key={drop.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{drop.vaultReceiptNumber}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{drop.time}</td>
                          <td className="py-2.5 px-3 text-slate-700">{drop.witnessName}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                            ₦{drop.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                  No mid-day safe drops recorded for this session yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
