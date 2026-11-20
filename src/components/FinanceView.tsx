import React, { useState } from 'react';
import {
  Coins,
  DollarSign,
  TrendingUp,
  Receipt,
  Plus,
  CreditCard,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  FileSpreadsheet,
  Lock,
  Truck,
  ShieldAlert,
} from 'lucide-react';
import { ExpenseRecord, CashRegisterSession, Sale, StaffUser, Location, Product, Supplier, GoodsReceivedNote, CashDenominationCount } from '../types';
import { calculateFinancialMetrics } from '../utils/businessLogic';
import { CashRegisterModal } from './CashRegisterModal';
import { GoodsReceivedNoteModal } from './GoodsReceivedNoteModal';

interface FinanceViewProps {
  sales: Sale[];
  expenses: ExpenseRecord[];
  cashRegister: CashRegisterSession;
  currentUser: StaffUser;
  locations: Location[];
  activeLocationId: string;
  products?: Product[];
  suppliers?: Supplier[];
  goodsReceivedNotes?: GoodsReceivedNote[];
  onRecordExpense: (data: { category: ExpenseRecord['category']; description: string; amount: number; referenceReceipt?: string }) => void;
  onRecordDrop?: (amount: number, witnessName: string) => void;
  onBlindCloseout?: (counts: CashDenominationCount, notes?: string) => { countedTotal: number; discrepancy: number; status: 'balanced' | 'overage' | 'shortage' };
  onSubmitGrn?: (grnData: Omit<GoodsReceivedNote, 'id' | 'grnNumber'>) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  sales,
  expenses,
  cashRegister,
  currentUser,
  locations,
  activeLocationId,
  products = [],
  suppliers = [],
  goodsReceivedNotes = [],
  onRecordExpense,
  onRecordDrop,
  onBlindCloseout,
  onSubmitGrn,
}) => {
  const [activeFinanceTab, setActiveFinanceTab] = useState<'pnl' | 'cash_drawer' | 'expenses' | 'gateways' | 'grn_landed_cost'>('pnl');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCashRegisterModal, setShowCashRegisterModal] = useState(false);
  const [showGrnModal, setShowGrnModal] = useState(false);

  // New Expense state
  const [expenseCat, setExpenseCat] = useState<ExpenseRecord['category']>('diesel_generator');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(50000);
  const [expenseReceipt, setExpenseReceipt] = useState('');

  // Cash drawer close state
  const [actualCashTendered, setActualCashTendered] = useState<number>(cashRegister.expectedClosingCash);
  const [registerClosed, setRegisterClosed] = useState(false);

  const filteredSales = activeLocationId === 'all' ? sales : sales.filter((s) => s.branchId === activeLocationId);
  const filteredExpenses = activeLocationId === 'all' ? expenses : expenses.filter((e) => e.branchId === activeLocationId);

  const metrics = calculateFinancialMetrics({
    sales: filteredSales.map((s) => ({
      totalAmount: s.totalAmount,
      costAmount: s.costTotal,
      status: 'completed',
    })),
    expenses: filteredExpenses.map((e) => ({
      amount: e.amount,
      status: e.status,
    })),
    inventory: [],
  });

  const handleCreateExpense = () => {
    if (!expenseDesc || expenseAmount <= 0) {
      alert('Please enter a description and valid expense amount.');
      return;
    }
    onRecordExpense({
      category: expenseCat,
      description: expenseDesc,
      amount: expenseAmount,
      referenceReceipt: expenseReceipt,
    });
    setShowExpenseModal(false);
    setExpenseDesc('');
    setExpenseAmount(50000);
  };

  const handleCloseRegister = () => {
    setRegisterClosed(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Coins className="w-3.5 h-3.5 text-sky-600" />
            <span>Financial Operations & Accountability</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Profit & Loss, Cash Drawer & Merchant Gateway Settlement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict accounting discipline: Revenue is not profit. Gross profit reflects COGS deduction; net profit reflects operational overhead.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCashRegisterModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition border border-amber-300 shadow-xs"
          >
            <Lock className="w-4 h-4 text-amber-800" />
            <span>Till Float & Blind Closeout</span>
          </button>

          <button
            onClick={() => setShowGrnModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-xs"
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Receive Factory GRN</span>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Finance Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveFinanceTab('pnl')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeFinanceTab === 'pnl' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Profit & Loss Statement
        </button>
        <button
          onClick={() => setActiveFinanceTab('cash_drawer')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeFinanceTab === 'cash_drawer' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daily Cash Register Drawer
        </button>
        <button
          onClick={() => setActiveFinanceTab('grn_landed_cost')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeFinanceTab === 'grn_landed_cost' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
          <span>Landed Cost Procurement ({goodsReceivedNotes.length})</span>
        </button>
        <button
          onClick={() => setActiveFinanceTab('expenses')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeFinanceTab === 'expenses' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Operating Expenses Ledger
        </button>
        <button
          onClick={() => setActiveFinanceTab('gateways')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeFinanceTab === 'gateways' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Paystack & Flutterwave Settlements
        </button>
      </div>

      {/* Tab 1: P&L Statement */}
      {activeFinanceTab === 'pnl' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-4 text-center">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">Elite Energy Technology</h2>
            <div className="text-xs text-slate-500">Statement of Profit or Loss and Comprehensive Income</div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">Period: Month-to-Date (November 2026) · Nigerian Naira (₦)</div>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Revenue Section */}
            <div>
              <div className="flex justify-between font-bold text-slate-900 border-b border-slate-300 pb-1 text-sm">
                <span>GROSS COMMERCIAL REVENUE</span>
                <span className="tabular-nums">₦{metrics.grossSales.toLocaleString()}</span>
              </div>
              <div className="py-1 text-slate-500 flex justify-between pl-4">
                <span>Point of Sale Storefronts & Contractor Project Deliveries</span>
                <span className="tabular-nums">₦{metrics.grossSales.toLocaleString()}</span>
              </div>
            </div>

            {/* COGS Section */}
            <div>
              <div className="flex justify-between font-bold text-slate-900 border-b border-slate-300 pb-1 text-sm">
                <span>COST OF GOODS SOLD (COGS)</span>
                <span className="tabular-nums text-red-600">-₦{metrics.costOfGoodsSold.toLocaleString()}</span>
              </div>
              <div className="py-1 text-slate-500 flex justify-between pl-4">
                <span>Direct Material Procurement (Cement, Rebars, Blocks, Aggregate)</span>
                <span className="tabular-nums">-₦{metrics.costOfGoodsSold.toLocaleString()}</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-3 bg-slate-50 rounded-lg flex justify-between font-bold text-sm text-emerald-800 border border-slate-200">
              <span>GROSS PROFIT</span>
              <div className="text-right">
                <span className="tabular-nums">₦{metrics.grossProfit.toLocaleString()}</span>
                <div className="text-[10px] text-slate-500 font-normal">Gross Margin: {metrics.grossMarginPercent}%</div>
              </div>
            </div>

            {/* Operating Expenses */}
            <div>
              <div className="flex justify-between font-bold text-slate-900 border-b border-slate-300 pb-1 text-sm">
                <span>OPERATING EXPENSES</span>
                <span className="tabular-nums text-red-600">-₦{metrics.operatingExpenses.toLocaleString()}</span>
              </div>
              <div className="space-y-1 pt-1 pl-4 text-slate-600">
                {filteredExpenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between">
                    <span className="capitalize">{exp.category.replace('_', ' ')} · {exp.description}</span>
                    <span className="tabular-nums">-₦{exp.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Operating Profit */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center text-base font-bold">
              <div>
                <span>NET OPERATING PROFIT</span>
                <div className="text-xs text-sky-400 font-normal">Net Profit Margin: {metrics.netMarginPercent}%</div>
              </div>
              <span className="text-xl text-sky-400 tabular-nums">₦{metrics.netOperatingProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Cash Register Drawer */}
      {activeFinanceTab === 'cash_drawer' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cashier Drawer Shift Reconciliation</h3>
              <p className="text-xs text-slate-500">
                Branch: Victoria Island Hub · Cashier: {cashRegister.cashierName}
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              registerClosed ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
            }`}>
              {registerClosed ? 'Session Closed & Balanced' : 'Drawer Open'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg flex justify-between font-semibold">
              <span className="text-slate-600">Opening Float Cash:</span>
              <span className="font-mono tabular-nums">₦{cashRegister.openingCash.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex justify-between font-semibold">
              <span className="text-slate-600">Cash Sales Recorded in Shift:</span>
              <span className="font-mono text-emerald-700 tabular-nums">+₦{cashRegister.cashSalesRecorded.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex justify-between font-semibold">
              <span className="text-slate-600">Cash Paid Out (Petty Cash/Offloading):</span>
              <span className="font-mono text-red-600 tabular-nums">-₦{cashRegister.cashPaidOut.toLocaleString()}</span>
            </div>
            <div className="p-4 bg-sky-50 rounded-xl flex justify-between font-bold text-sm text-sky-900 border border-sky-200">
              <span>Expected Closing Cash in Till:</span>
              <span className="font-mono tabular-nums">₦{cashRegister.expectedClosingCash.toLocaleString()}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <label className="font-bold text-slate-700 uppercase text-[10px]">Actual Physical Cash Counted at Shift End</label>
              <input
                type="number"
                value={actualCashTendered}
                onChange={(e) => setActualCashTendered(parseInt(e.target.value, 10) || 0)}
                disabled={registerClosed}
                className="w-full p-2 text-sm font-mono font-bold rounded-lg border border-slate-300 bg-white"
              />

              {actualCashTendered - cashRegister.expectedClosingCash !== 0 && (
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-800 text-xs border border-amber-300 flex items-center justify-between font-mono">
                  <span>Till Discrepancy:</span>
                  <span className="font-bold">
                    {actualCashTendered > cashRegister.expectedClosingCash ? '+' : ''}
                    ₦{(actualCashTendered - cashRegister.expectedClosingCash).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {!registerClosed && (
              <button
                onClick={handleCloseRegister}
                className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
              >
                Close Drawer & Submit End-of-Day Balancing
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Operating Expenses Ledger */}
      {activeFinanceTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Operational Expenses & Disbursements</h3>
            <span className="text-xs text-slate-500 font-mono">Total: ₦{metrics.operatingExpenses.toLocaleString()}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Date & Location</th>
                  <th className="py-3 px-3">Expense Category</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right font-mono">Disbursed Amount</th>
                  <th className="py-3 px-3">Recorded By</th>
                  <th className="py-3 px-4 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{new Date(exp.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">{exp.branchName}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="capitalize font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 text-[11px]">
                        {exp.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 max-w-xs truncate">{exp.description}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ₦{exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">{exp.recordedBy}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-300">
                        {exp.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Paystack & Flutterwave Gateway Settlements */}
      {activeFinanceTab === 'gateways' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Merchant Payment Gateway Reconciliation</h3>
            <p className="text-xs text-slate-500">
              Elite Energy Technology is the direct merchant recipient. Transactions are reconciled against gateway settlement records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-900 text-sm">Paystack Merchant Account</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">Connected</span>
              </div>
              <div className="text-slate-600">Merchant ID: EET-CORP-PAYSTACK-01</div>
              <div className="text-slate-600">Settlement Bank: Guaranty Trust Bank (0128994102)</div>
              <div className="text-slate-600">Settlement Schedule: Daily Automatic T+1 Settlement</div>
            </div>

            <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-900 text-sm">Flutterwave Merchant Account</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">Connected</span>
              </div>
              <div className="text-slate-600">Merchant ID: EET-FLW-RAVE-9912</div>
              <div className="text-slate-600">Settlement Bank: Zenith Bank Plc (1014492019)</div>
              <div className="text-slate-600">Settlement Schedule: Daily Automatic T+1 Settlement</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Landed Cost Procurement Ledger */}
      {activeFinanceTab === 'grn_landed_cost' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Inbound Goods Received Notes (GRN) & Landed Cost Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Ex-factory purchase cost + Inter-state haulage freight + Offloading union dues = Final Inventory Asset Valuation
              </p>
            </div>
            <button
              onClick={() => setShowGrnModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Receive Stock & Calculate Landed Cost</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">GRN Ref / Date</th>
                  <th className="py-3 px-3">Manufacturer / Supplier</th>
                  <th className="py-3 px-3">Depot Location</th>
                  <th className="py-3 px-3">Cargo Items</th>
                  <th className="py-3 px-3 text-right">Haulage Freight</th>
                  <th className="py-3 px-3 text-right">Union Levy</th>
                  <th className="py-3 px-4 text-right font-bold text-emerald-800">Total Landed Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {goodsReceivedNotes.map((grn) => (
                  <tr key={grn.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-sky-800 text-xs">{grn.grnNumber}</div>
                      <div className="text-[10px] text-slate-400">{grn.receivedDate}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{grn.supplierName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">PO: {grn.purchaseOrderRef}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-slate-800 font-medium">{grn.locationName}</div>
                      <div className="text-[10px] text-slate-400">By: {grn.inspectedBy}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-slate-900 font-medium text-[11px] space-y-1">
                        {grn.items.map((it) => (
                          <div key={it.productId}>
                            {it.receivedQty.toLocaleString()} {it.unit} {it.productName}
                            <span className="text-emerald-700 font-mono font-bold ml-1">
                              (₦{it.finalLandedUnitCost.toLocaleString()}/unit)
                            </span>
                            {it.damagedQty > 0 && (
                              <span className="text-red-600 font-bold ml-1">
                                [! {it.damagedQty} damaged]
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      ₦{grn.haulageCost.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      ₦{grn.offloadingUnionLevy.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                      ₦{grn.totalLandedCost.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cash Register & Blind Closeout Modal */}
      {showCashRegisterModal && (
        <CashRegisterModal
          cashRegister={cashRegister}
          currentUser={currentUser}
          onClose={() => setShowCashRegisterModal(false)}
          onRecordDrop={(amt, witness) => onRecordDrop && onRecordDrop(amt, witness)}
          onBlindCloseout={(counts, notes) =>
            onBlindCloseout ? onBlindCloseout(counts, notes) : { countedTotal: 0, discrepancy: 0, status: 'balanced' }
          }
        />
      )}

      {/* Goods Received Note (GRN) Landed Cost Modal */}
      {showGrnModal && (
        <GoodsReceivedNoteModal
          products={products}
          locations={locations}
          suppliers={suppliers}
          currentUser={currentUser}
          onClose={() => setShowGrnModal(false)}
          onSubmitGrn={(data) => onSubmitGrn && onSubmitGrn(data)}
        />
      )}

      {/* New Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Coins className="w-4 h-4 text-sky-400" />
                <span>Disburse Operational Expense</span>
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Expense Category</label>
                <select
                  value={expenseCat}
                  onChange={(e) => setExpenseCat(e.target.value as ExpenseRecord['category'])}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="diesel_generator">Diesel / Generator Fuel</option>
                  <option value="fleet_fuel">Fleet Truck Fuel</option>
                  <option value="truck_maintenance">Vehicle & Machinery Maintenance</option>
                  <option value="offloading_labor">Casual Offloading Labor</option>
                  <option value="utilities">Utilities & Electricity (EKEDC / PHED)</option>
                  <option value="wages">Staff Shift Wages</option>
                  <option value="office_supplies">Office / POS Consumables</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Litres diesel for yard generator"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Amount (₦)</label>
                <input
                  type="number"
                  min="1000"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Invoice / Receipt Ref</label>
                <input
                  type="text"
                  placeholder="e.g. TOTAL-DSL-9921"
                  value={expenseReceipt}
                  onChange={(e) => setExpenseReceipt(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              {expenseAmount > 30000 && currentUser.role === 'cashier' && (
                <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-[11px] border border-amber-200">
                  Notice: Expenses exceeding ₦30,000 recorded by a Cashier will enter the Senior Management Authorization Queue before disbursement.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button onClick={() => setShowExpenseModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleCreateExpense}
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition"
              >
                Disburse Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
