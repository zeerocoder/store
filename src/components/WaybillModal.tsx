import React, { useState } from 'react';
import {
  FileText,
  Printer,
  X,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  User,
  Barcode,
  Building2,
  Layers,
  Scale,
} from 'lucide-react';
import { Waybill, GatePass } from '../types';
import { renderBarcodeSvgString } from '../utils/barcodeGenerator';

interface WaybillModalProps {
  waybill: Waybill;
  gatePass?: GatePass;
  onClose: () => void;
}

export const WaybillModal: React.FC<WaybillModalProps> = ({
  waybill,
  gatePass,
  onClose,
}) => {
  const [activeCopy, setActiveCopy] = useState<'white' | 'yellow' | 'blue' | 'gatepass'>('white');

  const barcodeSvg = renderBarcodeSvgString(waybill.waybillNumber, { height: 36, barWidth: 1.5 });
  const gatePassBarcodeSvg = gatePass ? renderBarcodeSvgString(gatePass.passNumber, { height: 30, barWidth: 1.5 }) : '';

  const copyLabels = {
    white: {
      name: 'Original White (Customer / Site Engineer Acceptance Copy)',
      badge: 'bg-slate-100 text-slate-800 border-slate-300',
      description: 'To be retained and signed by Site Engineer / Receiving Officer at destination.',
    },
    yellow: {
      name: 'Yellow Copy (Driver & Transporter Delivery Proof)',
      badge: 'bg-amber-50 text-amber-900 border-amber-300',
      description: 'To be signed upon safe discharge and returned to Elite Energy Central Logistics.',
    },
    blue: {
      name: 'Blue Copy (Security & Weighbridge Gate Archive)',
      badge: 'bg-blue-50 text-blue-900 border-blue-300',
      description: 'Retained by Warehouse Security Officer at exit gate inspection.',
    },
    gatepass: {
      name: 'Security Gate Clearance & Weighbridge Pass',
      badge: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      description: 'Official clearance pass required to exit the heavy materials yard.',
    },
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Commercial Logistics Documentation
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold">
                  {waybill.waybillNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Printable 3-part commercial waybill & security yard clearance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copy Selector Tabs */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setActiveCopy('white')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeCopy === 'white'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 inline-block" />
            <span>White Copy (Customer)</span>
          </button>

          <button
            onClick={() => setActiveCopy('yellow')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeCopy === 'yellow'
                ? 'bg-amber-100 text-amber-950 shadow-xs border border-amber-300'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 inline-block" />
            <span>Yellow Copy (Driver/Transporter)</span>
          </button>

          <button
            onClick={() => setActiveCopy('blue')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeCopy === 'blue'
                ? 'bg-blue-100 text-blue-950 shadow-xs border border-blue-300'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-700 inline-block" />
            <span>Blue Copy (Security Archive)</span>
          </button>

          {gatePass && (
            <button
              onClick={() => setActiveCopy('gatepass')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeCopy === 'gatepass'
                  ? 'bg-emerald-100 text-emerald-950 shadow-xs border border-emerald-300'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-emerald-700" />
              <span>Weighbridge Gate Pass</span>
            </button>
          )}
        </div>

        {/* Printable Sheet Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200 flex justify-center">
          {activeCopy !== 'gatepass' ? (
            /* 3-Part Commercial Waybill Sheet */
            <div
              className={`w-full max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-lg border text-slate-800 ${
                activeCopy === 'yellow'
                  ? 'bg-amber-50/70 border-amber-300'
                  : activeCopy === 'blue'
                  ? 'bg-blue-50/70 border-blue-300'
                  : 'bg-white border-slate-300'
              }`}
            >
              {/* Copy Watermark / Badge */}
              <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-black tracking-tight text-slate-900">
                      ELITE ENERGY TECHNOLOGY
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-slate-900 text-amber-400">
                      LTD
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Corporate Logistics Division · Heavy Building Materials & Bulk Supply
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    RC: 1849204 · Lagos Central Yards · Phone: +234 1 295 4401
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-900">
                    OFFICIAL COMMERCIAL WAYBILL
                  </div>
                  <div className="font-mono text-sm font-black text-sky-800">
                    {waybill.waybillNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-1">
                    Order Ref: <span className="font-mono font-bold text-slate-700">{waybill.saleOrOrderId}</span>
                  </div>
                </div>
              </div>

              {/* Copy Designation Strip */}
              <div className={`mt-2 py-1 px-3 rounded-md text-[11px] font-bold border text-center ${copyLabels[activeCopy].badge}`}>
                {copyLabels[activeCopy].name}
              </div>

              {/* Waybill Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 p-3 bg-white/80 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Dispatch Depot</span>
                  <span className="font-bold text-slate-900">{waybill.dispatchLocationName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Date & Time</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {new Date(waybill.dispatchTimestamp).toLocaleDateString()} · {new Date(waybill.dispatchTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Transporter / Fleet</span>
                  <span className="font-bold text-slate-900">{waybill.transporterCompany}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Vehicle Reg Plate</span>
                  <span className="font-mono font-black text-slate-900 bg-amber-100 px-1.5 py-0.5 rounded-sm">
                    {waybill.vehiclePlateNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Assigned Driver</span>
                  <span className="font-bold text-slate-900">{waybill.driverName}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">{waybill.driverPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Certified Cargo</span>
                  <span className="font-bold text-slate-900 font-mono text-emerald-700">
                    {waybill.totalWeightTons} Metric Tonnes
                  </span>
                </div>
              </div>

              {/* Destination & Customer Info */}
              <div className="p-3 bg-white/80 rounded-lg border border-slate-200 text-xs mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Consignee / Client Name</span>
                    <span className="font-bold text-slate-900">{waybill.customerName}</span>
                    <span className="text-[11px] text-slate-500 font-mono block">{waybill.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Site Delivery Address</span>
                    <span className="font-medium text-slate-800">{waybill.deliveryAddress}</span>
                  </div>
                </div>
              </div>

              {/* Material Cargo Manifest Table */}
              <table className="w-full text-xs text-left border border-slate-200 bg-white rounded-lg overflow-hidden mb-4">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase font-bold">
                    <th className="py-2 px-3">Item #</th>
                    <th className="py-2 px-3">Material Description</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3 text-right">Quantity</th>
                    <th className="py-2 px-3">Unit</th>
                    <th className="py-2 px-3 text-right">Weight (Tons)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {waybill.items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-400 font-mono">{index + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{item.productName}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{item.sku}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{item.quantity.toLocaleString()}</td>
                      <td className="py-2 px-3 text-slate-600">{item.unit}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{item.weightTons}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t border-slate-300">
                    <td colSpan={3} className="py-2 px-3 text-right uppercase text-[10px] text-slate-600">
                      Total Manifest Payload Weight:
                    </td>
                    <td colSpan={3} className="py-2 px-3 text-right font-mono text-emerald-800 font-black">
                      {waybill.totalWeightTons} Tonnes
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Notes */}
              {waybill.notes && (
                <div className="text-[11px] text-slate-600 italic mb-4 p-2 bg-amber-50/50 rounded border border-amber-200">
                  <span className="font-bold text-amber-900 not-italic">Logistics Directives: </span>
                  {waybill.notes}
                </div>
              )}

              {/* 3-Part Commercial Signatures Grid */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t-2 border-slate-300 text-[10px]">
                <div className="border border-slate-200 p-2 rounded bg-white">
                  <span className="font-bold uppercase text-slate-500 block mb-3">1. Yard Dispatcher</span>
                  <div className="font-bold text-slate-900">{waybill.dispatchedBy}</div>
                  <div className="text-slate-400 text-[9px] mt-3 pt-1 border-t border-dashed border-slate-300">
                    Sign & Stamp / Date
                  </div>
                </div>

                <div className="border border-slate-200 p-2 rounded bg-white">
                  <span className="font-bold uppercase text-slate-500 block mb-3">2. Transporter / Driver</span>
                  <div className="font-bold text-slate-900">{waybill.driverName}</div>
                  <div className="text-slate-400 text-[9px] mt-3 pt-1 border-t border-dashed border-slate-300">
                    Driver Signature / Date
                  </div>
                </div>

                <div className="border border-slate-200 p-2 rounded bg-white">
                  <span className="font-bold uppercase text-slate-500 block mb-3">3. Site Receiving Engineer</span>
                  <div className="font-bold text-slate-900">Name: _________________</div>
                  <div className="text-slate-400 text-[9px] mt-3 pt-1 border-t border-dashed border-slate-300">
                    Received In Good Order / Date
                  </div>
                </div>
              </div>

              {/* Barcode Footer */}
              <div className="mt-4 pt-2 flex items-center justify-between border-t border-slate-200">
                <div className="text-[9px] text-slate-400">
                  Official Document of Elite Energy Technology Ltd. Security tampering is a punishable offence.
                </div>
                <div
                  className="w-40 h-8 flex items-center justify-end"
                  dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                />
              </div>
            </div>
          ) : (
            /* Weighbridge Security Gate Pass Sheet */
            gatePass && (
              <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-lg border-2 border-emerald-500 text-slate-800">
                <div className="flex justify-between items-start pb-3 border-b-2 border-emerald-600">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black tracking-tight text-slate-900">
                        ELITE ENERGY TECHNOLOGY
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-700 text-white">
                        GATE PASS
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Security Gate Clearance & Weighbridge Payload Certificate
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-black text-emerald-800">{gatePass.passNumber}</div>
                    <div className="text-[9px] text-slate-400 font-mono">Waybill: {gatePass.waybillNumber}</div>
                  </div>
                </div>

                <div className="my-3 p-3 bg-emerald-50/70 rounded-lg border border-emerald-200 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-900 block">Vehicle Registration</span>
                      <span className="font-mono text-sm font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-300 inline-block">
                        {gatePass.vehiclePlateNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-900 block">Driver Name & Phone</span>
                      <span className="font-bold text-slate-900">{gatePass.driverName}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{gatePass.driverPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Weighbridge Readings */}
                <div className="bg-slate-900 text-white p-3 rounded-lg my-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center justify-between">
                    <span>Automated Weighbridge Load Cell Readings</span>
                    <span className="text-emerald-400 font-mono">CALIBRATED</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-slate-800 rounded">
                      <div className="text-[9px] text-slate-400 uppercase">Gross Weight</div>
                      <div className="font-mono text-sm font-black text-white">{gatePass.weighbridgeGrossTons} T</div>
                    </div>
                    <div className="p-2 bg-slate-800 rounded">
                      <div className="text-[9px] text-slate-400 uppercase">Tare (Empty Truck)</div>
                      <div className="font-mono text-sm font-black text-slate-300">{gatePass.weighbridgeTareTons} T</div>
                    </div>
                    <div className="p-2 bg-emerald-900/60 rounded border border-emerald-500">
                      <div className="text-[9px] text-emerald-300 uppercase font-bold">Net Material</div>
                      <div className="font-mono text-sm font-black text-emerald-400">{gatePass.netPayloadTons} T</div>
                    </div>
                  </div>
                </div>

                {/* Gate Inspection & Signoff */}
                <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-medium">Cargo Summary:</span>
                    <span className="font-bold text-slate-900 text-right">{gatePass.cargoSummary}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-medium">Time In / Out:</span>
                    <span className="font-mono font-bold text-slate-900">{gatePass.timeIn} ➔ {gatePass.timeOut}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-medium">Physical Gate Check:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PASSED & VERIFIED
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-slate-100">
                    <span className="font-medium">Security Officer on Duty:</span>
                    <span className="font-bold text-slate-900">{gatePass.securityOfficer}</span>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between border-t border-slate-200">
                  <div className="text-[9px] text-slate-400">
                    Valid only on departure date. Hand over to gate sentry upon barrier exit.
                  </div>
                  <div
                    className="w-32 h-6 flex items-center justify-end"
                    dangerouslySetInnerHTML={{ __html: gatePassBarcodeSvg }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
