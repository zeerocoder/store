import React, { useState } from 'react';
import {
  Barcode,
  Printer,
  Download,
  Search,
  Tag,
  Copy,
  CheckCircle2,
  Sliders,
  QrCode,
} from 'lucide-react';
import { Product } from '../types';
import { generateBarcodeSvg, generateQrMatrix } from '../utils/barcodeGenerator';

interface BarcodeCentreViewProps {
  products: Product[];
  initialProductId?: string;
}

export const BarcodeCentreView: React.FC<BarcodeCentreViewProps> = ({
  products,
  initialProductId,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || products[0]?.id || ''
  );
  const [barcodeFormat, setBarcodeFormat] = useState<'code128' | 'qr'>('code128');
  const [labelSize, setLabelSize] = useState<'58mm' | '80mm' | 'shelf'>('58mm');
  const [printCopies, setPrintCopies] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const barcodeData = selectedProduct ? generateBarcodeSvg(selectedProduct.barcode, { height: 50, barWidth: 1.8 }) : null;
  const qrMatrix = selectedProduct ? generateQrMatrix(`https://eliteenergytech.ng/verify/${selectedProduct.sku}`) : null;

  const handleCopyBarcode = () => {
    if (!selectedProduct) return;
    navigator.clipboard.writeText(selectedProduct.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Barcode className="w-3.5 h-3.5 text-sky-600" />
            <span>Product Identification Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Internal Barcode Generator & Thermal Label Centre
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            First-class Code 128 and QR generation for warehouse pallets, bins, and POS scanning.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
        >
          <Printer className="w-4 h-4 text-sky-400" />
          <span>Print Thermal Labels</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Product Selector & Configuration */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Select Material to Generate Label</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full mt-1.5 p-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Barcode Standard</label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <button
                  onClick={() => setBarcodeFormat('code128')}
                  className={`py-1.5 text-xs font-semibold rounded-md border transition text-center ${
                    barcodeFormat === 'code128'
                      ? 'bg-sky-50 border-sky-500 text-sky-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Code 128
                </button>
                <button
                  onClick={() => setBarcodeFormat('qr')}
                  className={`py-1.5 text-xs font-semibold rounded-md border transition text-center ${
                    barcodeFormat === 'qr'
                      ? 'bg-sky-50 border-sky-500 text-sky-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  QR Matrix
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Thermal Label Size</label>
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value as '58mm' | '80mm' | 'shelf')}
                className="w-full mt-1 p-1.5 rounded-md border border-slate-300 bg-white text-xs"
              >
                <option value="58mm">58mm Thermal Receipt</option>
                <option value="80mm">80mm Warehouse Tag</option>
                <option value="shelf">Shelf Edge Label</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Copies to Print</label>
            <input
              type="number"
              min="1"
              max="100"
              value={printCopies}
              onChange={(e) => setPrintCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold"
            />
          </div>

          {/* Product Identification Details */}
          {selectedProduct && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Internal SKU:</span>
                <span className="font-mono font-bold text-slate-900">{selectedProduct.sku}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Barcode Value:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                  <span>{selectedProduct.barcode}</span>
                  <button
                    onClick={handleCopyBarcode}
                    className="p-1 hover:bg-slate-200 rounded-sm text-slate-500"
                    title="Copy Barcode"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Retail Selling Price:</span>
                <span className="font-mono font-bold text-sky-700">₦{selectedProduct.retailPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Packaging Unit:</span>
                <span className="text-slate-700">{selectedProduct.baseUnit}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right 7 Cols: Thermal Label Live Preview & Bulk Sheets */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-600" />
                <span>Thermal Label Preview ({labelSize})</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Vector SVG 300 DPI</span>
            </div>

            {/* Live Label Container */}
            <div className="mt-6 flex justify-center">
              <div
                id="printable-labels"
                className={`border-2 border-dashed border-slate-300 p-5 bg-white text-slate-900 rounded-lg text-center flex flex-col items-center justify-between shadow-xs ${
                  labelSize === '58mm' ? 'w-64' : labelSize === '80mm' ? 'w-80' : 'w-72'
                }`}
              >
                {/* Brand Header */}
                <div className="text-[11px] font-bold uppercase tracking-wider text-black">
                  Elite Energy Technology
                </div>
                <div className="text-[9px] text-slate-500">Building Materials Operations</div>

                {/* Product Name */}
                <div className="font-bold text-xs text-black mt-2 leading-tight">
                  {selectedProduct?.name}
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  {selectedProduct?.baseUnit}
                </div>

                {/* Barcode SVG Rendering */}
                <div className="my-3 flex justify-center w-full overflow-hidden">
                  {barcodeFormat === 'code128' && barcodeData && (
                    <div className="flex flex-col items-center">
                      <svg width={barcodeData.totalWidth} height={barcodeData.height} className="mx-auto">
                        {barcodeData.rects.map((r, i) => (
                          <rect key={i} x={r.x} y={0} width={r.width} height={barcodeData.height} fill="black" />
                        ))}
                      </svg>
                      <div className="font-mono text-[10px] tracking-widest text-black mt-1">
                        *{selectedProduct?.barcode}*
                      </div>
                    </div>
                  )}

                  {barcodeFormat === 'qr' && qrMatrix && (
                    <div className="p-2 bg-white flex flex-col items-center">
                      <svg width={120} height={120} viewBox="0 0 21 21" className="mx-auto">
                        {qrMatrix.map((row, r) =>
                          row.map((cell, c) => (cell ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="black" /> : null))
                        )}
                      </svg>
                      <div className="font-mono text-[9px] text-slate-600 mt-1">{selectedProduct?.sku}</div>
                    </div>
                  )}
                </div>

                {/* Price & SKU Footer */}
                <div className="w-full pt-2 border-t border-slate-300 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[10px] text-slate-600">
                    SKU: {selectedProduct?.sku}
                  </span>
                  <span className="font-mono font-bold text-black text-sm tabular-nums">
                    ₦{selectedProduct?.retailPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Thermal standard: ESC/POS & TSPL compatible</span>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition"
            >
              Print {printCopies} {printCopies === 1 ? 'Label' : 'Labels'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
