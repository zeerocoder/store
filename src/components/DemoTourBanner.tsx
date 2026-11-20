import React, { useState } from 'react';
import {
  Sparkles,
  Barcode,
  Truck,
  FileSpreadsheet,
  Coins,
  HardHat,
  ChevronRight,
  X,
  Layers,
  Scale,
  Lock,
} from 'lucide-react';

interface DemoTourBannerProps {
  onNavigateTab: (tab: string) => void;
  onTriggerAction?: (action: string) => void;
}

export const DemoTourBanner: React.FC<DemoTourBannerProps> = ({
  onNavigateTab,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="bg-slate-900 border-b border-amber-500/40 text-white px-4 py-1.5 flex items-center justify-between text-xs z-30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-amber-400">Enterprise Operations Demo Mode Active</span>
          <span className="text-slate-400 hidden sm:inline">· 5 Field-Tested Phases Live</span>
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs text-sky-400 hover:text-white font-bold flex items-center gap-1"
        >
          <span>Expand Interactive Demo Guide</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 border-b-2 border-amber-500 text-white p-3 sm:px-6 shadow-xl relative z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/50 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xs uppercase tracking-wider text-amber-400">
                Interactive Operational Tour
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                PHASE 1 & 2 READY
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Test core building materials management flows in 1 click:
            </p>
          </div>
        </div>

        {/* 5 1-Click Interactive Test Scenarios */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Scenario 1 */}
          <button
            onClick={() => onNavigateTab('pos')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition flex items-center gap-1.5 shadow-xs"
            title="Jump to POS with Hardware Scanner & 80mm Thermal Receipt"
          >
            <Barcode className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">1. POS & 80mm Receipt</span>
          </button>

          {/* Scenario 2 */}
          <button
            onClick={() => onNavigateTab('deliveries')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition flex items-center gap-1.5 shadow-xs"
            title="Inspect 3-Part Commercial Waybill & Security Weighbridge Pass"
          >
            <Truck className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold">2. 3-Part Waybill & Pass</span>
          </button>

          {/* Scenario 3 */}
          <button
            onClick={() => onNavigateTab('finance')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition flex items-center gap-1.5 shadow-xs"
            title="View Landed Cost Procurement Ledger (Haulage + Union Dues)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">3. Landed Cost Engine</span>
          </button>

          {/* Scenario 4 */}
          <button
            onClick={() => onNavigateTab('finance')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition flex items-center gap-1.5 shadow-xs"
            title="Test Cashier Blind Closeout & Till Z-Report"
          >
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-bold">4. Blind Till Z-Report</span>
          </button>

          {/* Scenario 5 */}
          <button
            onClick={() => onNavigateTab('projects')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition flex items-center gap-1.5 shadow-xs"
            title="Inspect Contractor 30/60/90 Debt Aging & Overdue Credit Freeze"
          >
            <HardHat className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-bold">5. Debt Aging & Freeze</span>
          </button>

          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition ml-1"
            title="Collapse banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
