import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Layers,
  ArrowRightLeft,
  Barcode,
  ScanLine,
  HardHat,
  Store,
  Truck,
  FileSpreadsheet,
  Coins,
  ShieldAlert,
  History,
  DownloadCloud,
  Building2,
  Users,
} from 'lucide-react';
import { StaffUser } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: StaffUser;
  pendingApprovalsCount: number;
  inTransitTransfersCount: number;
  onExportBackup: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  pendingApprovalsCount,
  inTransitTransfersCount,
  onExportBackup,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const isManagement = ['owner', 'general_manager', 'branch_manager', 'accountant'].includes(currentUser.role);

  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard, badge: null, restricted: false },
    { id: 'pos', label: 'Point of Sale (POS)', icon: ShoppingCart, badge: null, restricted: false },
    { id: 'products', label: 'Product Catalogue', icon: Boxes, badge: null, restricted: false },
    { id: 'inventory', label: 'Multi-Location Stock', icon: Layers, badge: null, restricted: false },
    { id: 'transfers', label: 'Stock Transfers', icon: ArrowRightLeft, badge: inTransitTransfersCount > 0 ? `${inTransitTransfersCount} Transit` : null, restricted: false },
    { id: 'locations', label: 'Store Locations', icon: Building2, badge: null, restricted: !isManagement },
    { id: 'staff', label: 'Users & Access', icon: Users, badge: null, restricted: !isManagement },
    { id: 'barcode', label: 'Barcode Centre', icon: Barcode, badge: null, restricted: false },
    { id: 'scanner', label: 'Scan & Identify', icon: ScanLine, badge: null, restricted: false },
    { id: 'storefront', label: 'Public Online Store', icon: Store, badge: 'Live E-Comm', restricted: false },
    { id: 'projects', label: 'Contractor Projects', icon: HardHat, badge: null, restricted: false },
    { id: 'deliveries', label: 'Fleet & Deliveries', icon: Truck, badge: null, restricted: false },
    { id: 'purchasing', label: 'Suppliers & POs', icon: FileSpreadsheet, badge: null, restricted: !isManagement },
    { id: 'finance', label: 'Finance & Cash Drawer', icon: Coins, badge: null, restricted: !isManagement },
    { id: 'approvals', label: 'Approval Queue', icon: ShieldAlert, badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : null, restricted: false },
    { id: 'audit', label: 'Security Audit Trail', icon: History, badge: null, restricted: !isManagement },
  ];

  const renderNavContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full">
      {/* Brand Subtitle / Department Info */}
      <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Internal Operations
          </div>
          <div className="text-xs font-bold text-white truncate">
            {currentUser.department}
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Sync: Live
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.restricted && currentUser.role === 'cashier') return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile && onCloseMobile) {
                  onCloseMobile();
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 text-xs font-medium rounded-lg transition-colors text-left min-h-[44px] sm:min-h-[38px] ${
                isActive
                  ? 'bg-sky-600/20 text-sky-400 font-semibold border border-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full shrink-0 ${
                    item.id === 'approvals'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Backup & System Ownership */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={onExportBackup}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-200 transition border border-slate-700 min-h-[44px]"
          title="Export complete encrypted database snapshot for offsite backup"
        >
          <DownloadCloud className="w-4 h-4 text-sky-400" />
          <span>Export System Backup</span>
        </button>
        <div className="text-[10px] text-center text-slate-500">
          Elite Energy Technology · Sole Owner & Operator
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col shrink-0 text-slate-300">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer Box */}
          <div className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Navigation Menu</span>
              <button
                onClick={onCloseMobile}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {renderNavContent(true)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
