import React, { useState } from 'react';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  User,
  Package,
  Layers,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Warehouse,
  ShieldAlert,
} from 'lucide-react';
import { Location, LocationType, StaffUser, Product, ROLE_PRIVILEGES } from '../types';

interface LocationsViewProps {
  locations: Location[];
  staff: StaffUser[];
  products: Product[];
  currentUser: StaffUser;
  onAddLocation: (loc: Omit<Location, 'id'>) => Location;
  onUpdateLocation: (id: string, updates: Partial<Location>) => void;
  onDeleteLocation: (id: string) => void;
  onSelectLocationForView: (locId: string) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  locations,
  staff,
  products,
  currentUser,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  onSelectLocationForView,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<LocationType>('retail_branch');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Lagos State');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [totalCapacityTons, setTotalCapacityTons] = useState(1000);

  const canManageLocations = ['owner', 'general_manager'].includes(currentUser.role);

  const handleOpenAdd = () => {
    setName('');
    setCode(`EET-${Math.floor(10 + Math.random() * 90)}`);
    setType('retail_branch');
    setCity('Lagos');
    setState('Lagos State');
    setAddress('');
    setPhone('+234 ');
    setManagerName('');
    setTotalCapacityTons(1000);
    setShowAddModal(true);
  };

  const handleSaveNew = () => {
    if (!name || !code || !address) {
      alert('Please fill in the Facility Name, Code, and Physical Address.');
      return;
    }
    onAddLocation({
      name,
      code: code.toUpperCase(),
      type,
      city,
      state,
      address,
      phone,
      managerName: managerName || 'Branch Manager',
      isActive: true,
      totalCapacityTons: Number(totalCapacityTons) || 500,
    });
    setShowAddModal(false);
  };

  const handleOpenEdit = (loc: Location) => {
    setEditingLocation(loc);
    setName(loc.name);
    setCode(loc.code);
    setType(loc.type);
    setCity(loc.city);
    setState(loc.state);
    setAddress(loc.address);
    setPhone(loc.phone);
    setManagerName(loc.managerName);
    setTotalCapacityTons(loc.totalCapacityTons);
  };

  const handleSaveEdit = () => {
    if (!editingLocation) return;
    onUpdateLocation(editingLocation.id, {
      name,
      code: code.toUpperCase(),
      type,
      city,
      state,
      address,
      phone,
      managerName,
      totalCapacityTons: Number(totalCapacityTons) || 500,
    });
    setEditingLocation(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingLocation) return;
    onDeleteLocation(deletingLocation.id);
    setDeletingLocation(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Facility & Network Infrastructure</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Company Outlets, Warehouses & Storage Yards
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centrally register company distribution hubs, retail branches, and holding yards with isolated inventory balances and location locking.
          </p>
        </div>

        {canManageLocations && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Open New Facility / Branch</span>
          </button>
        )}
      </div>

      {!canManageLocations && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            You are logged in as <strong>{currentUser.name} ({currentUser.role})</strong>. Facility commissioning and de-commissioning is restricted to Owner and General Manager roles.
          </span>
        </div>
      )}

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map((loc) => {
          const assignedStaffCount = staff.filter(
            (s) => s.assignedLocationId === loc.id || s.assignedLocationId === 'all'
          ).length;

          const locationStockOnHand = products.reduce(
            (sum, p) => sum + (p.locationStock[loc.id]?.onHand || 0),
            0
          );

          const locationStockValuation = products.reduce(
            (sum, p) => sum + (p.locationStock[loc.id]?.onHand || 0) * p.costPrice,
            0
          );

          const typeBadge = {
            retail_branch: { label: 'Retail Branch', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            warehouse: { label: 'Central Warehouse', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            yard: { label: 'Heavy Materials Yard', color: 'bg-amber-50 text-amber-700 border-amber-200' },
            distribution_center: { label: 'Distribution Hub', color: 'bg-sky-50 text-sky-700 border-sky-200' },
          }[loc.type] || { label: loc.type, color: 'bg-slate-100 text-slate-700 border-slate-200' };

          return (
            <div
              key={loc.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition ${
                loc.isActive ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        {loc.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadge.color}`}>
                        {typeBadge.label}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{loc.name}</h3>
                  </div>

                  {canManageLocations && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(loc)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Location Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {locations.length > 1 && (
                        <button
                          onClick={() => setDeletingLocation(loc)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove Location"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{loc.address}, {loc.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Manager: <strong className="text-slate-800">{loc.managerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px] text-slate-700">{loc.phone}</span>
                  </div>
                </div>

                {/* Stock & Capacity Metrics Strip */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Inventory Assets</span>
                    <div className="text-xs font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
                      ₦{locationStockValuation.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">{locationStockOnHand.toLocaleString()} total units</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Capacity & Crew</span>
                    <div className="text-xs font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
                      {loc.totalCapacityTons.toLocaleString()} T Cap
                    </div>
                    <div className="text-[10px] text-slate-500">{assignedStaffCount} staff stationed</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operational
                </span>

                <button
                  onClick={() => onSelectLocationForView(loc.id)}
                  className="px-3 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition"
                >
                  Filter ERP to this Hub →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-sky-400" />
                  <span>Register Company Operating Facility</span>
                </h3>
                <p className="text-[11px] text-slate-400">Creates isolated inventory storage and employee stationing point.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Facility Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Abuja Regional Distribution Depot"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Location Code (SKU Prefix) *</label>
                  <input
                    type="text"
                    placeholder="e.g. ABJ-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Facility Classification *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as LocationType)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    <option value="retail_branch">Retail Branch (Walk-in & POS)</option>
                    <option value="warehouse">Central Distribution Warehouse</option>
                    <option value="yard">Heavy Materials Yard (Tipper/Flatbed)</option>
                    <option value="distribution_center">Regional Distribution Center</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Storage Capacity (Tonnes)</label>
                  <input
                    type="number"
                    value={totalCapacityTons}
                    onChange={(e) => setTotalCapacityTons(parseInt(e.target.value, 10) || 500)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">City / LGA</label>
                  <input
                    type="text"
                    placeholder="e.g. Ibeju-Lekki / Ikeja"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Lagos State / Rivers State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Physical Street Address *</label>
                <input
                  type="text"
                  placeholder="e.g. Plot 8 Industrial Layout, Idu, Abuja"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Station Manager Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Engr. Mustapha Lawal"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Station Phone / Hotline</label>
                  <input
                    type="text"
                    placeholder="e.g. +234 803 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleSaveNew}
                className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs"
              >
                Register & Commission Facility
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {editingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Location: {editingLocation.name}</h3>
              <button onClick={() => setEditingLocation(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Facility Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Classification</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as LocationType)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    <option value="retail_branch">Retail Branch</option>
                    <option value="warehouse">Central Warehouse</option>
                    <option value="yard">Materials Yard</option>
                    <option value="distribution_center">Distribution Hub</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Storage Capacity (Tonnes)</label>
                  <input
                    type="number"
                    value={totalCapacityTons}
                    onChange={(e) => setTotalCapacityTons(parseInt(e.target.value, 10) || 500)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Manager Name</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
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

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setEditingLocation(null)} className="px-4 py-2 font-semibold text-slate-600">
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

      {/* Delete / Decommission Confirmation Modal */}
      {deletingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-300 p-5 space-y-4 text-slate-900">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Decommission Facility</span>
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to decommission <strong>{deletingLocation.name}</strong> ({deletingLocation.code})? Historical transaction logs will preserve this facility reference.
            </p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setDeletingLocation(null)} className="px-3 py-1.5 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition"
              >
                Confirm Decommission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
