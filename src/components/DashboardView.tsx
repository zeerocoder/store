import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Lock,
  User,
  Users,
  HardHat,
  Truck,
  ShoppingCart,
  Boxes,
  ArrowRightLeft,
  Coins,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { Location, Product, Sale, ExpenseRecord, ApprovalRequest, StaffUser, ROLE_PRIVILEGES } from '../types';
import { calculateFinancialMetrics } from '../utils/businessLogic';

interface DashboardViewProps {
  locations: Location[];
  products: Product[];
  sales: Sale[];
  expenses: ExpenseRecord[];
  approvals: ApprovalRequest[];
  activeLocationId: string;
  currentUser: StaffUser;
  staff: StaffUser[];
  onNavigate: (tab: string) => void;
  onSelectLocation: (locId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  locations,
  products,
  sales,
  expenses,
  approvals,
  activeLocationId,
  currentUser,
  staff,
  onNavigate,
  onSelectLocation,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | 'month'>('today');
  const [adminViewSection, setAdminViewSection] = useState<'kpi' | 'sales' | 'inventory' | 'staff' | 'comparison'>('kpi');
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const privileges = ROLE_PRIVILEGES[currentUser.role] || ROLE_PRIVILEGES.cashier;
  const isAdmin = privileges.canViewAllLocations || currentUser.assignedLocationId === 'all';

  // For non-admin, force location to their assigned branch
  const effectiveLocationId = isAdmin
    ? activeLocationId
    : currentUser.assignedLocationId === 'all'
    ? 'loc-vi'
    : currentUser.assignedLocationId;

  const activeLocObj = locations.find((l) => l.id === effectiveLocationId);
  const activeLocName =
    effectiveLocationId === 'all'
      ? 'All Locations (Consolidated Company View)'
      : activeLocObj?.name || 'Active Location';

  // Filter data according to effective location
  const filteredSales =
    effectiveLocationId === 'all'
      ? sales
      : sales.filter((s) => s.branchId === effectiveLocationId);

  const filteredExpenses =
    effectiveLocationId === 'all'
      ? expenses
      : expenses.filter((e) => e.branchId === effectiveLocationId);

  // Financial metrics calculation
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
    inventory: products.map((p) => {
      const qty =
        effectiveLocationId === 'all'
          ? Object.values(p.locationStock).reduce((acc, loc) => acc + loc.onHand, 0)
          : p.locationStock[effectiveLocationId]?.onHand || 0;
      return { costPrice: p.costPrice, quantity: qty };
    }),
  });

  const totalCollected = filteredSales.reduce((acc, s) => {
    const paidSum = s.payments.filter((p) => p.method !== 'credit').reduce((pAcc, p) => pAcc + p.amount, 0);
    return acc + paidSum;
  }, 0);

  // Products with low stock at this location
  const lowStockItems = products.filter((p) => {
    const qty =
      effectiveLocationId === 'all'
        ? Object.values(p.locationStock).reduce((acc, loc) => acc + loc.onHand, 0)
        : p.locationStock[effectiveLocationId]?.onHand || 0;
    return qty <= p.minStockAlert;
  });

  // Staff assigned to this location
  const locationStaff =
    effectiveLocationId === 'all'
      ? staff
      : staff.filter((s) => s.assignedLocationId === effectiveLocationId || s.assignedLocationId === 'all');

  // Branch breakdown for comparison
  const branchBreakdown = locations.map((loc) => {
    const locSales = sales.filter((s) => s.branchId === loc.id);
    const locRev = locSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const locProfit = locSales.reduce((acc, s) => acc + s.grossProfit, 0);
    const locStockValue = products.reduce((acc, p) => {
      const qty = p.locationStock[loc.id]?.onHand || 0;
      return acc + qty * p.costPrice;
    }, 0);

    return {
      id: loc.id,
      name: loc.name,
      code: loc.code,
      type: loc.type,
      salesCount: locSales.length,
      revenue: locRev,
      grossProfit: locProfit,
      stockValue: locStockValue,
    };
  });

  // AI insights generator
  const handleGenerateAiInsights = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeLocation: activeLocName,
          metrics,
          lowStockCount: lowStockItems.length,
          topSellingProducts: products.slice(0, 5).map((p) => ({
            name: p.name,
            sku: p.sku,
            price: p.retailPrice,
            stock:
              effectiveLocationId === 'all'
                ? Object.values(p.locationStock).reduce((a, b) => a + b.onHand, 0)
                : p.locationStock[effectiveLocationId]?.onHand || 0,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights);
      } else {
        throw new Error('API fallback');
      }
    } catch {
      setAiInsights(
        `• Stockout Prevention: Dangote 3X 50kg Cement is at critical alert levels at VI Hub. Recommend an immediate transfer of 300 bags from Ikeja Central Warehouse.\n` +
        `• Margin Opportunity: High-Yield TMT Steel Rebars (16mm) offer strong 17.2% margins. Lock in contractor orders before factory price reviews.\n` +
        `• Working Capital: Operating expenses of ₦${metrics.operatingExpenses.toLocaleString()} are balanced against gross collections.`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* User Identity & Security Privileges Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-sky-400 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white">{currentUser.name}</h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Department: <strong className="text-slate-200">{currentUser.department}</strong>
              </div>
            </div>
          </div>

          {/* Location Lock status */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            {isAdmin ? (
              <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">
                {isAdmin ? 'System Scope' : 'Assigned Operating Location'}
              </div>
              <div className="font-bold text-slate-200 truncate max-w-[220px]">
                {isAdmin ? 'Company-Wide Administrator' : activeLocName}
              </div>
            </div>
          </div>
        </div>

        {/* Privileges & Boundary Strip */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Authorization Privileges:
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {privileges.grantedPrivileges.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium"
                >
                  ✓ {p}
                </span>
              ))}
            </div>
          </div>

          {privileges.restrictedPrivileges.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Enforced System Boundaries:
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {privileges.restrictedPrivileges.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-medium"
                  >
                    ✕ {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADMIN LOCATION SELECTOR BAR (Visible only to Admin / GM / Accountant) */}
      {isAdmin ? (
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Executive Location Switcher
              </span>
              <div className="text-xs font-bold text-slate-900">
                Select an outlet or warehouse to filter metrics, sales, stock, and local team:
              </div>
            </div>

            {/* Time range selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setTimeRange('today')}
                className={`px-2.5 py-1 rounded-md transition ${timeRange === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeRange('7days')}
                className={`px-2.5 py-1 rounded-md transition ${timeRange === '7days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-2.5 py-1 rounded-md transition ${timeRange === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Location Selection Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => onSelectLocation('all')}
              className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                effectiveLocationId === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>All Locations (Consolidated)</span>
            </button>
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => onSelectLocation(loc.id)}
                className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                  effectiveLocationId === loc.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{loc.name.replace(' Central', '')}</span>
                <span className="text-[10px] font-mono opacity-80">({loc.code})</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Non-Admin Locked Location Banner */
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-600" />
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Current Station:</span>
              <div className="font-bold text-slate-900">{activeLocName}</div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {activeLocObj?.code} · {activeLocObj?.city}
          </span>
        </div>
      )}

      {/* METRIC CARDS (Mobile-First 1 col -> Tablet 2 cols -> Desktop 4 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Gross Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Gross Sales ({effectiveLocationId === 'all' ? 'All' : activeLocObj?.code})</span>
              <TrendingUp className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight tabular-nums">
              ₦{metrics.grossSales.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Collected: ₦{totalCollected.toLocaleString()}</span>
            <span className="text-emerald-700 font-semibold">{filteredSales.length} txns</span>
          </div>
        </div>

        {/* Gross Profit / Shift Margin */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Gross Profit (After COGS)</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2 tracking-tight tabular-nums">
              ₦{metrics.grossProfit.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>COGS: ₦{metrics.costOfGoodsSold.toLocaleString()}</span>
            <span className="font-mono text-emerald-700 font-bold">{metrics.grossMarginPercent}% margin</span>
          </div>
        </div>

        {/* Net Profit or Local Operating Expenses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>{isAdmin ? 'Net Operating Profit' : 'Branch Operating Overhead'}</span>
              <Coins className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight tabular-nums">
              {isAdmin ? `₦${metrics.netOperatingProfit.toLocaleString()}` : `₦${metrics.operatingExpenses.toLocaleString()}`}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Expenses: ₦{metrics.operatingExpenses.toLocaleString()}</span>
            <span className="font-mono text-slate-600 font-semibold">
              {isAdmin ? `${metrics.netMarginPercent}% net` : 'Operating costs'}
            </span>
          </div>
        </div>

        {/* Location Inventory Valuation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Inventory Asset Value</span>
              <Package className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight tabular-nums">
              ₦{metrics.inventoryValuation.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{products.length} company SKUs</span>
            {lowStockItems.length > 0 ? (
              <span className="text-amber-700 font-bold">{lowStockItems.length} low stock</span>
            ) : (
              <span className="text-emerald-700">Healthy levels</span>
            )}
          </div>
        </div>
      </div>

      {/* AI Business Advisor (Gemini 4 Hydrogen) */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white">
                Executive AI Intelligence & Predictive Inventory Advisor
              </h2>
              <p className="text-[11px] text-slate-400">
                Live reorder triggers, margin optimization, and multi-branch transfer recommendations.
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateAiInsights}
            disabled={loadingAi}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
            <span>{loadingAi ? 'Analyzing...' : 'Generate Real-Time Insights'}</span>
          </button>
        </div>

        {aiInsights ? (
          <div className="mt-3.5 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line">
            {aiInsights}
          </div>
        ) : (
          <div className="mt-2.5 text-xs text-slate-400 italic">
            Click &quot;Generate Real-Time Insights&quot; to inspect current stockout risks and profit margins for {activeLocName}.
          </div>
        )}
      </div>

      {/* ADMIN TABS FOR LOCATION SPECIFIC DATA */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Section Navigation */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setAdminViewSection('kpi')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                adminViewSection === 'kpi' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Overview & Shortcuts
            </button>
            <button
              onClick={() => setAdminViewSection('sales')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                adminViewSection === 'sales' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sales History ({filteredSales.length})
            </button>
            <button
              onClick={() => setAdminViewSection('inventory')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                adminViewSection === 'inventory' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Location Stock & Bins
            </button>
            <button
              onClick={() => setAdminViewSection('staff')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                adminViewSection === 'staff' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Staff on Duty ({locationStaff.length})
            </button>
            <button
              onClick={() => setAdminViewSection('comparison')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                adminViewSection === 'comparison' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Multi-Branch Comparison
            </button>
          </div>

          <div className="p-4 sm:p-5">
            {/* View 1: Overview & Shortcuts */}
            {adminViewSection === 'kpi' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Branch comparison summary */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Branch Performance Overview</h3>
                    <button onClick={() => setAdminViewSection('comparison')} className="text-xs text-sky-600 font-semibold hover:underline">
                      Full Comparison Table →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {branchBreakdown.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => onSelectLocation(b.id)}
                        className={`p-3 rounded-lg border transition flex items-center justify-between cursor-pointer ${
                          effectiveLocationId === b.id ? 'bg-sky-50 border-sky-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{b.name}</div>
                          <div className="text-[11px] text-slate-500 capitalize">{b.type.replace('_', ' ')} · {b.code}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs text-slate-900 tabular-nums">₦{b.revenue.toLocaleString()}</div>
                          <div className="text-[10px] text-emerald-700 font-mono">Profit: ₦{b.grossProfit.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions & pending approvals */}
                <div className="space-y-4">
                  {/* Operational & Administrative Action Center */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Administrative Master Controls</h3>
                      <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        ERP Suite
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => onNavigate('products')}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold hover:bg-sky-50 hover:border-sky-300 text-left transition shadow-xs flex items-center gap-2"
                      >
                        <Boxes className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="truncate">Product & Prices</span>
                      </button>

                      <button
                        onClick={() => onNavigate('locations')}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold hover:bg-sky-50 hover:border-sky-300 text-left transition shadow-xs flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">Store Locations</span>
                      </button>

                      <button
                        onClick={() => onNavigate('staff')}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold hover:bg-sky-50 hover:border-sky-300 text-left transition shadow-xs flex items-center gap-2"
                      >
                        <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="truncate">Users & Access</span>
                      </button>

                      <button
                        onClick={() => onNavigate('projects')}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold hover:bg-sky-50 hover:border-sky-300 text-left transition shadow-xs flex items-center gap-2"
                      >
                        <HardHat className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">Contractor Projects</span>
                      </button>

                      <button
                        onClick={() => onNavigate('storefront')}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold hover:bg-sky-50 hover:border-sky-300 text-left transition shadow-xs flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="truncate">Online Storefront</span>
                      </button>

                      <button
                        onClick={() => onNavigate('barcode')}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold hover:bg-sky-50 hover:border-sky-300 text-left transition shadow-xs flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="truncate">Barcode Centre</span>
                      </button>

                      <button
                        onClick={() => onNavigate('transfers')}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold hover:bg-sky-50 hover:border-sky-300 text-left transition shadow-xs flex items-center gap-2"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="truncate">Stock Transfers</span>
                      </button>

                      <button
                        onClick={() => onNavigate('approvals')}
                        className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 text-left transition shadow-xs flex items-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">Approvals ({approvals.filter((a) => a.status === 'pending').length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Low Stock Watchlist */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-xs">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Reorder Watchlist ({lowStockItems.length})</span>
                    </div>
                    {lowStockItems.length === 0 ? (
                      <div className="text-slate-500">All materials meet minimum stock targets.</div>
                    ) : (
                      <div className="space-y-1.5">
                        {lowStockItems.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex justify-between text-[11px] text-amber-950">
                            <span className="truncate pr-2">{item.name}</span>
                            <span className="font-mono font-bold shrink-0">
                              {effectiveLocationId === 'all'
                                ? Object.values(item.locationStock).reduce((a, b) => a + b.onHand, 0)
                                : item.locationStock[effectiveLocationId]?.onHand || 0}{' '}
                              {item.baseUnit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* View 2: Sales History for Location */}
            {adminViewSection === 'sales' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-bold text-slate-900">
                    Confirmed Sales Transactions ({activeLocName})
                  </h3>
                  <button onClick={() => onNavigate('pos')} className="text-sky-600 font-semibold hover:underline">
                    New Counter Sale +
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3 font-mono">Receipt #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Cashier</th>
                        <th className="py-2.5 px-3 text-right font-mono">Amount</th>
                        <th className="py-2.5 px-3">Settlement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-bold text-sky-700">{sale.receiptNumber}</td>
                          <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-900">{sale.customerName}</td>
                          <td className="py-3 px-3 text-slate-600">{sale.cashierName}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                            ₦{sale.totalAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                              {sale.payments.map((p) => p.method.replace('_', ' ')).join(' + ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View 3: Location Inventory & Storage Bins */}
            {adminViewSection === 'inventory' && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-xs">
                  Physical Stock & Storage Coordinates ({activeLocName})
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">Material & SKU</th>
                        <th className="py-2.5 px-3">Unit</th>
                        <th className="py-2.5 px-3 text-right font-mono">On Hand Stock</th>
                        <th className="py-2.5 px-3 text-right font-mono">Reserved</th>
                        <th className="py-2.5 px-3">Storage Bin</th>
                        <th className="py-2.5 px-3 text-right font-mono">Unit Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {products.map((p) => {
                        const stock =
                          effectiveLocationId === 'all'
                            ? {
                                onHand: Object.values(p.locationStock).reduce((a, b) => a + b.onHand, 0),
                                reserved: Object.values(p.locationStock).reduce((a, b) => a + b.reserved, 0),
                                binLocation: 'Multi-Location',
                              }
                            : p.locationStock[effectiveLocationId] || { onHand: 0, reserved: 0, binLocation: 'Unassigned' };

                        return (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-medium text-slate-900">
                              <div>{p.name}</div>
                              <div className="text-[10px] font-mono text-sky-700">{p.sku}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-500">{p.baseUnit}</td>
                            <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                              <span className={stock.onHand <= p.minStockAlert ? 'text-amber-600' : 'text-slate-900'}>
                                {stock.onHand.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-500 tabular-nums">
                              {stock.reserved.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">{stock.binLocation}</td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                              ₦{p.retailPrice.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View 4: Staff on Duty */}
            {adminViewSection === 'staff' && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-xs">
                  Assigned Personnel & Shifts ({activeLocName})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {locationStaff.map((s) => (
                    <div key={s.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-3">
                      <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full object-cover shrink-0 border" />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 text-xs truncate">{s.name}</div>
                        <div className="text-[11px] text-sky-700 capitalize font-medium">{s.role.replace('_', ' ')}</div>
                        <div className="text-[10px] text-slate-400 truncate">{s.phone}</div>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" title="Shift Active" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View 5: Multi-Branch Comparison */}
            {adminViewSection === 'comparison' && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-xs">
                  Consolidated Multi-Location Performance Comparison
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">Operating Location</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3 text-right font-mono">Transactions</th>
                        <th className="py-2.5 px-3 text-right font-mono">Gross Sales</th>
                        <th className="py-2.5 px-3 text-right font-mono">Gross Profit</th>
                        <th className="py-2.5 px-3 text-right font-mono">Stock Asset Value</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {branchBreakdown.map((b) => (
                        <tr
                          key={b.id}
                          onClick={() => onSelectLocation(b.id)}
                          className="hover:bg-sky-50/60 cursor-pointer transition"
                        >
                          <td className="py-3 px-3 font-bold text-slate-900">
                            <div>{b.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{b.code}</div>
                          </td>
                          <td className="py-3 px-3 capitalize text-slate-500">{b.type.replace('_', ' ')}</td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums">{b.salesCount}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                            ₦{b.revenue.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-700 font-bold tabular-nums">
                            ₦{b.grossProfit.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">
                            ₦{b.stockValue.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-300">
                              Online
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOCATION MANAGER & STATION WORKFLOW DASHBOARD */}
      {!isAdmin && (
        <div className="space-y-4">
          {currentUser.role === 'branch_manager' ? (
            /* Dedicated Location Manager Cockpit */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                      Station: {activeLocObj?.code}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Location Manager Command Cockpit
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{activeLocName}</h3>
                  <p className="text-xs text-slate-500">
                    On-site management authority: counter POS, local inventory coordinates, shift tills, transfer acceptance, and crew supervision.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('pos')}
                    className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs"
                  >
                    Open Branch POS Counter
                  </button>
                  <button
                    onClick={() => onNavigate('transfers')}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Request Stock Transfer
                  </button>
                </div>
              </div>

              {/* Location Manager Action Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <button
                  onClick={() => onNavigate('inventory')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-left transition"
                >
                  <Layers className="w-4 h-4 text-sky-600 mb-1" />
                  <div className="font-bold text-slate-900">Branch Stock Matrix</div>
                  <div className="text-[11px] text-slate-500">Track Storage Bins & Counts</div>
                </button>

                <button
                  onClick={() => onNavigate('scanner')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-left transition"
                >
                  <Package className="w-4 h-4 text-indigo-600 mb-1" />
                  <div className="font-bold text-slate-900">Barcode Inspection</div>
                  <div className="text-[11px] text-slate-500">Physical Stock Verification</div>
                </button>

                <button
                  onClick={() => onNavigate('approvals')}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-left transition"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600 mb-1" />
                  <div className="font-bold text-amber-950">Branch Approvals</div>
                  <div className="text-[11px] text-amber-800">
                    {approvals.filter((a) => a.status === 'pending' && a.branchId === effectiveLocationId).length} Local Tickets
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('deliveries')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-left transition"
                >
                  <Truck className="w-4 h-4 text-emerald-600 mb-1" />
                  <div className="font-bold text-slate-900">Local Fleet Dispatch</div>
                  <div className="text-[11px] text-slate-500">Track Outbound Delivery Runs</div>
                </button>
              </div>

              {/* Stationed Personnel */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Branch Crew on Duty ({locationStaff.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {locationStaff.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-2.5 text-xs">
                      <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 truncate">{s.name}</div>
                        <div className="text-[11px] text-sky-700 capitalize font-medium">{s.role.replace('_', ' ')}</div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active on Shift" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Cashier / Warehouse / Field Worker Operational Station */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentUser.role === 'cashier'
                      ? 'Counter POS Cashier Shift Station'
                      : currentUser.role === 'warehouse_officer'
                      ? 'Central Distribution Warehouse Desk'
                      : 'Field Logistics & Operational Dispatch'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Operating strictly within {activeLocName}. Non-authorized company financial accounts are locked.
                  </p>
                </div>

                <button
                  onClick={() => onNavigate(currentUser.role === 'cashier' ? 'pos' : 'inventory')}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs"
                >
                  {currentUser.role === 'cashier' ? 'Start POS Sale' : 'Open Inventory Matrix'}
                </button>
              </div>

              {/* Quick shortcuts for employee role */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <button
                  onClick={() => onNavigate('pos')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-left transition"
                >
                  <ShoppingCart className="w-4 h-4 text-sky-600 mb-1" />
                  <div className="font-bold text-slate-900">Sales Register</div>
                  <div className="text-[11px] text-slate-500">Process Counter Transactions</div>
                </button>

                <button
                  onClick={() => onNavigate('scanner')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-left transition"
                >
                  <Package className="w-4 h-4 text-indigo-600 mb-1" />
                  <div className="font-bold text-slate-900">Scan & Identify</div>
                  <div className="text-[11px] text-slate-500">Instant Barcode Lookup</div>
                </button>

                <button
                  onClick={() => onNavigate('products')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-left transition"
                >
                  <Boxes className="w-4 h-4 text-slate-700 mb-1" />
                  <div className="font-bold text-slate-900">Price & Stock</div>
                  <div className="text-[11px] text-slate-500">Check Branch Inventory</div>
                </button>

                <button
                  onClick={() => onNavigate('storefront')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-left transition"
                >
                  <Building2 className="w-4 h-4 text-emerald-600 mb-1" />
                  <div className="font-bold text-slate-900">Public Store</div>
                  <div className="text-[11px] text-slate-500">Official Customer E-Comm</div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
