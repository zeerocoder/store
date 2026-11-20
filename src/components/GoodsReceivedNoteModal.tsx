import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  X,
  Truck,
  Building2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Package,
} from 'lucide-react';
import { Product, Location, Supplier, GoodsReceivedNote, GrnItem, StaffUser } from '../types';

interface GoodsReceivedNoteModalProps {
  products: Product[];
  locations: Location[];
  suppliers: Supplier[];
  currentUser: StaffUser;
  onClose: () => void;
  onSubmitGrn: (grnData: Omit<GoodsReceivedNote, 'id' | 'grnNumber'>) => void;
}

export const GoodsReceivedNoteModal: React.FC<GoodsReceivedNoteModalProps> = ({
  products,
  locations,
  suppliers,
  currentUser,
  onClose,
  onSubmitGrn,
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0]?.id || '');
  const [poRef, setPoRef] = useState<string>(`PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
  const [invoiceRef, setInvoiceRef] = useState<string>(`INV-${Date.now().toString().slice(-6)}`);
  const [haulageTransporter, setHaulageTransporter] = useState<string>('Dangote Dedicated Heavy Logistics / Third-Party Fleet');
  const [haulageCost, setHaulageCost] = useState<number>(350000);
  const [offloadingLevy, setOffloadingLevy] = useState<number>(50000);
  const [notes, setNotes] = useState<string>('Factory dispatch batch received with certified test sheets.');

  // Items table state
  const [selectedItems, setSelectedItems] = useState<
    Array<{
      productId: string;
      orderedQty: number;
      receivedQty: number;
      damagedQty: number;
      unitPurchaseCost: number;
    }>
  >([
    {
      productId: products[0]?.id || 'prod-001',
      orderedQty: 1000,
      receivedQty: 990,
      damagedQty: 10,
      unitPurchaseCost: products[0]?.costPrice || 8200,
    },
  ]);

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
  const selectedLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];

  // Calculate Landed Cost apportionment
  const { totalInvoiceAmount, totalLandedCost, processedItems } = useMemo(() => {
    let invoiceTotal = 0;
    let totalReceivedUnits = 0;

    selectedItems.forEach((item) => {
      invoiceTotal += item.receivedQty * item.unitPurchaseCost;
      totalReceivedUnits += item.receivedQty;
    });

    const totalOverhead = haulageCost + offloadingLevy;
    const landedTotal = invoiceTotal + totalOverhead;

    const items: GrnItem[] = selectedItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      // Apportion transport overhead by unit proportion
      const overheadPerUnit = totalReceivedUnits > 0 ? totalOverhead / totalReceivedUnits : 0;
      const landedUnit = item.unitPurchaseCost + overheadPerUnit;

      return {
        productId: item.productId,
        productName: prod?.name || 'Selected Material',
        orderedQty: item.orderedQty,
        receivedQty: item.receivedQty,
        damagedQty: item.damagedQty,
        unit: prod?.baseUnit || 'Unit',
        unitPurchaseCost: item.unitPurchaseCost,
        apportionedHaulageCost: Math.round(overheadPerUnit * 100) / 100,
        finalLandedUnitCost: Math.round(landedUnit * 100) / 100,
      };
    });

    return {
      totalInvoiceAmount: invoiceTotal,
      totalLandedCost: landedTotal,
      processedItems: items,
    };
  }, [selectedItems, haulageCost, offloadingLevy, products]);

  const handleAddItem = () => {
    const unselected = products.find((p) => !selectedItems.some((i) => i.productId === p.id)) || products[0];
    if (unselected) {
      setSelectedItems((prev) => [
        ...prev,
        {
          productId: unselected.id,
          orderedQty: 100,
          receivedQty: 100,
          damagedQty: 0,
          unitPurchaseCost: unselected.costPrice,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (selectedItems.length <= 1) return;
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: number | string) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === 'productId') {
          const prod = products.find((p) => p.id === value);
          return {
            ...item,
            productId: value as string,
            unitPurchaseCost: prod?.costPrice || item.unitPurchaseCost,
          };
        }
        return { ...item, [field]: Number(value) };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitGrn({
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      locationId: selectedLocation.id,
      locationName: selectedLocation.name,
      receivedDate: new Date().toISOString().split('T')[0],
      purchaseOrderRef: poRef,
      supplierInvoiceRef: invoiceRef,
      haulageTransporter,
      haulageCost,
      offloadingUnionLevy: offloadingLevy,
      items: processedItems,
      totalInvoiceAmount,
      totalLandedCost,
      inspectedBy: `${currentUser.name} (${currentUser.role})`,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Goods Received Note (GRN) & Landed Cost Engine
              </h3>
              <p className="text-xs text-slate-500">
                Inbound factory stock acceptance with haulage freight and union offloading cost apportionment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Supplier & Facility Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Manufacturer / Supplier
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 font-medium bg-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.categoriesSupplied.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Receiving Depot / Yard
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 font-medium bg-white"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Purchase Order Reference
              </label>
              <input
                type="text"
                value={poRef}
                onChange={(e) => setPoRef(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Supplier Invoice Number
              </label>
              <input
                type="text"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                required
              />
            </div>
          </div>

          {/* Haulage & Offloading Overheads */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>Inbound Haulage & Landing Overheads (Naira ₦)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-amber-900 block mb-1">
                  Transporter / Fleet
                </label>
                <input
                  type="text"
                  value={haulageTransporter}
                  onChange={(e) => setHaulageTransporter(e.target.value)}
                  className="w-full text-xs rounded-lg border border-amber-300 p-2 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-900 block mb-1">
                  Inter-State Haulage Freight (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={haulageCost}
                  onChange={(e) => setHaulageCost(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-amber-300 p-2 font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-900 block mb-1">
                  Offloading Union Levy & Labor (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="2000"
                  value={offloadingLevy}
                  onChange={(e) => setOffloadingLevy(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-amber-300 p-2 font-mono font-bold bg-white"
                />
              </div>
            </div>
          </div>

          {/* Materials Received Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-800">
                Inbound Cargo Lines & Discrepancy Inspection
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Cargo Line
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Product / Material</th>
                    <th className="py-2.5 px-2 text-right">Ordered</th>
                    <th className="py-2.5 px-2 text-right">Received</th>
                    <th className="py-2.5 px-2 text-right">Damaged</th>
                    <th className="py-2.5 px-3 text-right">Ex-Factory Unit Cost</th>
                    <th className="py-2.5 px-3 text-right font-bold text-emerald-800">Final Landed Cost</th>
                    <th className="py-2.5 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedItems.map((item, index) => {
                    const processed = processedItems[index];
                    return (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="py-2 px-3">
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            className="w-full text-xs rounded border border-slate-200 p-1 bg-white font-medium max-w-[180px]"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="1"
                            value={item.orderedQty}
                            onChange={(e) => handleItemChange(index, 'orderedQty', e.target.value)}
                            className="w-16 text-right font-mono text-xs border rounded p-1"
                          />
                        </td>

                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.receivedQty}
                            onChange={(e) => handleItemChange(index, 'receivedQty', e.target.value)}
                            className="w-16 text-right font-mono text-xs border rounded p-1 font-bold text-emerald-700"
                          />
                        </td>

                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.damagedQty}
                            onChange={(e) => handleItemChange(index, 'damagedQty', e.target.value)}
                            className="w-14 text-right font-mono text-xs border rounded p-1 text-red-600"
                          />
                        </td>

                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.unitPurchaseCost}
                            onChange={(e) => handleItemChange(index, 'unitPurchaseCost', e.target.value)}
                            className="w-24 text-right font-mono text-xs border rounded p-1"
                          />
                        </td>

                        <td className="py-2 px-3 text-right font-mono font-black text-emerald-700">
                          ₦{processed?.finalLandedUnitCost.toLocaleString()}
                          <span className="block text-[9px] text-slate-400 font-normal">
                            (+₦{processed?.apportionedHaulageCost.toFixed(0)} haulage)
                          </span>
                        </td>

                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={selectedItems.length <= 1}
                            className="text-slate-400 hover:text-red-600 transition disabled:opacity-30"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Landed Cost Financial Impact Summary */}
          <div className="bg-slate-900 text-white p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Invoice Material Base</span>
              <span className="font-mono text-base font-bold text-white">
                ₦{totalInvoiceAmount.toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-amber-400 uppercase block">Haulage & Offload Freight</span>
              <span className="font-mono text-base font-bold text-amber-400">
                ₦{(haulageCost + offloadingLevy).toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-emerald-400 uppercase block">Total Landed Investment</span>
              <span className="font-mono text-base font-black text-emerald-400">
                ₦{totalLandedCost.toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Stock Receiving Officer</span>
              <span className="font-bold text-slate-200">
                {currentUser.name}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Discrepancy Notes / Inspection Signoff
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 10 bags burst in transit due to rough road condition. Discrepancy logged for debit note."
              className="w-full text-xs rounded-lg border border-slate-300 p-2"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Accept Stock & Update Product Landed Costs</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
