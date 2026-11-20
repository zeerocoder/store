import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Edit3,
  UserX,
  Lock,
  CheckCircle2,
  X,
  AlertTriangle,
  BadgeCheck,
} from 'lucide-react';
import { StaffUser, StaffRole, Location, ROLE_PRIVILEGES } from '../types';

interface StaffManagementViewProps {
  staff: StaffUser[];
  locations: Location[];
  currentUser: StaffUser;
  onAddStaff: (userData: Omit<StaffUser, 'id'>) => StaffUser;
  onUpdateStaff: (id: string, updates: Partial<StaffUser>) => void;
  onDeleteStaff: (id: string) => void;
  onSwitchUser: (id: string) => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  staff,
  locations,
  currentUser,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onSwitchUser,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [deactivatingStaff, setDeactivatingStaff] = useState<StaffUser | null>(null);
  const [inspectingRole, setInspectingRole] = useState<StaffRole>('branch_manager');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('sales_rep');
  const [assignedLocationId, setAssignedLocationId] = useState<string>('loc-vi');
  const [department, setDepartment] = useState('Commercial Sales');
  const [phone, setPhone] = useState('+234 ');

  const canManageStaff = ['owner', 'general_manager'].includes(currentUser.role);

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setRole('sales_rep');
    setAssignedLocationId(locations[0]?.id || 'loc-vi');
    setDepartment('Commercial Operations');
    setPhone('+234 ');
    setShowAddModal(true);
  };

  const handleSaveNew = () => {
    if (!name || !email) {
      alert('Please provide the employee full name and corporate email.');
      return;
    }

    onAddStaff({
      name,
      email,
      role,
      assignedLocationId,
      department,
      phone,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?w=150&auto=format&fit=crop&q=80`,
      isActive: true,
    });
    setShowAddModal(false);
  };

  const handleOpenEdit = (user: StaffUser) => {
    setEditingStaff(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setAssignedLocationId(user.assignedLocationId);
    setDepartment(user.department);
    setPhone(user.phone);
  };

  const handleSaveEdit = () => {
    if (!editingStaff) return;
    onUpdateStaff(editingStaff.id, {
      name,
      email,
      role,
      assignedLocationId,
      department,
      phone,
    });
    setEditingStaff(null);
  };

  const handleConfirmDeactivate = () => {
    if (!deactivatingStaff) return;
    onDeleteStaff(deactivatingStaff.id);
    setDeactivatingStaff(null);
  };

  const rolesList: StaffRole[] = [
    'owner',
    'general_manager',
    'branch_manager',
    'inventory_manager',
    'cashier',
    'warehouse_officer',
    'accountant',
    'delivery_personnel',
    'sales_rep',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>Human Capital & Access Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Staff Credentials, Roles & Location Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign company operators to specific branches with strict location-locking, financial visibility gates, and threshold limits.
          </p>
        </div>

        {canManageStaff && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision Staff Account</span>
          </button>
        )}
      </div>

      {!canManageStaff && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            You are logged in as <strong>{currentUser.name} ({currentUser.role})</strong>. User account provisioning and role privilege editing is restricted to Senior Management.
          </span>
        </div>
      )}

      {/* Staff Accounts List & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Registered Employee Accounts ({staff.length})</h3>
          <span className="text-xs text-slate-500 font-mono">Single Company Realm: Elite Energy Technology</span>
        </div>

        {/* Mobile Cards (<md) */}
        <div className="md:hidden divide-y divide-slate-100 p-2 space-y-3">
          {staff.map((user) => {
            const privs = ROLE_PRIVILEGES[user.role] || ROLE_PRIVILEGES.cashier;
            const assignedLoc = locations.find((l) => l.id === user.assignedLocationId);
            const isCurrent = currentUser.id === user.id;
            const isActive = user.isActive !== false;

            return (
              <div key={user.id} className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                        <span>{user.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-1.5 py-0.2 rounded-sm">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-red-50 text-red-700 border-red-300'
                    }`}
                  >
                    {isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                {/* Role and Location */}
                <div className="space-y-1.5 p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setInspectingRole(user.role)}
                      className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300 text-left"
                    >
                      {user.role.replace('_', ' ')}
                    </button>
                    <span className="text-[11px] text-slate-500">{privs.roleTitle}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-700 pt-1 border-t border-slate-100">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {user.assignedLocationId === 'all'
                        ? 'All Company Outlets (Global Access)'
                        : assignedLoc?.name || user.assignedLocationId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-500">{user.department}</span>
                    <a
                      href={`tel:${user.phone}`}
                      className="flex items-center gap-1 text-sky-600 font-mono font-medium hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{user.phone}</span>
                    </a>
                  </div>
                </div>

                {/* Mobile Action Buttons (min-h-[44px]) */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onSwitchUser(user.id)}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold min-h-[44px] transition"
                  >
                    Switch Context
                  </button>

                  {canManageStaff && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="py-2.5 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold min-h-[44px] flex items-center justify-center gap-1"
                        title="Edit user details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {isActive && user.role !== 'owner' && (
                        <button
                          onClick={() => setDeactivatingStaff(user)}
                          className="py-2.5 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold min-h-[44px] flex items-center justify-center gap-1"
                          title="Deactivate user"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Deactivate</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Role & Privileges</th>
                <th className="py-3 px-3">Assigned Location</th>
                <th className="py-3 px-3">Department & Phone</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {staff.map((user) => {
                const privs = ROLE_PRIVILEGES[user.role] || ROLE_PRIVILEGES.cashier;
                const assignedLoc = locations.find((l) => l.id === user.assignedLocationId);
                const isCurrent = currentUser.id === user.id;
                const isActive = user.isActive !== false;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-1.5 py-0.2 rounded-sm">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => setInspectingRole(user.role)}
                        className="text-left group"
                        title="Click to view role privileges"
                      >
                        <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300 group-hover:bg-sky-50 group-hover:text-sky-700 group-hover:border-sky-300 transition">
                          {user.role.replace('_', ' ')}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">{privs.roleTitle}</div>
                      </button>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {user.assignedLocationId === 'all'
                            ? 'All Company Outlets (Global Access)'
                            : assignedLoc?.name || user.assignedLocationId}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-slate-800 font-medium">{user.department}</div>
                      <div className="text-[11px] font-mono text-slate-500">{user.phone}</div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-red-50 text-red-700 border-red-300'
                        }`}
                      >
                        {isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSwitchUser(user.id)}
                          className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
                          title="Switch active operating context to this user"
                        >
                          Switch
                        </button>

                        {canManageStaff && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition"
                              title="Edit user details and assigned branch"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {isActive && user.role !== 'owner' && (
                              <button
                                onClick={() => setDeactivatingStaff(user)}
                                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Deactivate user account"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Privileges Inspection Matrix */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">Configurable Security Matrix</span>
            <h3 className="text-base font-bold text-white">
              Role Authority Blueprint: {ROLE_PRIVILEGES[inspectingRole]?.roleTitle}
            </h3>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {rolesList.map((r) => (
              <button
                key={r}
                onClick={() => setInspectingRole(r)}
                className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap capitalize transition font-medium ${
                  inspectingRole === r
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {ROLE_PRIVILEGES[inspectingRole]?.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Explicitly Granted Privileges:
            </span>
            <div className="space-y-1 text-slate-300">
              {ROLE_PRIVILEGES[inspectingRole]?.grantedPrivileges.map((gp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{gp}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Enforced Access Restrictions:
            </span>
            <div className="space-y-1 text-slate-300">
              {ROLE_PRIVILEGES[inspectingRole]?.restrictedPrivileges.length === 0 ? (
                <div className="text-slate-500 italic">No restrictions (Full sovereign administrative scope).</div>
              ) : (
                ROLE_PRIVILEGES[inspectingRole]?.restrictedPrivileges.map((rp, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-400">
                    <span className="text-amber-400 font-bold">✕</span>
                    <span>{rp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-sky-400" />
                  <span>Provision Employee Account</span>
                </h3>
                <p className="text-[11px] text-slate-400">Creates an authorized company operator account with assigned role.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 text-xs flex-1 overflow-y-auto">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Employee Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ibrahim Abubakar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Corporate Email *</label>
                <input
                  type="email"
                  placeholder="e.g. i.abubakar@eliteenergytech.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Access Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs capitalize"
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r}>
                        {r.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Stationed Facility *</label>
                  <select
                    value={assignedLocationId}
                    onChange={(e) => setAssignedLocationId(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    <option value="all">Company-Wide (All Hubs & Branches)</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Counter Sales & Cashiering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+234 803 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs shrink-0">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleSaveNew}
                className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs"
              >
                Provision Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold">Edit Credentials: {editingStaff.name}</h3>
              <button onClick={() => setEditingStaff(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 text-xs flex-1 overflow-y-auto">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Corporate Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs capitalize"
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r}>
                        {r.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Assigned Location</label>
                  <select
                    value={assignedLocationId}
                    onChange={(e) => setAssignedLocationId(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    <option value="all">Company-Wide (All Hubs & Branches)</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs shrink-0">
              <button onClick={() => setEditingStaff(null)} className="px-4 py-2 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate User Confirmation Modal */}
      {deactivatingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-300 p-5 space-y-4 text-slate-900">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Deactivate Staff Account</span>
            </h3>
            <p className="text-xs text-slate-600">
              Revoke login permissions for <strong>{deactivatingStaff.name}</strong> ({deactivatingStaff.role})? Historical sales and audit trails signed by this user will remain preserved.
            </p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setDeactivatingStaff(null)} className="px-3 py-1.5 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivate}
                className="px-4 py-1.5 font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
