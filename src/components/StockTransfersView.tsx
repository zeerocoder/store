import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  X,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { StockTransfer, Location, Product, StaffUser } from '../types';

interface StockTransfersViewProps {
  transfers: StockTransfer[];
  locations: Location[];
  products: Product[];
  currentUser: StaffUser;
  onRequestTransfer: (sourceId: string, destId: string, items: Array<{ productId: string; requestedQty: number }>) => StockTransfer;
  onApproveTransfer: (transferId: string) => void;
  onDispatchTransfer: (transferId: string, driverName: string, vehiclePlate: string) => void;
  onReceiveTransfer: (transferId: string, receivedItems: Record<string, number>, discrepancyNotes?: string) => void;
}

export const StockTransfersView: React.FC<StockTransfersViewProps> = ({
  transfers,
  locations,
  products,
  currentUser,
  onRequestTransfer,
  onApproveTransfer,
  onDispatchTransfer,
  onReceiveTransfer,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState<StockTransfer | null>(null);
  const [showReceiveModal, setShowReceiveModal] = useState<StockTransfer | null>(null);

  // New transfer form state
  const [sourceLocId, setSourceLocId] = useState<string>('loc-ikeja');
  const [destLocId, setDestLocId] = useState<string>('loc-vi');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [requestQty, setRequestQty] = useState<number>(50);

  // Dispatch form state
  const [driverName, setDriverName] = useState<string>('Samuel Umeh');
  const [vehiclePlate, setVehiclePlate] = useState<string>('KJA-812-BD (Flatbed 30T)');

  // Receive form state
  const [receivedCounts, setReceivedCounts] = useState<Record<string, number>>({});
  const [discrepancyNotes, setDiscrepancyNotes] = useState<string>('');

  const canApprove = ['owner', 'general_manager', 'branch_manager'].includes(currentUser.role);

  const handleCreateRequest = () => {
    if (sourceLocId === destLocId) {
      alert('Source and destination locations cannot be the same.');
      return;
    }
    onRequestTransfer(sourceLocId, destLocId, [{ productId: selectedProductId, requestedQty: requestQty }]);
    setShowRequestModal(false);
  };

  const handleDispatch = () => {
    if (!showDispatchModal) return;
    onDispatchTransfer(showDispatchModal.id, driverName, vehiclePlate);
    setShowDispatchModal(null);
  };

  const openReceiveModal = (t: StockTransfer) => {
    const initial: Record<string, number> = {};
    t.items.forEach((it) => {
      initial[it.productId] = it.dispatchedQty || it.requestedQty;
    });
    setReceivedCounts(initial);
    setDiscrepancyNotes('');
    setShowReceiveModal(t);
  };

  const handleConfirmReceive = () => {
    if (!showReceiveModal) return;
    onReceiveTransfer(showReceiveModal.id, receivedCounts, discrepancyNotes);
    setShowReceiveModal(null);
  };

  const statusBadges: Record<StockTransfer['status'], { label: string; color: string }> = {
    requested: { label: 'Pending Approval', color: 'bg-amber-50 text-amber-700 border-amber-300' },
    approved: { label: 'Approved (Awaiting Dispatch)', color: 'bg-sky-50 text-sky-700 border-sky-300' },
    dispatched: { label: 'Dispatched', color: 'bg-indigo-50 text-indigo-700 border-indigo-300' },
    in_transit: { label: 'In Transit', color: 'bg-indigo-50 text-indigo-700 border-indigo-300 animate-pulse' },
    received: { label: 'Received & Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    rejected: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-300' },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <ArrowRightLeft className="w-3.5 h-3.5 text-sky-600" />
            <span>Inter-Branch Logistics</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Company Stock Transfer & Movement Architecture
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict multi-stage workflow: Requested → Approved → Dispatched → In Transit → Received. Prevents silent inventory leakage.
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Transfer Request</span>
        </button>
      </div>

      {/* Transfer Pipeline Guide */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col">
          <span className="text-[10px] text-slate-400 font-mono">STEP 1</span>
          <span className="font-bold text-slate-800 mt-1">1. Requested</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Branch officer submits list</span>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col">
          <span className="text-[10px] text-slate-400 font-mono">STEP 2</span>
          <span className="font-bold text-slate-800 mt-1">2. Approved</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Senior management audit</span>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col">
          <span className="text-[10px] text-slate-400 font-mono">STEP 3</span>
          <span className="font-bold text-slate-800 mt-1">3. Dispatched</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Deducted from warehouse</span>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col">
          <span className="text-[10px] text-slate-400 font-mono">STEP 4</span>
          <span className="font-bold text-slate-800 mt-1">4. In Transit</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Assigned to truck & driver</span>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col col-span-2 md:col-span-1">
          <span className="text-[10px] text-slate-400 font-mono">STEP 5</span>
          <span className="font-bold text-emerald-700 mt-1">5. Received</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Stock credited at destination</span>
        </div>
      </div>

      {/* Transfer Orders Table & Mobile Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Active & Historical Transfer Consignments</h3>
          <span className="text-xs text-slate-500 font-mono">{transfers.length} records</span>
        </div>

        {/* Mobile Cards (<md) */}
        <div className="md:hidden divide-y divide-slate-100 p-2 space-y-3">
          {transfers.map((t) => {
            const source = locations.find((l) => l.id === t.sourceLocationId);
            const dest = locations.find((l) => l.id === t.destinationLocationId);
            const badge = statusBadges[t.status] || { label: t.status, color: 'bg-slate-100 text-slate-600' };

            return (
              <div key={t.id} className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-sky-700 text-xs block">{t.transferNumber}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full border font-semibold ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Route */}
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Route</div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                    <span>{source?.name.replace(' Central', '')}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-sky-700">{dest?.name.replace(' Central', '')}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Requested by: {t.requestedByName}</div>
                </div>

                {/* Items */}
                <div className="space-y-1 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Materials in Transit</div>
                  {t.items.map((it, idx) => (
                    <div key={idx} className="font-medium text-slate-800 bg-white px-2 py-1 rounded border border-slate-200/60">
                      <strong>{it.requestedQty} {it.unit}</strong> · {it.productName}
                    </div>
                  ))}
                </div>

                {/* Driver */}
                {t.driverName && (
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t.driverName} ({t.vehiclePlate})</span>
                  </div>
                )}

                {/* Action Buttons (min-h-[44px]) */}
                <div>
                  {t.status === 'requested' && canApprove && (
                    <button
                      onClick={() => onApproveTransfer(t.id)}
                      className="w-full py-2.5 px-3 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition min-h-[44px] flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Consignment</span>
                    </button>
                  )}

                  {t.status === 'approved' && (
                    <button
                      onClick={() => setShowDispatchModal(t)}
                      className="w-full py-2.5 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition min-h-[44px] flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Assign Truck & Dispatch</span>
                    </button>
                  )}

                  {(t.status === 'dispatched' || t.status === 'in_transit') && (
                    <button
                      onClick={() => openReceiveModal(t)}
                      className="w-full py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition min-h-[44px] flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Receive & Verify Inbound Stock</span>
                    </button>
                  )}

                  {t.status === 'completed' && (
                    <div className="text-center py-2 text-emerald-700 font-semibold text-xs flex items-center justify-center gap-1 bg-emerald-50 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Stock Verified & Credited</span>
                    </div>
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
                <th className="py-3 px-4 font-mono">Consignment #</th>
                <th className="py-3 px-3">Route (Origin → Destination)</th>
                <th className="py-3 px-3">Items & Quantity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Logistics & Driver</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transfers.map((t) => {
                const source = locations.find((l) => l.id === t.sourceLocationId);
                const dest = locations.find((l) => l.id === t.destinationLocationId);
                const badge = statusBadges[t.status] || { label: t.status, color: 'bg-slate-100 text-slate-600' };

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      <div>{t.transferNumber}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{new Date(t.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{source?.name.replace(' Central', '')}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-sky-700">{dest?.name.replace(' Central', '')}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Req by: {t.requestedByName}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        {t.items.map((it, idx) => (
                          <div key={idx} className="font-medium text-slate-800">
                            {it.requestedQty} {it.unit} · {it.productName}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 text-[11px] rounded-full border font-semibold inline-block ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {t.driverName ? (
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-slate-500" />
                            <span>{t.driverName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{t.vehiclePlate}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Approve button */}
                        {t.status === 'requested' && canApprove && (
                          <button
                            onClick={() => onApproveTransfer(t.id)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-md transition"
                          >
                            Approve
                          </button>
                        )}

                        {/* Dispatch button */}
                        {t.status === 'approved' && (
                          <button
                            onClick={() => setShowDispatchModal(t)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Dispatch</span>
                          </button>
                        )}

                        {/* Receive button */}
                        {(t.status === 'dispatched' || t.status === 'in_transit') && (
                          <button
                            onClick={() => openReceiveModal(t)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Receive & Verify</span>
                          </button>
                        )}

                        {t.status === 'completed' && (
                          <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
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

      {/* New Transfer Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-sky-400" />
                <span>Create Inter-Branch Transfer Request</span>
              </h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Source Origin</label>
                  <select
                    value={sourceLocId}
                    onChange={(e) => setSourceLocId(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Destination Branch</label>
                  <select
                    value={destLocId}
                    onChange={(e) => setDestLocId(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Select Material / SKU</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-medium"
                >
                  {products.map((p) => {
                    const srcStock = p.locationStock[sourceLocId]?.onHand || 0;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Available at source: {srcStock} {p.baseUnit}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={requestQty}
                  onChange={(e) => setRequestQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-sm font-bold"
                />
              </div>

              <div className="p-3 bg-sky-50 rounded-lg text-sky-800 text-[11px] border border-sky-200">
                Notice: Submitting this request creates an audit consignment. Stock will remain in the source warehouse until authorized and dispatched by the warehouse logistics officer.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequest}
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>Dispatch Transfer: {showDispatchModal.transferNumber}</span>
              </h3>
              <button onClick={() => setShowDispatchModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs flex-1 overflow-y-auto">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Assign Driver Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Vehicle & Plate Number</label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-[11px] border border-amber-200">
                Warning: Dispatching will immediately deduct the items from the source location stock and place the consignment in transit status.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowDispatchModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatch}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive & Verify Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verify Goods Receiving: {showReceiveModal.transferNumber}</span>
              </h3>
              <button onClick={() => setShowReceiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs flex-1 overflow-y-auto">
              <p className="text-slate-600">
                Confirm actual physical count received at destination. Any damaged or missing items will be permanently logged in the audit trail.
              </p>

              <div className="space-y-3">
                {showReceiveModal.items.map((it) => (
                  <div key={it.productId} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{it.productName}</div>
                      <div className="text-[11px] text-slate-500">
                        Dispatched: {it.dispatchedQty || it.requestedQty} {it.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Received:</label>
                      <input
                        type="number"
                        min="0"
                        value={receivedCounts[it.productId] ?? (it.dispatchedQty || it.requestedQty)}
                        onChange={(e) =>
                          setReceivedCounts({
                            ...receivedCounts,
                            [it.productId]: Math.max(0, parseInt(e.target.value, 10) || 0),
                          })
                        }
                        className="w-24 p-1.5 text-right font-mono font-bold border border-slate-300 rounded-md bg-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Discrepancy / Inspection Notes (Optional)</label>
                <textarea
                  placeholder="Record condition of packaging, broken blocks, torn cement bags, or driver notes..."
                  value={discrepancyNotes}
                  onChange={(e) => setDiscrepancyNotes(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  rows={2}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button onClick={() => setShowReceiveModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleConfirmReceive}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition"
              >
                Confirm Receipt & Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
