import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Building,
  User,
  Printer,
  CheckCircle2,
  AlertCircle,
  Percent,
  X,
  HardHat,
  Lock,
  Unlock,
  ShieldAlert,
  Volume2,
  Scale,
  Key,
  ShoppingCart,
  Boxes,
  ArrowRight,
  LayoutGrid,
  List,
  Filter,
  RotateCcw,
  PackageCheck,
} from 'lucide-react';
import { Product, StaffUser, Location, Sale, SplitPaymentRecord, ContractorProject } from '../types';
import { reconcilePayments } from '../utils/businessLogic';
import { generateBarcodeSvg } from '../utils/barcodeGenerator';

interface PosViewProps {
  products: Product[];
  currentUser: StaffUser;
  activeLocationId: string;
  locations: Location[];
  projects?: ContractorProject[];
  onProcessSale: (saleData: {
    items: Array<{ product: Product; quantity: number; unitPrice: number; pricingTier: 'retail' | 'wholesale' | 'contractor' }>;
    discountPercent: number;
    discountReason?: string;
    customerName: string;
    customerPhone?: string;
    pricingTier: 'retail' | 'wholesale' | 'contractor';
    payments: SplitPaymentRecord[];
  }) => Sale;
  onAdjustStock?: (productId: string, locationId: string, newQuantity: number, reason: string) => void;
}

interface CartEntry {
  product: Product;
  quantity: number;
}

