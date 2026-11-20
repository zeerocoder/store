import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  User,
  Phone,
  FileCheck,
  AlertCircle,
  Plus,
  Printer,
  FileText,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { DeliveryVehicle, DeliveryRun, StaffUser, Waybill, GatePass } from '../types';
import { WaybillModal } from './WaybillModal';

interface DeliveriesViewProps {
  vehicles: DeliveryVehicle[];
  currentUser: StaffUser;
  waybills?: Waybill[];
  gatePasses?: GatePass[];
}

export const DeliveriesView: React.FC<DeliveriesViewProps> = ({
  vehicles,
  currentUser,
  waybills = [],
  gatePasses = [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'runs' | 'waybills'>('runs');
  const [selectedWaybillForModal, setSelectedWaybillForModal] = useState<Waybill | null>(null);

  const [runs, setRuns] = useState<DeliveryRun[]>([
    {
      id: 'run-001',
      runNumber: 'RUN-2026-0881',
      vehicleId: 'veh-001',
      driverName: 'Sunday Adele',
      destinationAddress: 'Plot 12, Eko Atlantic City Marina, Victoria Island',
      orderOrSaleRef: 'EET-REC-89201',
      cargoDescription: '100 Bags Dangote Cement 42.5R + 50 Lengths TMT Rebar 12mm',
      weightTons: 6.2,
      dispatchTime: '2026-11-19T08:15:00Z',
      status: 'in_transit',
    },
    {
      id: 'run-002',
      runNumber: 'RUN-2026-0882',
      vehicleId: 'veh-003',
      driverName: 'Mustapha Garba',
      destinationAddress: 'KM 24 Lekki-Epe Expressway, Chevron Roundabout Site',
      orderOrSaleRef: 'EET-REC-89202',
      cargoDescription: '2 x 20-Tonne Tipper Granite 3/4" + 2 x 20-Tonne Washed Sand',
      weightTons: 80.0,
      dispatchTime: '2026-11-19T09:30:00Z',
      status: 'in_transit',
    },
    {
      id: 'run-003',
      runNumber: 'RUN-2026-0880',
      vehicleId: 'veh-002',
      driverName: 'Samuel Umeh',
      destinationAddress: 'Admiralty Way, Lekki Phase 1 Residential Project',
      orderOrSaleRef: 'EET-ORD-5541',
      cargoDescription: '80 Bags Dangote Cement + 25 Boxes Porcelain Floor Tiles',
      weightTons: 4.8,
      dispatchTime: '2026-11-18T14:00:00Z',
      deliveredTime: '2026-11-18T16:20:00Z',
      status: 'delivered',
      proofNotes: 'Signed off on-site by Site Foreman Engr. Kingsley. Offloaded without breakage.',
    },
  ]);

  const [confirmingRun, setConfirmingRun] = useState<DeliveryRun | null>(null);
  const [podNotes, setPodNotes] = useState('');

  const handleConfirmDelivery = () => {
    if (!confirmingRun) return;
    setRuns((prev) =>
      prev.map((r) =>
        r.id === confirmingRun.id
          ? {
              ...r,
              status: 'delivered',
              deliveredTime: new Date().toISOString(),
              proofNotes: podNotes || 'Delivery confirmed and offloaded at destination site.',
            }
          : r
      )
    );
    setConfirmingRun(null);
    setPodNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            <span>Heavy Logistics & Fleet Dispatch</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Fleet Operations, Site Delivery & Proof of Delivery
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Heavy building materials transport management: Tippers, Flatbeds, and delivery trucks with digital POD sign-off.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('runs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            activeSubTab === 'runs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Active Dispatch Runs & Fleet ({runs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('waybills')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            activeSubTab === 'waybills'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3-Part Commercial Waybills & Gate Passes ({waybills.length})</span>
        </button>
      </div>

      {activeSubTab === 'runs' ? (
        <>
          {/* Fleet Vehicles Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {vehicles.map((veh) => (
              <div key={veh.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-700">{veh.vehicleNumber}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      veh.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-300'
                    }`}
                  >
                    {veh.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">{veh.model}</div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Driver: {veh.assignedDriver}</span>
                  <span className="font-mono font-semibold">{veh.capacityTons}T Cap</span>
                </div>
              </div>
            ))}
          </div>

          {/* Active Delivery Consignments */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Active Site Dispatch Runs</h3>
              <span className="text-xs text-slate-500 font-mono">{runs.length} runs</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {runs.map((r) => (
                <div key={r.id} className="p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-700 text-xs">{r.runNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Ref: {r.orderOrSaleRef}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                          r.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-300 animate-pulse'
                        }`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm">{r.cargoDescription}</div>

                    <div className="text-slate-600 flex items-center gap-1.5 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{r.destinationAddress}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-4 pt-0.5">
                      <span>Driver: <strong className="text-slate-800">{r.driverName}</strong></span>
                      <span>Dispatched: {new Date(r.dispatchTime).toLocaleTimeString()}</span>
                      <span>Payload: <strong className="font-mono text-slate-800">{r.weightTons} Tonnes</strong></span>
                    </div>

                    {r.proofNotes && (
                      <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        POD Note: {r.proofNotes}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 flex items-center gap-2">
                    {r.status === 'in_transit' && (
                      <button
                        onClick={() => setConfirmingRun(r)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Record Proof of Delivery</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Waybills & Security Gate Passes Archive */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Official 3-Part Commercial Waybill & Security Yard Clearance Archive
              </h3>
              <p className="text-xs text-slate-500">
                Print White (Customer), Yellow (Driver/Transporter), and Blue (Security Gate) copies
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Waybill Number</th>
                  <th className="py-3 px-3">Destination & Client</th>
                  <th className="py-3 px-3">Vehicle & Driver</th>
                  <th className="py-3 px-3">Manifest Summary</th>
                  <th className="py-3 px-3 text-right">Payload (Tons)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {waybills.map((wb) => {
                  const gp = gatePasses.find((g) => g.waybillNumber === wb.waybillNumber);
                  return (
                    <tr key={wb.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-sky-800 text-xs">{wb.waybillNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Ref: {wb.saleOrOrderId}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{wb.customerName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{wb.deliveryAddress}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-slate-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block text-[11px]">
                          {wb.vehiclePlateNumber}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{wb.driverName}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-slate-800 text-[11px]">
                          {wb.items.map((it) => `${it.quantity} ${it.unit} ${it.productName}`).join(' · ')}
                        </div>
                        <div className="text-[10px] text-slate-400">Depot: {wb.dispatchLocationName}</div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-700">
                        {wb.totalWeightTons} T
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {wb.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedWaybillForModal(wb)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition flex items-center gap-1.5 ml-auto shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span>Print 3-Part Waybill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Waybill & Gate Pass Modal */}
      {selectedWaybillForModal && (
        <WaybillModal
          waybill={selectedWaybillForModal}
          gatePass={gatePasses.find((gp) => gp.waybillNumber === selectedWaybillForModal.waybillNumber)}
          onClose={() => setSelectedWaybillForModal(null)}
        />
      )}

      {/* POD Modal */}
      {confirmingRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Confirm Proof of Delivery (POD)</span>
              </h3>
              <button onClick={() => setConfirmingRun(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-900">Run: {confirmingRun.runNumber}</span>
                <p className="text-slate-600 mt-0.5">{confirmingRun.destinationAddress}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Site Engineer / Receiver Sign-off Notes</label>
                <textarea
                  placeholder="Record recipient name, time of offloading, visual condition of cement/steel/tiles..."
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  rows={3}
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-[11px] border border-emerald-200">
                Signing off this POD marks the delivery run completed and synchronizes with customer order tracking.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button onClick={() => setConfirmingRun(null)} className="px-4 py-2 text-xs font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleConfirmDelivery}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition"
              >
                Confirm POD & Close Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
