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
  Edit3,
  Camera,
  Upload,
  RefreshCw,
  X,
} from 'lucide-react';
import { StaffUser, Location } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { compressImage } from '../utils/imageStorage';

interface HeaderProps {
  currentUser: StaffUser;
  staff: StaffUser[];
  activeLocationId: string;
  locations: Location[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchUser: (userId: string) => void;
  onSwitchLocation: (locationId: string) => void;
  onUpdateStaff?: (id: string, updates: Partial<StaffUser>) => void;
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
  onUpdateStaff,
  pendingApprovalsCount,
  onToggleMobileMenu,
}) => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileAvatar, setProfileAvatar] = useState(currentUser.avatar);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');

  const handleProfileAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Selected photo exceeds 20MB. Please choose a smaller photo.');
      return;
    }

    try {
      const compressed = await compressImage(file, 400, 400, 0.85);
      if (compressed) {
        setProfileAvatar(compressed);
        setProfileAvatarUrl('');
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setProfileAvatar(dataUrl);
          setProfileAvatarUrl('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (onUpdateStaff) {
      onUpdateStaff(currentUser.id, {
        name: profileName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim(),
        avatar: profileAvatar || currentUser.avatar,
      });
    }
    setShowProfileModal(false);
  };

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
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2.5 z-50">
                <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Employee Login Switcher</span>
                  <span className="text-[11px] text-sky-400 font-mono">RBAC</span>
                </div>

                {/* Active Operator Card with Edit Profile Button */}
                <div className="mt-2 p-2.5 bg-slate-800/90 rounded-xl border border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-sky-400 shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        <span>{currentUser.name}</span>
                        <span className="text-[9px] bg-sky-500/20 text-sky-400 border border-sky-500/40 px-1 py-0.2 rounded font-mono">
                          Active
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 truncate font-medium">
                        {roleLabels[currentUser.role] || currentUser.role}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate font-mono">
                        {currentUser.phone || currentUser.email}
                      </div>
                    </div>
                  </div>

                  {onUpdateStaff && (
                    <button
                      onClick={() => {
                        setProfileName(currentUser.name);
                        setProfileEmail(currentUser.email);
                        setProfilePhone(currentUser.phone);
                        setProfileAvatar(currentUser.avatar);
                        setProfileAvatarUrl('');
                        setShowUserModal(false);
                        setShowProfileModal(true);
                      }}
                      className="mt-2.5 w-full py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit My Profile & Photo</span>
                    </button>
                  )}
                </div>

                <div className="px-2 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Account
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1">
                  {staff.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSwitchUser(s.id);
                        setShowUserModal(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg transition flex items-center gap-2.5 ${
                        currentUser.id === s.id
                          ? 'bg-sky-500/10 border border-sky-500/30'
                          : 'hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{s.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{roleLabels[s.role] || s.role}</div>
                      </div>
                      {currentUser.id === s.id && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit My Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs text-slate-900">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-sky-400" />
                  <span>My Account Profile & Photo</span>
                </h3>
                <p className="text-[11px] text-slate-400">Update your personal avatar and details</p>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs flex-1 overflow-y-auto">
              {/* Avatar Uploader Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Your Profile Photo</label>
                  <span className="text-[10px] text-slate-400 font-mono">Auto-compressed</span>
                </div>

                <div className="flex items-center gap-3.5">
                  <img
                    src={profileAvatar || currentUser.avatar}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-sky-400 shadow-sm shrink-0"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold cursor-pointer transition shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileAvatarUpload}
                        />
                      </label>

                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-[11px] font-semibold cursor-pointer transition shadow-xs">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Camera</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="user"
                          className="hidden"
                          onChange={handleProfileAvatarUpload}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      placeholder="Or paste direct image URL (https://...)"
                      value={profileAvatarUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfileAvatarUrl(val);
                        if (val.trim().startsWith('http') || val.trim().startsWith('data:')) {
                          setProfileAvatar(val.trim());
                        }
                      }}
                      className="w-full p-1.5 rounded-lg border border-slate-300 bg-white text-[11px] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Your Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Corporate Email</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Contact Phone Number</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-[11px] font-bold text-slate-700">Account Authorization Scope</div>
                <div className="text-[10px] text-slate-500">
                  Role: <strong className="text-slate-800">{roleLabels[currentUser.role] || currentUser.role}</strong> · Station: <strong className="text-slate-800">{currentUser.assignedLocationId === 'all' ? 'All Locations' : locations.find(l => l.id === currentUser.assignedLocationId)?.name}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs shrink-0">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs"
              >
                Save & Update Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
