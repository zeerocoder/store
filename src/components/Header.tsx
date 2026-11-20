import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  Store,
  Layers,
  ArrowRightLeft,
  Barcode,
  ScanLine,
  Coins,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import { StaffUser, Location } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentUser: StaffUser;
  staff: StaffUser[];
  activeLocationId: string;
  locations: Location[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchUser: (userId: string) => void;
  onSwitchLocation: (locationId: string) => void;
  pendingApprovalsCount: number;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  staff,
  activeLocationId,
  locations,
  activeTab,
  setActiveTab,
  onSwitchUser,
  onSwitchLocation,
  pendingApprovalsCount,
  onToggleMobileMenu,
}) => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const activeLocation = locations.find((l) => l.id === activeLocationId);
  const canSwitchLocation = currentUser.assignedLocationId === 'all';

  const roleLabels: Record<string, string> = {
    owner: 'Chief Executive / Owner',
    general_manager: 'General Operations Manager',
    branch_manager: 'Branch Manager',
    inventory_manager: 'Inventory Manager',
    warehouse_officer: 'Warehouse Officer',
    cashier: 'Senior Cashier',
    sales_rep: 'Contractor Sales Rep',
    accountant: 'Chief Accountant, FCA',
    delivery_personnel: 'Logistics & Fleet',
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top 3-Zone Contract Container */}
      <div className="flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 max-w-7xl mx-auto">
        
        {/* Zone 1: Hamburger toggle (mobile) + single text element wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 font-bold">
            <span className="text-base tracking-tighter">EET</span>
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-sm sm:text-base font-bold tracking-tight text-white hover:text-sky-400 transition whitespace-nowrap shrink-0 text-left"
          >
            Elite Energy <span className="hidden sm:inline">Technology</span>
          </button>
        </div>

        {/* Zone 2: Navigation links / tabs */}
        <nav className="hidden xl:flex items-center gap-1.5 text-xs font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-sky-400 font-semibold'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap shrink-0 ${
              activeTab === 'pos'
                ? 'bg-slate-800 text-sky-400 font-semibold'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            POS Terminal
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap shrink-0 ${
              activeTab === 'products'
                ? 'bg-slate-800 text-sky-400 font-semibold'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Catalogue
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap shrink-0 ${
              activeTab === 'transfers'
                ? 'bg-slate-800 text-sky-400 font-semibold'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Stock Transfers
          </button>
          {canSwitchLocation && (
            <>
              <button
                onClick={() => setActiveTab('locations')}
                className={`px-3 py-1.5 rounded-md transition whitespace-nowrap shrink-0 ${
                  activeTab === 'locations'
                    ? 'bg-slate-800 text-sky-400 font-semibold'
                    : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Locations
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-3 py-1.5 rounded-md transition whitespace-nowrap shrink-0 ${
                  activeTab === 'staff'
                    ? 'bg-slate-800 text-sky-400 font-semibold'
                    : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Staff
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('barcode')}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap shrink-0 ${
              activeTab === 'barcode'
                ? 'bg-slate-800 text-sky-400 font-semibold'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Barcode Centre
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap shrink-0 ${
              activeTab === 'scanner'
                ? 'bg-slate-800 text-sky-400 font-semibold'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Scan & Identify
          </button>
          <button
            onClick={() => setActiveTab('storefront')}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap shrink-0 ${
              activeTab === 'storefront'
                ? 'bg-sky-600/30 text-sky-300 border border-sky-500/40 font-semibold'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Online Storefront
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-3 py-1.5 rounded-md transition whitespace-nowrap shrink-0 ${
              activeTab === 'finance'
                ? 'bg-slate-800 text-sky-400 font-semibold'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Finance & Ledger
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`relative px-3 py-1.5 rounded-md transition whitespace-nowrap shrink-0 ${
              activeTab === 'approvals'
                ? 'bg-slate-800 text-sky-400 font-semibold'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Approvals
            {pendingApprovalsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono border border-amber-500/40">
                {pendingApprovalsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Active Location, Profile Switcher & PWA */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Location Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLocationModal(!showLocationModal)}
              disabled={!canSwitchLocation}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs rounded-md border transition whitespace-nowrap ${
                canSwitchLocation
                  ? 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-slate-700 cursor-pointer'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 cursor-default'
              }`}
              title={
                canSwitchLocation
                  ? 'Switch monitored branch or warehouse'
                  : 'Your account is locked to your assigned branch'
              }
            >
              <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-medium max-w-[85px] sm:max-w-[140px] truncate">
                {activeLocationId === 'all'
                  ? 'All Locations'
                  : activeLocation?.name.replace(' Central', '').replace(' Materials', '') || 'Location'}
              </span>
              {canSwitchLocation && <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />}
            </button>

            {/* Location Dropdown Modal */}
            {showLocationModal && canSwitchLocation && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400">
                  Select Operating Location
                </div>
                <div className="mt-1 space-y-1">
                  <button
                    onClick={() => {
                      onSwitchLocation('all');
                      setShowLocationModal(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between ${
                      activeLocationId === 'all'
                        ? 'bg-sky-500/10 text-sky-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>All Locations (Consolidated)</span>
                    {activeLocationId === 'all' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onSwitchLocation(loc.id);
                        setShowLocationModal(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between ${
                        activeLocationId === loc.id
                          ? 'bg-sky-500/10 text-sky-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-white">{loc.name}</div>
                        <div className="text-[11px] text-slate-400">{loc.city} · {loc.code}</div>
                      </div>
                      {activeLocationId === loc.id && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserModal(!showUserModal)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg transition whitespace-nowrap cursor-pointer shrink-0"
              title="Switch active employee account to test permissions"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-600 shrink-0"
              />
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold leading-tight text-white">{currentUser.name}</div>
                <div className="text-[10px] text-sky-400 leading-none">{roleLabels[currentUser.role] || currentUser.role}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
            </button>

            {/* Operator Switcher Modal */}
            {showUserModal && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Employee Login Switcher</span>
                  <span className="text-[11px] text-sky-400 font-mono">Internal RBAC</span>
                </div>
                <div className="mt-1 max-h-80 overflow-y-auto space-y-1">
                  {staff.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSwitchUser(s.id);
                        setShowUserModal(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition flex items-center gap-3 ${
                        currentUser.id === s.id
                          ? 'bg-sky-500/10 border border-sky-500/30'
                          : 'hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{s.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{roleLabels[s.role] || s.role}</div>
                        <div className="text-[10px] text-sky-400 truncate font-mono">
                          {s.assignedLocationId === 'all'
                            ? 'All Locations'
                            : locations.find((l) => l.id === s.assignedLocationId)?.name}
                        </div>
                      </div>
                      {currentUser.id === s.id && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