export const PosView: React.FC<PosViewProps> = ({
  products,
  currentUser,
  activeLocationId,
  locations,
  projects = [],
  onProcessSale,
  onAdjustStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pricingTier, setPricingTier] = useState<'retail' | 'wholesale' | 'contractor'>('retail');
  const [selectedContractorProjectId, setSelectedContractorProjectId] = useState<string>('');
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  
  // View mode: Grid cards vs High-density List view
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Quick Stock Adjustment state for zero-stock / new materials
  const [quickStockProduct, setQuickStockProduct] = useState<Product | null>(null);
  const [quickStockQty, setQuickStockQty] = useState<number>(100);

  // Mobile View Switcher (Catalogue vs Ticket/Cart)
  const [mobilePosTab, setMobilePosTab] = useState<'catalogue' | 'ticket'>('catalogue');

  // Hardware scanner & Quick Lock states
  const [scannerToast, setScannerToast] = useState<string | null>(null);
  const [isTerminalLocked, setIsTerminalLocked] = useState<boolean>(false);
  const [terminalPinInput, setTerminalPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [showManagerPinModal, setShowManagerPinModal] = useState<boolean>(false);
  const [managerPinInput, setManagerPinInput] = useState<string>('');
  const [managerPinError, setManagerPinError] = useState<boolean>(false);
  const [managerApprovedDiscount, setManagerApprovedDiscount] = useState<boolean>(false);

  // Thermal Receipt Format
  const [receiptPaperFormat, setReceiptPaperFormat] = useState<'80mm_thermal' | 'standard_a4'>('80mm_thermal');

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferRef, setTransferRef] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [cardRef, setCardRef] = useState<string>('');
  const [paystackAmount, setPaystackAmount] = useState<number>(0);
  const [creditAmount, setCreditAmount] = useState<number>(0);

  // Completed receipt modal state
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedContractorProject = projects.find((p) => p.id === selectedContractorProjectId);

  // Hardware Laser Barcode Gun Listener
  useEffect(() => {
    let charBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const now = Date.now();
      // Hardware barcode scanners emit characters rapidly (< 50ms per key)
      if (now - lastKeyTime > 150) {
        charBuffer = '';
      }
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (charBuffer.length >= 3) {
          const barcodeClean = charBuffer.trim().toLowerCase();
          const matched = products.find(
            (p) =>
              p.barcode.toLowerCase() === barcodeClean ||
              p.sku.toLowerCase() === barcodeClean
          );

          if (matched) {
            addToCart(matched);
            setScannerToast(`✓ Laser Gun Scanned: ${matched.name} added to cart!`);
            setTimeout(() => setScannerToast(null), 3000);
          } else {
            setScannerToast(`⚠ Barcode "${barcodeClean}" not found in catalogue.`);
            setTimeout(() => setScannerToast(null), 3500);
          }
          charBuffer = '';
        }
      } else if (e.key.length === 1) {
        charBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  const effectiveLocationId = activeLocationId === 'all' ? 'loc-vi' : activeLocationId;
  const currentLocation = locations.find((l) => l.id === effectiveLocationId) || locations[0];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q));

      // If user typed in search bar, search across ALL materials regardless of category filter
      if (q) return matchesSearch;

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesCat;
    });
  }, [products, selectedCategory, searchQuery]);

  // Add item to cart (with friendly guidance if zero stock)
  const addToCart = (product: Product, forceAllow = false) => {
    const stockAvailable = product.locationStock[effectiveLocationId]?.onHand || 0;
    const existing = cart.find((item) => item.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const totalCompanyStock = Object.values(product.locationStock).reduce((acc, loc) => acc + loc.onHand, 0);

    if (currentQty + 1 > stockAvailable && !forceAllow) {
      if (totalCompanyStock > 0) {
        setErrorMessage(
          `Notice: ${product.name} has 0 stock at ${currentLocation.name}, but ${totalCompanyStock} units are available across other branches. You can allocate or record opening inventory.`
        );
      } else {
        setErrorMessage(
          `Zero stock recorded for ${product.name}. Please enter opening count or receive consignment to sell at counter.`
        );
      }
      setQuickStockProduct(product);
      return;
    }
    setErrorMessage(null);

    if (existing) {
      setCart(cart.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const handleQuickAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStockProduct) return;
    if (onAdjustStock) {
      try {
        onAdjustStock(quickStockProduct.id, effectiveLocationId, quickStockQty, 'POS Counter Opening Stock Entry');
        addToCart(quickStockProduct, true);
        setQuickStockProduct(null);
        setErrorMessage(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Stock adjustment failed';
        setErrorMessage(msg);
      }
    } else {
      addToCart(quickStockProduct, true);
      setQuickStockProduct(null);
    }
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const newQty = item.quantity + delta;
          const stock = item.product.locationStock[effectiveLocationId]?.onHand || 0;
          if (newQty > stock) {
            setErrorMessage(`Maximum available stock reached for ${item.product.name} (${stock} units).`);
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        })
        .filter(Boolean) as CartEntry[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const getPrice = (product: Product) => {
    if (pricingTier === 'wholesale') return product.wholesalePrice;
    if (pricingTier === 'contractor') return product.contractorPrice;
    return product.retailPrice;
  };

  // Cart calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity * getPrice(item.product), 0);
  }, [cart, pricingTier]);

  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const finalTotal = subtotal - discountAmount;

  // Split payment validation
  const currentPayments: SplitPaymentRecord[] = useMemo(() => {
    const list: SplitPaymentRecord[] = [];
    if (cashAmount > 0) list.push({ method: 'cash', amount: cashAmount });
    if (transferAmount > 0) list.push({ method: 'bank_transfer', amount: transferAmount, reference: transferRef || 'BANK-TRF-REF' });
    if (cardAmount > 0) list.push({ method: 'pos_card', amount: cardAmount, reference: cardRef || 'POS-STANBIC' });
    if (paystackAmount > 0) list.push({ method: 'paystack', amount: paystackAmount, reference: `PSTK-${Date.now().toString().slice(-6)}` });
    if (creditAmount > 0) list.push({ method: 'credit', amount: creditAmount, reference: 'AUTHORIZED-CONTRACTOR-CREDIT' });
    return list;
  }, [cashAmount, transferAmount, transferRef, cardAmount, cardRef, paystackAmount, creditAmount]);

  const paymentReconciliation = useMemo(() => {
    return reconcilePayments(finalTotal, currentPayments);
  }, [finalTotal, currentPayments]);

  const openCheckout = () => {
    if (cart.length === 0) return;
    if (discountPercent > 5 && !managerApprovedDiscount && currentUser.role === 'cashier') {
      setShowManagerPinModal(true);
      return;
    }
    setCashAmount(finalTotal); // default all to cash
    setTransferAmount(0);
    setCardAmount(0);
    setPaystackAmount(0);
    setCreditAmount(0);
    setShowPaymentModal(true);
  };

  const handleUnlockTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    if (terminalPinInput === '1234' || terminalPinInput === '0000') {
      setIsTerminalLocked(false);
      setTerminalPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleManagerOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (managerPinInput === '9999' || managerPinInput === '1234') {
      setManagerApprovedDiscount(true);
      setShowManagerPinModal(false);
      setManagerPinInput('');
      setManagerPinError(false);
      setShowPaymentModal(true);
    } else {
      setManagerPinError(true);
    }
  };

  const handleCompleteSale = () => {
    if (!paymentReconciliation.isFullyPaid) {
      setErrorMessage(`Total paid (₦${paymentReconciliation.totalPaid.toLocaleString()}) does not cover final total (₦${finalTotal.toLocaleString()}).`);
      return;
    }

    if (creditAmount > 0) {
      if (pricingTier !== 'contractor' || !selectedContractorProject) {
        setErrorMessage('Credit transactions require linking an authorized Contractor Project account.');
        return;
      }
      if (selectedContractorProject.agingSummary?.isCreditLocked) {
        setErrorMessage(`CREDIT FROZEN: ${selectedContractorProject.companyName} has overdue debts past 90 days. Upfront payment required.`);
        return;
      }
      if (selectedContractorProject.outstandingBalance + creditAmount > selectedContractorProject.creditLimit) {
        setErrorMessage(`Credit Limit Breached! Maximum available credit is ₦${Math.max(0, selectedContractorProject.creditLimit - selectedContractorProject.outstandingBalance).toLocaleString()}`);
        return;
      }
    }

    try {
      const sale = onProcessSale({
        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: getPrice(item.product),
          pricingTier,
        })),
        discountPercent,
        discountReason,
        customerName: pricingTier === 'contractor' && selectedContractorProject ? selectedContractorProject.companyName : customerName,
        customerPhone: pricingTier === 'contractor' && selectedContractorProject ? selectedContractorProject.contactPhone : customerPhone,
        pricingTier,
        payments: currentPayments,
      });

      setCompletedSale(sale);
      setShowPaymentModal(false);
      setCart([]);
      setDiscountPercent(0);
      setDiscountReason('');
      setCustomerName('Walk-in Customer');
      setCustomerPhone('');
      setManagerApprovedDiscount(false);
      setErrorMessage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sale processing failed';
      setErrorMessage(msg);
      setShowPaymentModal(false);
    }
  };

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      {/* Toast Notification for Barcode Scanner */}
      {scannerToast && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-slate-700 animate-pulse">
          <Barcode className="w-4 h-4 text-emerald-400" />
          <span>{scannerToast}</span>
        </div>
      )}

      {/* Terminal Lock Screen Overlay */}
      {isTerminalLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">POS Terminal Locked</h3>
              <p className="text-xs text-slate-500 mt-1">Enter 4-digit Cashier PIN to resume counter operations</p>
            </div>
            <form onSubmit={handleUnlockTerminal} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={terminalPinInput}
                onChange={(e) => setTerminalPinInput(e.target.value)}
                placeholder="••••"
                className="text-center font-mono text-2xl tracking-widest w-36 mx-auto py-2 rounded-xl border border-slate-300 block font-bold"
              />
              {pinError && <p className="text-xs text-red-600 font-bold">Invalid PIN. Try 1234 or 0000.</p>}
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-md"
              >
                Unlock Terminal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manager Override Discount PIN Prompt */}
      {showManagerPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4 border border-amber-200">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Manager Override Required</h3>
              <p className="text-xs text-slate-500 mt-1">Cashier discount of {discountPercent}% exceeds 5% threshold. Enter Manager PIN.</p>
            </div>
            <form onSubmit={handleManagerOverride} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={managerPinInput}
                onChange={(e) => setManagerPinInput(e.target.value)}
                placeholder="••••"
                className="text-center font-mono text-2xl tracking-widest w-36 mx-auto py-2 rounded-xl border border-slate-300 block font-bold"
              />
              {managerPinError && <p className="text-xs text-red-600 font-bold">Invalid Manager PIN. (Demo: 9999 or 1234)</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowManagerPinModal(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md"
                >
                  Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Top Navigation Segmented Switcher (<lg) */}
      <div className="lg:hidden col-span-12 flex bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          onClick={() => setMobilePosTab('catalogue')}
          className={`flex-1 py-2.5 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 ${
            mobilePosTab === 'catalogue'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Materials ({filteredProducts.length})</span>
        </button>
        <button
          onClick={() => setMobilePosTab('ticket')}
          className={`flex-1 py-2.5 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 ${
            mobilePosTab === 'ticket'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Ticket ({cart.length}) {cart.length > 0 ? `· ₦${finalTotal.toLocaleString()}` : ''}</span>
        </button>
      </div>

      {/* Left 7 Columns: Product Search, Category Pills & Grid */}
      <div className={`lg:col-span-7 flex-col h-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${mobilePosTab === 'catalogue' ? 'flex' : 'hidden lg:flex'}`}>
        {/* Search & Pricing Tier Header */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Scan barcode or search cement, rebar, pipes, roofing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            {/* Hardware Scanner Active Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Laser Gun Active</span>
            </div>

            {/* Quick Lock Terminal Button */}
            <button
              onClick={() => setIsTerminalLocked(true)}
              className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              title="Lock Terminal"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Pricing Tier Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg text-xs font-semibold shrink-0">
              <button
                onClick={() => setPricingTier('retail')}
                className={`px-2.5 py-1 rounded-md transition ${pricingTier === 'retail' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Retail
              </button>
              <button
                onClick={() => setPricingTier('wholesale')}
                className={`px-2.5 py-1 rounded-md transition ${pricingTier === 'wholesale' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Wholesale
              </button>
              <button
                onClick={() => setPricingTier('contractor')}
                className={`px-2.5 py-1 rounded-md transition ${pricingTier === 'contractor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Contractor
              </button>
            </div>
          </div>

          {/* If Contractor Tier is Active, Display Project Selector & Credit Status */}
          {pricingTier === 'contractor' && (
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-700" />
                <span className="font-bold text-amber-950">Select Contractor Project:</span>
                <select
                  value={selectedContractorProjectId}
                  onChange={(e) => setSelectedContractorProjectId(e.target.value)}
                  className="text-xs rounded border border-amber-300 p-1 bg-white font-medium"
                >
                  <option value="">-- Choose Contractor Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.companyName} ({p.projectName}) {p.agingSummary?.isCreditLocked ? '🔒 OVERDUE LOCKED' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedContractorProject && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600">
                    Limit: <span className="font-mono font-bold">₦{selectedContractorProject.creditLimit.toLocaleString()}</span>
                  </span>
                  <span className="text-[11px] text-slate-600">
                    O/S: <span className="font-mono font-bold text-red-600">₦{selectedContractorProject.outstandingBalance.toLocaleString()}</span>
                  </span>
                  {selectedContractorProject.agingSummary?.isCreditLocked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> CREDIT FROZEN
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      CREDIT ACTIVE
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Category Controls & View Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
            {/* Horizontal Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs flex-1">
              {categories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition capitalize text-xs flex items-center gap-1.5 shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span>{cat === 'all' ? 'All Materials' : cat}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Category Dropdown + Grid/List View Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSearchQuery(''); }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 max-w-[160px] truncate"
                title="Select category from dropdown"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.filter((c) => c !== 'all').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({categoryCounts[cat] || 0})
                  </option>
                ))}
              </select>

              <div className="flex items-center border border-slate-300 rounded-lg p-0.5 bg-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow-xs text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Grid Card View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-xs text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Compact List Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Notification Bar */}
          {(selectedCategory !== 'all' || searchQuery.trim().length > 0) && (
            <div className="flex items-center justify-between px-3 py-2 bg-sky-50 border border-sky-200 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-sky-900 font-medium truncate">
                <Filter className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>
                  {searchQuery ? (
                    <>Search query: <strong className="font-bold">"{searchQuery}"</strong></>
                  ) : (
                    <>Filtered category: <strong className="font-bold">{selectedCategory}</strong></>
                  )}
                  <span className="text-slate-500 font-normal ml-1">
                    (Showing {filteredProducts.length} of {products.length} materials)
                  </span>
                </span>
              </div>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="font-bold text-sky-700 hover:text-sky-900 bg-white px-2.5 py-1 rounded-md border border-sky-300 text-xs shadow-xs transition shrink-0 cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Show All Materials ({products.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Product Listing (Grid vs High-Density List) */}
        {filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
            <Boxes className="w-12 h-12 text-slate-300 stroke-1" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">No Materials Matching Filter</h4>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search keyword or switching category.</p>
            </div>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Show All {products.length} Materials
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* High-Density Materials List View */
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Material & Specification</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2 text-right">In Stock ({currentLocation.code})</th>
                  <th className="py-2.5 px-2 text-right">Other Hubs</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((prod) => {
                  const stock = prod.locationStock[effectiveLocationId]?.onHand || 0;
                  const totalCompanyStock = Object.values(prod.locationStock).reduce((acc, loc) => acc + loc.onHand, 0);
                  const otherStock = totalCompanyStock - stock;
                  const price = getPrice(prod);
                  const isOutOfStock = stock <= 0;
                  const cartItem = cart.find((c) => c.product.id === prod.id);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            loading="lazy"
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0 shadow-2xs"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 leading-snug">{prod.name}</div>
                            <div className="text-[11px] font-mono text-sky-700 flex items-center gap-2 mt-0.5">
                              <span>{prod.sku}</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500 font-sans">{prod.baseUnit}</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500 font-sans">1 {prod.packagingUnit} = {prod.unitConversionFactor} {prod.baseUnit}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold">
                        <span className={stock > 0 ? (stock <= prod.minStockAlert ? 'text-amber-600' : 'text-emerald-700') : 'text-red-500'}>
                          {stock.toLocaleString()} {prod.baseUnit.split(' ')[0]}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-500 text-[11px]">
                        {otherStock > 0 ? `${otherStock.toLocaleString()} units` : 'None'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ₦{price.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => addToCart(prod)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 mx-auto min-h-[34px] ${
                            cartItem
                              ? 'bg-sky-700 text-white shadow-xs'
                              : isOutOfStock
                              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                              : 'bg-sky-600 text-white hover:bg-sky-500 shadow-xs'
                          }`}
                          title={isOutOfStock ? 'Click to allocate from other hubs or enter opening stock' : 'Add to ticket'}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isOutOfStock ? 'Allocate' : 'Add'}</span>
                          {cartItem && (
                            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">
                              {cartItem.quantity}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid Card View */
          <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((prod) => {
              const stock = prod.locationStock[effectiveLocationId]?.onHand || 0;
              const totalCompanyStock = Object.values(prod.locationStock).reduce((acc, loc) => acc + loc.onHand, 0);
              const otherStock = totalCompanyStock - stock;
              const price = getPrice(prod);
              const isOutOfStock = stock <= 0;
              const cartItem = cart.find((c) => c.product.id === prod.id);

              return (
                <button
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer group ${
                    cartItem
                      ? 'bg-sky-50/70 border-sky-400 ring-1 ring-sky-400 shadow-xs'
                      : isOutOfStock
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                      : 'bg-white border-slate-200 hover:border-sky-500 hover:shadow-md'
                  }`}
                >
                  <div className="w-full">
                    {/* Product Image Thumbnail with SKU and Stock Badges */}
                    <div className="relative w-full h-24 rounded-lg overflow-hidden bg-slate-100 mb-2">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="absolute top-1 left-1 text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-900/80 text-white font-bold backdrop-blur-xs">
                        {prod.sku}
                      </span>
                      <span
                        className={`absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-sm backdrop-blur-xs shadow-xs ${
                          stock > 0
                            ? stock <= prod.minStockAlert
                              ? 'bg-amber-500/90 text-white'
                              : 'bg-emerald-600/90 text-white'
                            : 'bg-amber-600/90 text-white'
                        }`}
                      >
                        {stock > 0
                          ? `${stock} in stock`
                          : otherStock > 0
                          ? `0 here (${otherStock} hubs)`
                          : '0 in stock'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1 line-clamp-2 leading-snug">
                      {prod.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                      <span className="truncate">{prod.baseUnit}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{prod.category}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                      ₦{price.toLocaleString()}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition text-xs font-bold ${
                        cartItem
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-sky-600 group-hover:text-white'
                      }`}
                    >
                      {cartItem ? cartItem.quantity : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right 5 Columns: Cart, Customer, Discounts & Split Payment Terminal */}
      <div className={`lg:col-span-5 flex-col h-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${mobilePosTab === 'ticket' ? 'flex' : 'hidden lg:flex'}`}>
        {/* Terminal Header */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="text-xs font-bold flex items-center gap-2">
              <span>Counter POS Terminal</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {cart.length} materials ({cart.reduce((a, b) => a + b.quantity, 0)} items)
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {currentLocation.name} · Cashier: {currentUser.name}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 px-2 py-1 rounded border border-red-500/30 transition flex items-center gap-1"
                title="Clear Ticket"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 capitalize">
              {pricingTier} Pricing
            </span>
          </div>
        </div>

        {/* Customer Input Strip */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/70 grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full mt-0.5 px-2 py-1 rounded-md border border-slate-300 bg-white text-xs font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Phone (Optional)</label>
            <input
              type="text"
              placeholder="+234 80..."
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full mt-0.5 px-2 py-1 rounded-md border border-slate-300 bg-white text-xs font-medium"
            />
          </div>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-2.5 bg-red-50 border-b border-red-200 text-xs text-red-700 flex items-center justify-between">
            <span className="flex-1 mr-2">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 p-3 overflow-y-auto divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <Barcode className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <span>Cart is empty</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Click materials or scan a barcode to add</span>
            </div>
          ) : (
            cart.map((item) => {
              const price = getPrice(item.product);
              const lineTotal = item.quantity * price;

              return (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-3">
                    <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      ₦{price.toLocaleString()} × {item.quantity} {item.product.baseUnit}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-slate-300 rounded-md">
                      <button
                        onClick={() => updateCartQty(item.product.id, -1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-mono font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.product.id, 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-mono font-bold text-slate-900 w-20 text-right tabular-nums">
                      ₦{lineTotal.toLocaleString()}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Totals, Discounts & Checkout Button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/90 space-y-3">
          {/* Discount input with limit notification */}
          <div className="flex items-center justify-between text-xs gap-3">
            <span className="text-slate-600 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-slate-400" />
              <span>Discount (%):</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="50"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-16 px-2 py-1 text-right text-xs rounded-md border border-slate-300 bg-white font-mono"
              />
              {discountPercent > 5 && currentUser.role === 'cashier' && (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-300">
                  Approval Required (&gt;5%)
                </span>
              )}
            </div>
          </div>

          {/* Subtotal & Final Price breakdown */}
          <div className="space-y-1 text-xs pt-1 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums">₦{subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                <span>Discount ({discountPercent}%):</span>
                <span className="font-mono tabular-nums">-₦{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Total Payable:</span>
              <span className="font-mono text-sky-700 tabular-nums">₦{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={openCheckout}
            disabled={cart.length === 0}
            className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            <span>Proceed to Payment</span>
            <span className="font-mono">(₦{finalTotal.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* Split Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Split Payment & Settlement</h3>
                <p className="text-xs text-slate-400">Total Due: ₦{finalTotal.toLocaleString()}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Cash Section */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash Tendered</span>
                  </span>
                  <input
                    type="number"
                    value={cashAmount || ''}
                    onChange={(e) => setCashAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    placeholder="0"
                    className="w-36 px-2.5 py-1 text-right rounded-md border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>

                {/* Mobile & Touch-Friendly Quick Cash Tender Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Quick:</span>
                  <button
                    type="button"
                    onClick={() => setCashAmount(finalTotal)}
                    className="px-2.5 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-mono font-bold text-[10px] transition"
                  >
                    Exact (₦{finalTotal.toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashAmount((prev) => prev + 5000)}
                    className="px-2 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] transition"
                  >
                    +₦5k
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashAmount((prev) => prev + 10000)}
                    className="px-2 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] transition"
                  >
                    +₦10k
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashAmount((prev) => prev + 50000)}
                    className="px-2 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] transition"
                  >
                    +₦50k
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashAmount(0)}
                    className="px-2 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] transition"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Bank Transfer Section */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <Building className="w-4 h-4 text-sky-600" />
                    <span>Direct Bank Transfer</span>
                  </span>
                  <input
                    type="number"
                    value={transferAmount || ''}
                    onChange={(e) => setTransferAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    placeholder="0"
                    className="w-36 px-2.5 py-1 text-right rounded-md border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>
                {transferAmount > 0 && (
                  <input
                    type="text"
                    placeholder="Enter Bank Transfer Reference (e.g. GTB-NIP-99214)"
                    value={transferRef}
                    onChange={(e) => setTransferRef(e.target.value)}
                    className="w-full px-2.5 py-1 rounded-md border border-slate-300 bg-white text-xs font-mono"
                  />
                )}
              </div>

              {/* POS Card Terminal Section */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>Card / POS Machine</span>
                  </span>
                  <input
                    type="number"
                    value={cardAmount || ''}
                    onChange={(e) => setCardAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    placeholder="0"
                    className="w-36 px-2.5 py-1 text-right rounded-md border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>
                {cardAmount > 0 && (
                  <input
                    type="text"
                    placeholder="POS Auth Code / Terminal RRN"
                    value={cardRef}
                    onChange={(e) => setCardRef(e.target.value)}
                    className="w-full px-2.5 py-1 rounded-md border border-slate-300 bg-white text-xs font-mono"
                  />
                )}
              </div>

              {/* Paystack Online Gateway */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    <span>Paystack / Flutterwave Gateway</span>
                  </span>
                  <input
                    type="number"
                    value={paystackAmount || ''}
                    onChange={(e) => setPaystackAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    placeholder="0"
                    className="w-36 px-2.5 py-1 text-right rounded-md border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Authorized Contractor Credit */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <HardHat className="w-4 h-4 text-amber-600" />
                    <span>Authorized Contractor Credit</span>
                  </span>
                  <input
                    type="number"
                    value={creditAmount || ''}
                    onChange={(e) => setCreditAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    placeholder="0"
                    className="w-36 px-2.5 py-1 text-right rounded-md border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Split Reconciliation Summary */}
              <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 space-y-1.5 text-xs font-semibold">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Total Amount Due:</span>
                  <span className="font-mono tabular-nums">₦{finalTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-900">
                  <span>Total Tendered:</span>
                  <span className="font-mono tabular-nums">₦{paymentReconciliation.totalPaid.toLocaleString()}</span>
                </div>
                {paymentReconciliation.balanceDue > 0 && (
                  <div className="flex items-center justify-between text-red-600">
                    <span>Balance Due:</span>
                    <span className="font-mono tabular-nums">₦{paymentReconciliation.balanceDue.toLocaleString()}</span>
                  </div>
                )}
                {paymentReconciliation.changeDue > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Change Due to Customer:</span>
                    <span className="font-mono tabular-nums">₦{paymentReconciliation.changeDue.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSale}
                disabled={!paymentReconciliation.isFullyPaid}
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 rounded-lg transition"
              >
                Complete Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Thermal Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            {/* Action Bar */}
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Transaction Confirmed</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print 80mm Thermal</span>
                </button>
                <button onClick={() => setCompletedSale(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Thermal Receipt Area */}
            <div id="printable-receipt" className="p-5 font-mono text-[11px] leading-tight space-y-3 bg-white">
              <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
                <div className="text-sm font-bold text-black uppercase">Elite Energy Technology</div>
                <div className="text-[10px] text-slate-600">Building Materials Operations & Supply</div>
                <div className="text-[10px] text-slate-600">{completedSale.branchName}</div>
                <div className="text-[10px] text-slate-500">{new Date(completedSale.createdAt).toLocaleString()}</div>
                <div className="text-[10px] font-bold text-black mt-1">RECEIPT: {completedSale.receiptNumber}</div>
              </div>

              <div className="text-[10px] text-slate-700 space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div>Cashier: {completedSale.cashierName}</div>
                <div>Customer: {completedSale.customerName}</div>
                {completedSale.customerPhone && <div>Phone: {completedSale.customerPhone}</div>}
                <div>Tier: {completedSale.pricingTier.toUpperCase()}</div>
              </div>

              {/* Items Table */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                {completedSale.items.map((it) => (
                  <div key={it.productId} className="flex justify-between">
                    <div className="truncate pr-2">
                      <div>{it.productName}</div>
                      <div className="text-[10px] text-slate-500">
                        {it.quantity} {it.unit} @ ₦{it.unitPrice.toLocaleString()}
                      </div>
                    </div>
                    <span className="font-bold tabular-nums">₦{it.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="space-y-1 pt-1 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="tabular-nums">₦{completedSale.subtotal.toLocaleString()}</span>
                </div>
                {completedSale.discountAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Discount ({completedSale.discountPercent}%):</span>
                    <span className="tabular-nums">-₦{completedSale.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                  <span>TOTAL:</span>
                  <span className="tabular-nums">₦{completedSale.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payments Breakdown */}
              <div className="space-y-0.5 text-[10px] border-b border-dashed border-slate-300 pb-2">
                <div className="font-bold uppercase text-slate-600 mb-1">Settlement Channels:</div>
                {completedSale.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="capitalize">{p.method.replace('_', ' ')}:</span>
                    <span className="font-bold tabular-nums">₦{p.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Barcode representation */}
              <div className="pt-2 text-center flex flex-col items-center">
                <div className="w-full flex justify-center overflow-hidden">
                  {(() => {
                    const bc = generateBarcodeSvg(completedSale.receiptNumber, { height: 40, barWidth: 1.5 });
                    return (
                      <svg width={bc.totalWidth} height={bc.height} className="mx-auto">
                        {bc.rects.map((r, i) => (
                          <rect key={i} x={r.x} y={0} width={r.width} height={bc.height} fill="black" />
                        ))}
                      </svg>
                    );
                  })()}
                </div>
                <div className="text-[9px] text-slate-600 tracking-widest mt-1">
                  *{completedSale.receiptNumber}*
                </div>
                <div className="text-[9px] text-slate-500 mt-2">
                  Thank you for building with Elite Energy Technology. Goods verified upon delivery or pickup.
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center no-print">
              <button
                onClick={() => setCompletedSale(null)}
                className="w-full py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Close & Next Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Bottom Cart Bar (<lg) */}
      {cart.length > 0 && mobilePosTab === 'catalogue' && (
        <div className="lg:hidden fixed bottom-16 left-3 right-3 z-30">
          <button
            onClick={() => setMobilePosTab('ticket')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-sky-400 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">
                {cart.reduce((sum, it) => sum + it.quantity, 0)}
              </span>
              <span className="text-xs font-bold">Review Ticket</span>
            </div>
            <div className="flex items-center gap-2 font-mono font-bold text-sm text-amber-400">
              <span>₦{finalTotal.toLocaleString()}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
