import React, { useState, useEffect, useRef } from 'react';
import {
  ScanLine,
  Camera,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  Package,
  Building2,
  ArrowRightLeft,
  ShoppingCart,
  Volume2,
  VolumeX,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { Product, Location, StaffUser } from '../types';

interface SmartScannerViewProps {
  products: Product[];
  locations: Location[];
  activeLocationId: string;
  currentUser: StaffUser;
  onNavigateToPos: () => void;
  onNavigateToTransfer: (productId: string) => void;
}

export const SmartScannerView: React.FC<SmartScannerViewProps> = ({
  products,
  locations,
  activeLocationId,
  currentUser,
  onNavigateToPos,
  onNavigateToTransfer,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(products[0] || null);
  const [cameraActive, setCameraActive] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanHistory, setScanHistory] = useState<Array<{ product: Product; timestamp: string }>>([]);
  const [hardwareScanStatus, setHardwareScanStatus] = useState<string>('Listening for USB/Bluetooth Scanner...');
  const [flashFeedback, setFlashFeedback] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Play audio beep on successful barcode scan
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // AudioContext policy
    }
  };

  // Perform lookup on a scanned barcode string
  const handleBarcodeIdentified = (code: string) => {
    const clean = code.trim();
    if (!clean) return;

    const matched = products.find(
      (p) => p.barcode === clean || p.sku.toLowerCase() === clean.toLowerCase()
    );

    setFlashFeedback(true);
    playBeep();
    setTimeout(() => setFlashFeedback(false), 300);

    if (matched) {
      setScannedProduct(matched);
      setScanHistory((prev) => [{ product: matched, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
      setHardwareScanStatus(`Scanned: ${matched.name} (${matched.sku})`);
    } else {
      setHardwareScanStatus(`Unknown Barcode: ${clean}. No registered company product match.`);
    }
  };

  // Hardware scanner keyboard listener (captures fast barcode scanner keypresses)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a standard input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        buffer = ''; // Reset if typing speed is too slow for a barcode scanner
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 4) {
          handleBarcodeIdentified(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, soundEnabled]);

  // Camera scanner toggle
  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } catch {
        alert('Camera permission denied or camera device not available.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <ScanLine className="w-3.5 h-3.5 text-sky-600" />
            <span>Scanning Operations Centre</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            SCAN & IDENTIFY: High-Speed Product Recognition
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supports Android & iPhone cameras, desktop webcams, and USB / Bluetooth physical hardware barcode scanners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border transition ${
              soundEnabled ? 'bg-sky-50 border-sky-300 text-sky-700' : 'bg-slate-100 border-slate-300 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute Beep Feedback' : 'Enable Audio Beep'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setContinuousMode(!continuousMode)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              continuousMode ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Continuous Stock Count: {continuousMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Columns: Camera Viewport & Hardware Input */}
        <div className="lg:col-span-6 space-y-4">
          <div className={`bg-slate-900 text-white rounded-xl p-5 border shadow-md relative overflow-hidden transition-colors ${
            flashFeedback ? 'border-emerald-400 bg-slate-850' : 'border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Camera className="w-4 h-4 text-sky-400" />
                <span>Live Camera Barcode Scanner</span>
              </div>
              <button
                onClick={toggleCamera}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  cameraActive ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
              >
                {cameraActive ? 'Stop Camera' : 'Start Camera'}
              </button>
            </div>

            {/* Video Viewport Area */}
            <div className="mt-4 relative rounded-xl bg-slate-950 aspect-video flex items-center justify-center border border-slate-800 overflow-hidden">
              <video ref={videoRef} className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`} playsInline muted />

              {!cameraActive && (
                <div className="text-center p-6 text-slate-500 space-y-2">
                  <ScanLine className="w-12 h-12 stroke-1 text-slate-600 mx-auto" />
                  <div className="text-xs font-semibold text-slate-400">Camera Inactive</div>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Click &quot;Start Camera&quot; to scan product labels or use any connected USB / Bluetooth handheld barcode scanner.
                  </p>
                </div>
              )}

              {/* Scanning Target Crosshair overlay */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-36 border-2 border-sky-400/80 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-sky-400" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-sky-400" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-sky-400" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-sky-400" />
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  </div>
                </div>
              )}
            </div>

            {/* Hardware Scanner Status */}
            <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <Keyboard className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">{hardwareScanStatus}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                Listening
              </span>
            </div>

            {/* Manual Barcode Input Fallback */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Type or paste barcode value..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleBarcodeIdentified(manualCode);
                    setManualCode('');
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 font-mono"
              />
              <button
                onClick={() => {
                  handleBarcodeIdentified(manualCode);
                  setManualCode('');
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                Lookup
              </button>
            </div>
          </div>

          {/* Quick Demo Scan Buttons */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 uppercase text-[10px]">Quick Test Simulation Barcodes:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {products.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleBarcodeIdentified(p.barcode)}
                  className="p-2 rounded-lg border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-left transition"
                >
                  <div className="font-bold text-slate-900 truncate">{p.name.split(' ')[0]} {p.name.split(' ')[1]}</div>
                  <div className="font-mono text-[10px] text-slate-500">{p.barcode}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 6 Columns: Instant Identification Result Card */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant Material Identification</span>
              </h3>
              <span className="text-[11px] font-mono text-sky-700 font-bold">
                {scannedProduct?.sku || 'NO SKU'}
              </span>
            </div>

            {scannedProduct ? (
              <div className="mt-4 space-y-4">
                {/* Product Title & Brand */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    {scannedProduct.category} · {scannedProduct.manufacturer}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">{scannedProduct.name}</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{scannedProduct.description}</p>
                </div>

                {/* Key Attributes & Pricing */}
                <div className="grid grid-cols-3 gap-3 text-xs p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Retail Price</span>
                    <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                      ₦{scannedProduct.retailPrice.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Wholesale Price</span>
                    <div className="text-sm font-bold font-mono text-sky-700 tabular-nums">
                      ₦{scannedProduct.wholesalePrice.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Selling Unit</span>
                    <div className="text-sm font-bold text-slate-900">
                      {scannedProduct.baseUnit}
                    </div>
                  </div>
                </div>

                {/* Multi-Location Stock Availability */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">
                    Current Stock by Branch & Warehouse:
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {locations.map((loc) => {
                      const stock = scannedProduct.locationStock[loc.id] || { onHand: 0, binLocation: 'None' };
                      return (
                        <div key={loc.id} className="p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-900">{loc.name}</span>
                            <span className="text-[11px] text-slate-400 ml-2 font-mono">({stock.binLocation})</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 tabular-nums">
                            {stock.onHand} {scannedProduct.baseUnit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Scan or enter a product barcode to display identity details.
              </div>
            )}
          </div>

          {/* Action Trigger Shortcuts */}
          {scannedProduct && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => onNavigateToTransfer(scannedProduct.id)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-sky-600" />
                <span>Transfer Stock</span>
              </button>

              <button
                onClick={onNavigateToPos}
                className="flex-1 py-2 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to POS Sale</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
