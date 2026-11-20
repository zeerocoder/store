import React, { useState } from 'react';
import {
  Layers,
  Search,
  Building2,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Edit3,
  X,
  Plus,
} from 'lucide-react';
import { Product, Location, StaffUser } from '../types';

interface InventoryViewProps {
  products: Product[];
  locations: Location[];
  activeLocationId: string;
  currentUser: StaffUser;
  onAdjustStock: (productId: string, locationId: string, newQuantity: number, reason: string) => void;
  onNavigateToTransfer: (productId: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  locations,
  activeLocationId,
  currentUser,
  onAdjustStock,
  onNavigateToTransfer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>(activeLocationId);
  const [adjustingProduct, setAdjustingProduct] = useState<{ product: Product; locationId: string } | null>(null);
  const [newCountQty, setNewCountQty] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [adjustmentMessage, setAdjustmentMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const openAdjustModal = (product: Product, locId: string) => {
    const current = product.locationStock[locId]?.onHand || 0;
    setNewCountQty(current);
    setAdjustmentReason('Physical Stock Audit Count');
    setAdjustmentMessage(null);
    setAdjustingProduct({ product, locationId: locId });
  };

  const handleSaveAdjustment = () => {
    if (!adjustingProduct) return;
    try {
      onAdjustStock(
        adjustingProduct.product.id,
        adjustingProduct.locationId,
        newCountQty,
        adjustmentReason || 'Routine Stock Reconciliation'
      );
      setAdjustmentMessage({ type: 'success', text: 'Stock balance successfully reconciled.' });
      setTimeout(() => setAdjustingProduct(null), 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Stock adjustment failed';
      setAdjustmentMessage({ type: 'error', text: msg });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            <span>Warehouse & Yard Balances</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Multi-Location Inventory Balances & Physical Stock Counts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock on hand, bin storage coordinates, and discrepancy write-off authorization controls.
          </p>
        </div>

        {/* Location selector */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <select
            value={selectedLocationFilter}
            onChange={(e) => setSelectedLocationFilter(e.target.value)}
            className="p-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
          >
            <option value="all">All Locations (Consolidated Matrix)</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter inventory by material name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
          />
        </div>
      </div>

      {/* Stock Matrix Table & Mobile Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile Inventory Cards (<md) */}
        <div className="md:hidden divide-y divide-slate-100 p-2 space-y-3">
          {filtered.map((prod) => {
            const totalStock = Object.values(prod.locationStock).reduce((acc, loc) => acc + loc.onHand, 0);
            const isCritical = totalStock <= prod.minStockAlert;

            return (
              <div key={prod.id} className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{prod.name}</h3>
                    <div className="text-[11px] font-mono text-sky-700">{prod.sku} · {prod.baseUnit}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isCritical
                        ? 'bg-amber-50 text-amber-700 border-amber-300 font-extrabold'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    }`}
                  >
                    {isCritical ? `Low: ${totalStock} ${prod.baseUnit}` : `${totalStock} in stock`}
                  </span>
                </div>

                {/* Location Stock Matrix on Mobile */}
                {selectedLocationFilter === 'all' ? (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Stock by Branch Outlet</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      {locations.map((loc) => {
                        const stock = prod.locationStock[loc.id]?.onHand || 0;
                        return (
                          <div key={loc.id} className="flex items-center justify-between p-1.5 rounded-md bg-slate-50 border border-slate-100">
                            <span className="text-slate-600 font-sans font-medium text-[11px]">{loc.code}:</span>
                            <span className={`font-bold tabular-nums ${stock === 0 ? 'text-red-500' : 'text-slate-900'}`}>
                              {stock.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">On Hand</span>
                      <span className="font-bold font-mono text-slate-900 text-sm">
                        {(prod.locationStock[selectedLocationFilter]?.onHand || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-600 font-bold uppercase block">Reserved</span>
                      <span className="font-mono text-amber-700 font-semibold">
                        {(prod.locationStock[selectedLocationFilter]?.reserved || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Storage Bin</span>
                      <span className="font-mono text-slate-700 truncate block">
                        {prod.locationStock[selectedLocationFilter]?.binLocation || 'General Yard'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Mobile Action Buttons (min-h-[44px]) */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => openAdjustModal(prod, selectedLocationFilter === 'all' ? 'loc-ikeja' : selectedLocationFilter)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold min-h-[44px]"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Adjust Count</span>
                  </button>
                  <button
                    onClick={() => onNavigateToTransfer(prod.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold min-h-[44px]"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Transfer</span>
                  </button>
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
                <th className="py-3 px-4">Material & SKU</th>
                <th className="py-3 px-3">Unit</th>
                {selectedLocationFilter === 'all' ? (
                  locations.map((loc) => (
                    <th key={loc.id} className="py-3 px-3 text-right font-mono">
                      {loc.code} Stock
                    </th>
                  ))
                ) : (
                  <>
                    <th className="py-3 px-3 text-right font-mono">On Hand</th>
                    <th className="py-3 px-3 text-right font-mono">Reserved</th>
                    <th className="py-3 px-3">Storage Bin</th>
                  </>
                )}
                <th className="py-3 px-4 text-right font-mono">Total Company Stock</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((prod) => {
                const totalStock = Object.values(prod.locationStock).reduce((acc, loc) => acc + loc.onHand, 0);
                const isCritical = totalStock <= prod.minStockAlert;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="text-[11px] font-mono text-sky-700">{prod.sku}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">{prod.baseUnit}</td>

                    {selectedLocationFilter === 'all' ? (
                      locations.map((loc) => {
                        const stock = prod.locationStock[loc.id]?.onHand || 0;
                        return (
                          <td key={loc.id} className="py-3.5 px-3 text-right font-mono tabular-nums">
                            <span className={stock === 0 ? 'text-red-500 font-semibold' : 'text-slate-800'}>
                              {stock.toLocaleString()}
                            </span>
                          </td>
                        );
                      })
                    ) : (
                      <>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {(prod.locationStock[selectedLocationFilter]?.onHand || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-amber-700 tabular-nums">
                          {(prod.locationStock[selectedLocationFilter]?.reserved || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-600">
                          {prod.locationStock[selectedLocationFilter]?.binLocation || 'General Yard'}
                        </td>
                      </>
                    )}

                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                      <span className={isCritical ? 'text-amber-600 font-extrabold' : 'text-slate-900'}>
                        {totalStock.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openAdjustModal(prod, selectedLocationFilter === 'all' ? 'loc-ikeja' : selectedLocationFilter)}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition flex items-center gap-1"
                          title="Record physical stock count or write-off"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Adjust</span>
                        </button>
                        <button
                          onClick={() => onNavigateToTransfer(prod.id)}
                          className="px-2.5 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-[11px] transition"
                        >
                          Transfer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] text-sky-400 font-mono">{adjustingProduct.product.sku}</span>
                <h3 className="text-sm font-bold">Adjust Physical Stock Count</h3>
              </div>
              <button onClick={() => setAdjustingProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs flex-1 overflow-y-auto">
              <div>
                <div className="font-bold text-slate-900">{adjustingProduct.product.name}</div>
                <div className="text-[11px] text-slate-500">
                  Location: {locations.find((l) => l.id === adjustingProduct.locationId)?.name}
                </div>
              </div>

              {adjustmentMessage && (
                <div
                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                    adjustmentMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}
                >
                  {adjustmentMessage.text}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">New Verified Physical Count</label>
                <input
                  type="number"
                  min="0"
                  value={newCountQty}
                  onChange={(e) => setNewCountQty(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-base font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Justification Reason</label>
                <input
                  type="text"
                  placeholder="e.g. End-of-month cycle count / Damaged bags write-off"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-[11px] border border-amber-200">
                Notice: If the financial value of write-offs or discrepancies exceeds ₦50,000, an authorization ticket will automatically be routed to the Owner / General Manager.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button onClick={() => setAdjustingProduct(null)} className="px-4 py-2 text-xs font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleSaveAdjustment}
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
