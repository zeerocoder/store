import React, { useState, useMemo } from 'react';
import {
  Store,
  ShoppingCart,
  Search,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Package,
  HardHat,
  Building,
  ArrowRight,
  X,
  CreditCard,
  Phone,
  MapPin,
  Clock,
  FileText,
  Eye,
  Scale,
  Layers,
  Award,
  SlidersHorizontal,
  ChevronRight,
  Info,
  BadgePercent,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import { Product, Location, OnlineOrder, StorefrontSettings, StaffUser } from '../types';
import { calculateDeliveryFee } from '../utils/businessLogic';
import { StorefrontSettingsModal } from './StorefrontSettingsModal';

interface StorefrontViewProps {
  products: Product[];
  locations: Location[];
  onlineOrders: OnlineOrder[];
  storefrontSettings?: StorefrontSettings;
  currentUser?: StaffUser;
  onPlaceOnlineOrder: (orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    city: string;
    items: Array<{ product: Product; quantity: number }>;
    deliveryFee: number;
    paymentGateway: 'paystack' | 'flutterwave' | 'bank_transfer';
    paymentReference: string;
  }) => OnlineOrder;
  onUpdateStorefrontSettings?: (settings: Partial<StorefrontSettings>) => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  products,
  locations,
  onlineOrders,
  storefrontSettings,
  currentUser,
  onPlaceOnlineOrder,
  onUpdateStorefrontSettings,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'name_asc'>('featured');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [storeCart, setStoreCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showOrderTracker, setShowOrderTracker] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedProductForSpecs, setSelectedProductForSpecs] = useState<Product | null>(null);
  const [specsModalQty, setSpecsModalQty] = useState<number>(1);
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<OnlineOrder | null>(null);

  // Customer Checkout Form
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Lekki / Victoria Island, Lagos');
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState(18);
  const [paymentGateway, setPaymentGateway] = useState<'paystack' | 'flutterwave' | 'bank_transfer'>('paystack');
  const [placedOrderSuccess, setPlacedOrderSuccess] = useState<OnlineOrder | null>(null);

  // Contractor Quote Request Form
  const [quoteCompany, setQuoteCompany] = useState('');
  const [quoteContact, setQuoteContact] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteProjectName, setQuoteProjectName] = useState('');
  const [quoteMaterialList, setQuoteMaterialList] = useState('');
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const matchCat = activeCategory === 'all' || p.category === activeCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q);

        const totalStock = Object.values(p.locationStock).reduce((acc, loc) => acc + loc.onHand, 0);
        const matchStock = !onlyInStock || totalStock > 0;

        return matchCat && matchSearch && matchStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.retailPrice - b.retailPrice;
        if (sortBy === 'price_desc') return b.retailPrice - a.retailPrice;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        return 0; // featured default
      });
  }, [products, activeCategory, searchQuery, onlyInStock, sortBy]);

  const addToStoreCart = (product: Product, quantity: number = 1) => {
    const existing = storeCart.find((it) => it.product.id === product.id);
    if (existing) {
      setStoreCart(
        storeCart.map((it) => (it.product.id === product.id ? { ...it, quantity: it.quantity + quantity } : it))
      );
    } else {
      setStoreCart([...storeCart, { product, quantity }]);
    }
  };

  const updateCartQty = (productId: string, delta: number) => {
    setStoreCart((prev) =>
      prev
        .map((it) => (it.product.id === productId ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it))
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId: string) => {
    setStoreCart(storeCart.filter((it) => it.product.id !== productId));
  };

  const itemsSubtotal = storeCart.reduce((acc, it) => acc + it.quantity * it.product.retailPrice, 0);
  const totalWeightKg = storeCart.reduce((acc, it) => acc + it.quantity * (it.product.weightKg || 25), 0);

  // Calculate freight based on actual building materials weight and distance
  const deliveryCalc = useMemo(() => {
    let vehicle: 'pickup_van' | 'canter_3t' | 'tipper_10t' | 'flatbed_30t' = 'pickup_van';
    if (totalWeightKg > 12000) vehicle = 'flatbed_30t';
    else if (totalWeightKg > 4000) vehicle = 'tipper_10t';
    else if (totalWeightKg > 1500) vehicle = 'canter_3t';

    return calculateDeliveryFee({
      weightKg: Math.max(100, totalWeightKg),
      distanceKm: deliveryDistanceKm,
      vehicleType: vehicle,
      requiresOffloading: true,
    });
  }, [totalWeightKg, deliveryDistanceKm]);

  const orderTotal = itemsSubtotal + (storeCart.length > 0 ? deliveryCalc.totalFee : 0);

  const handleCheckout = () => {
    if (!customerName || !customerPhone || !deliveryAddress) {
      alert('Please enter your full name, phone number, and delivery address.');
      return;
    }

    const ref = `${paymentGateway.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const order = onPlaceOnlineOrder({
      customerName,
      customerEmail: customerEmail || 'customer@gmail.com',
      customerPhone,
      deliveryAddress,
      city: deliveryCity,
      items: storeCart,
      deliveryFee: deliveryCalc.totalFee,
      paymentGateway,
      paymentReference: ref,
    });

    setPlacedOrderSuccess(order);
    setStoreCart([]);
    setShowCheckoutModal(false);
  };

  const handleTrackOrder = () => {
    const found = onlineOrders.find((o) => o.orderNumber.toLowerCase() === trackOrderNumber.trim().toLowerCase());
    setTrackedOrder(found || null);
  };

  const canAdminStorefront = currentUser?.role === 'owner' || currentUser?.role === 'general_manager';

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Promotional Announcement Strip */}
      {storefrontSettings?.showAnnouncement && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl shadow-xs flex items-center justify-between border border-amber-300">
          <div className="flex items-center gap-2 truncate">
            <span className="font-black uppercase tracking-wider text-[10px] bg-slate-950 text-white px-2 py-0.5 rounded-sm">
              Live Logistics
            </span>
            <span className="truncate">
              {storefrontSettings.announcementBarText ||
                'Heavy haulage fleet active across Lagos, Uyo & Port Harcourt. Guaranteed same-day dispatch for orders confirmed before 12 PM.'}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 hidden sm:flex text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>Direct Commercial Line: {storefrontSettings.supportPhone || '+234 802 110 0001'}</span>
            </span>
          </div>
        </div>
      )}

      {/* Official Public Storefront Premium Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white overflow-hidden p-8 md:p-12 border border-slate-800 shadow-2xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 z-10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>{storefrontSettings?.storeName || 'Elite Energy Technology · Direct Building Materials Supply'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.15]">
            {storefrontSettings?.bannerHeadline || 'Certified Building Materials & Direct Heavy Haulage in Nigeria'}
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
            {storefrontSettings?.bannerSubheadline ||
              'Order 100% genuine Grade 42.5R Dangote Cement, Tiger TMT High-Yield Rebars, Longspan Aluminium Roofing, and Quarry Aggregates with verified weighbridge accuracy and direct crane offloading on your site.'}
          </p>

          {/* Key Value Propositions */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="font-black text-sky-400 text-sm">SON / NIS</div>
              <div className="text-[11px] text-slate-300">100% Factory Certified</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="font-black text-emerald-400 text-sm">5 Hubs</div>
              <div className="text-[11px] text-slate-300">Lagos, Uyo & PH Yards</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="font-black text-amber-400 text-sm">Fleet Haulage</div>
              <div className="text-[11px] text-slate-300">Canters, Tippers & 30T Flatbeds</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="font-black text-purple-400 text-sm">Contractor Tier</div>
              <div className="text-[11px] text-slate-300">Direct Wholesale Margin</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowQuoteModal(true)}
              className="px-5 py-3 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition flex items-center gap-2 shadow-lg shadow-sky-600/30 cursor-pointer"
            >
              <HardHat className="w-4 h-4" />
              <span>Contractor Project Quotation</span>
            </button>
            <button
              onClick={() => setShowOrderTracker(true)}
              className="px-5 py-3 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-sky-400" />
              <span>Track Live Delivery Order</span>
            </button>
            {canAdminStorefront && onUpdateStorefrontSettings && (
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-4 py-3 text-xs font-bold rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Customize Storefront (Admin)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Catalog Search, Filter & Category Navigation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cement, TMT rebar, roofing, tiles, cables, pipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end text-xs">
            {/* In-Stock Toggle */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer select-none text-slate-700">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-3.5 h-3.5 text-sky-600 rounded"
              />
              <span className="font-semibold text-xs">In-Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-700 border-none focus:outline-hidden cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills with Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100">
          {categories.map((c) => {
            const count = categoryCounts[c] || 0;
            const isActive = activeCategory === c;
            return (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition capitalize text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{c === 'all' ? 'All Materials' : c}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Storefront Layout: Left 8 cols product showcase, Right 4 cols Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Products Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>
              Showing <strong className="font-bold text-slate-800">{filtered.length}</strong> certified building materials
              {activeCategory !== 'all' && ` in ${activeCategory}`}
            </span>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-sky-600 hover:underline">
                Clear search &quot;{searchQuery}&quot;
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
              <h3 className="text-sm font-bold text-slate-800">No Building Materials Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No materials match your current category or search filter. Try adjusting your query or viewing all materials.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                  setOnlyInStock(false);
                }}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-500 transition"
              >
                Show All Materials
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((prod) => {
                const totalStock = Object.values(prod.locationStock).reduce((acc, loc) => acc + loc.onHand, 0);
                const isOutOfStock = totalStock <= 0;
                const savingsAmount = prod.retailPrice - prod.contractorPrice;
                const savingsPct = Math.round((savingsAmount / prod.retailPrice) * 100);
                const cartItem = storeCart.find((it) => it.product.id === prod.id);

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-sky-500 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Real Image Container */}
                      <div className="h-48 w-full overflow-hidden bg-slate-100 relative group-hover:opacity-95 transition">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80';
                          }}
                        />

                        {/* Top Overlay Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950/80 text-white backdrop-blur-xs shadow-xs">
                            {prod.category}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-900 backdrop-blur-xs shadow-xs border border-white/50">
                            {prod.sku}
                          </span>
                        </div>

                        {/* Quick Specs Trigger Overlay on Hover */}
                        <button
                          onClick={() => {
                            setSelectedProductForSpecs(prod);
                            setSpecsModalQty(1);
                          }}
                          className="absolute inset-x-3 bottom-2.5 py-1.5 px-3 rounded-xl bg-slate-950/85 hover:bg-sky-600 text-white text-[11px] font-bold backdrop-blur-xs transition flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Technical Data Sheet</span>
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-sky-800 uppercase tracking-wider text-[10px]">
                            {prod.brand}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {prod.weightKg ? `${prod.weightKg} kg/unit` : 'Standard Weight'}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-sky-700 transition">
                          {prod.name}
                        </h3>

                        {/* Packaging unit and conversion */}
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            Base: <strong className="text-slate-700">{prod.baseUnit}</strong> · 1 {prod.packagingUnit} = {prod.unitConversionFactor} {prod.baseUnit}
                          </span>
                        </div>

                        {/* Stock Availability Indicator */}
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          {isOutOfStock ? (
                            <span className="text-red-600 font-bold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-600" />
                              <span>Out of Stock (Hub Transfer Available)</span>
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                              <span>In Stock ({totalStock.toLocaleString()} across 5 hubs)</span>
                            </span>
                          )}
                        </div>

                        {/* Contractor Wholesale Callout Badge */}
                        {savingsAmount > 0 && (
                          <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[10px] text-amber-900 flex items-center justify-between">
                            <span className="flex items-center gap-1 font-semibold">
                              <BadgePercent className="w-3 h-3 text-amber-700" />
                              <span>Contractor Project Bulk:</span>
                            </span>
                            <span className="font-mono font-bold text-amber-800">
                              ₦{prod.contractorPrice.toLocaleString()} (-{savingsPct}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price and Cart Actions */}
                    <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          Retail Direct
                        </span>
                        <div className="text-base font-extrabold font-mono text-sky-700 tabular-nums">
                          ₦{prod.retailPrice.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedProductForSpecs(prod);
                            setSpecsModalQty(1);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="View Specifications"
                        >
                          <Info className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => addToStoreCart(prod)}
                          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                            cartItem
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-slate-900 hover:bg-sky-600 text-white'
                          }`}
                        >
                          {cartItem ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Added ({cartItem.quantity})</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 4 cols: Live Cart & Logistics Engine */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col justify-between h-fit sticky top-20 space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-sky-600" />
                <span>Online Order Cart</span>
              </h3>
              <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-mono font-bold">
                {storeCart.length} {storeCart.length === 1 ? 'material' : 'materials'}
              </span>
            </div>

            <div className="mt-3 space-y-3 max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
              {storeCart.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingCart className="w-5 h-5 stroke-1" />
                  </div>
                  <p className="text-xs text-slate-400 max-w-[220px] mx-auto">
                    Your cart is empty. Click <strong>Add to Cart</strong> on materials to calculate heavy haulage freight.
                  </p>
                </div>
              ) : (
                storeCart.map((it) => (
                  <div key={it.product.id} className="pt-3 flex items-center justify-between text-xs gap-2">
                    <img
                      src={it.product.image}
                      alt={it.product.name}
                      className="w-11 h-11 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&auto=format&fit=crop&q=80';
                      }}
                    />

                    <div className="flex-1 min-w-0 pr-1">
                      <div className="font-bold text-slate-900 truncate">{it.product.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                        <span>₦{it.product.retailPrice.toLocaleString()}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-400">{it.product.baseUnit}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateCartQty(it.product.id, -1)}
                        className="w-6 h-6 rounded-md border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold w-6 text-center text-slate-900 text-xs">
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(it.product.id, 1)}
                        className="w-6 h-6 rounded-md border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(it.product.id)}
                        className="text-slate-300 hover:text-red-600 ml-1 p-1"
                        title="Remove material"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {storeCart.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Materials Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    ₦{itemsSubtotal.toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center gap-1 font-semibold">
                      <Scale className="w-3 h-3 text-slate-500" />
                      <span>Total Consignment Weight:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {(totalWeightKg / 1000).toFixed(2)} Tonnes ({totalWeightKg.toLocaleString()} kg)
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-sky-600" />
                      <span>Allocated Haulage Vehicle:</span>
                    </span>
                    <span className="font-semibold text-sky-800 capitalize">
                      {deliveryCalc.vehicleType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200">
                    <span>Direct Freight & Offloading ({deliveryDistanceKm} km):</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₦{deliveryCalc.totalFee.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due:</span>
                  <span className="font-mono text-sky-700 tabular-nums">₦{orderTotal.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCheckoutModal(true)}
            disabled={storeCart.length === 0}
            className="w-full py-3 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition shadow-md shadow-sky-600/20 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Proceed to Secure Checkout</span>
          </button>
        </div>
      </div>

      {/* Product Technical Specification & Stock Modal */}
      {selectedProductForSpecs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold">Technical Specifications & Stock Availability</h3>
              </div>
              <button
                onClick={() => setSelectedProductForSpecs(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              {/* Product Header */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <img
                  src={selectedProductForSpecs.image}
                  alt={selectedProductForSpecs.name}
                  className="w-full sm:w-44 h-36 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                      {selectedProductForSpecs.sku}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Barcode: {selectedProductForSpecs.barcode}
                    </span>
                  </div>

                  <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                    {selectedProductForSpecs.name}
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedProductForSpecs.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Retail Price</span>
                      <div className="text-sm font-black font-mono text-sky-700">
                        ₦{selectedProductForSpecs.retailPrice.toLocaleString()} / {selectedProductForSpecs.baseUnit}
                      </div>
                    </div>
                    <div className="border-l border-slate-200 pl-3">
                      <span className="text-[10px] text-slate-400 uppercase">Contractor Wholesale</span>
                      <div className="text-sm font-bold font-mono text-amber-700">
                        ₦{selectedProductForSpecs.contractorPrice.toLocaleString()} / {selectedProductForSpecs.baseUnit}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engineering Specifications Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-sky-600" />
                  <span>Engineering & Material Specifications</span>
                </h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 bg-slate-50">
                  <div className="p-2.5 flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Manufacturer / Brand:</span>
                    <span className="font-bold text-slate-900">{selectedProductForSpecs.manufacturer} ({selectedProductForSpecs.brand})</span>
                  </div>
                  <div className="p-2.5 flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Base Unit of Measurement:</span>
                    <span className="font-bold text-slate-900">{selectedProductForSpecs.baseUnit}</span>
                  </div>
                  <div className="p-2.5 flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Bulk Packaging Specification:</span>
                    <span className="font-bold text-slate-900">
                      1 {selectedProductForSpecs.packagingUnit} = {selectedProductForSpecs.unitConversionFactor} {selectedProductForSpecs.baseUnit}
                    </span>
                  </div>
                  <div className="p-2.5 flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Unit Weight for Fleet Calculation:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedProductForSpecs.weightKg || 10} kg</span>
                  </div>
                  {selectedProductForSpecs.specifications &&
                    Object.entries(selectedProductForSpecs.specifications).map(([k, v]) => (
                      <div key={k} className="p-2.5 flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">{k}:</span>
                        <span className="font-bold text-slate-900 font-mono">{v}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Stock Breakdown Across Company Locations */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Stock Availability Across 5 Company Hubs</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {locations.map((loc) => {
                    const stock = selectedProductForSpecs.locationStock[loc.id]?.onHand || 0;
                    return (
                      <div
                        key={loc.id}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{loc.name}</div>
                          <div className="text-[10px] text-slate-400">{loc.city}</div>
                        </div>
                        <span
                          className={`font-mono font-bold text-xs ${
                            stock > 0 ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {stock.toLocaleString()} units
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add to Cart Actions */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                    <button
                      onClick={() => setSpecsModalQty(Math.max(1, specsModalQty - 1))}
                      className="p-1.5 hover:bg-slate-100 text-slate-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={specsModalQty}
                      onChange={(e) => setSpecsModalQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-14 text-center font-mono font-bold text-xs border-none focus:outline-hidden"
                    />
                    <button
                      onClick={() => setSpecsModalQty(specsModalQty + 1)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    = ₦{(selectedProductForSpecs.retailPrice * specsModalQty).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => {
                    addToStoreCart(selectedProductForSpecs, specsModalQty);
                    setSelectedProductForSpecs(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add {specsModalQty} {selectedProductForSpecs.baseUnit} to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Secure Online Checkout</span>
                </h3>
                <p className="text-xs text-slate-400">Total Consignment: ₦{orderTotal.toLocaleString()}</p>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Recipient Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Babatunde Adeleke"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 uppercase text-[10px]">Phone Number *</label>
                    <input
                      type="text"
                      placeholder="+234 80..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 uppercase text-[10px]">Email Address</label>
                    <input
                      type="email"
                      placeholder="client@mail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Delivery Site Address *</label>
                  <textarea
                    placeholder="Site location, street address, nearest landmark for heavy truck offloading..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    rows={2}
                  />
                </div>

                {/* Gateway Selection */}
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Select Payment Gateway</label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('paystack')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        paymentGateway === 'paystack'
                          ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold ring-1 ring-sky-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                        <span>Paystack</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Card & USSD</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentGateway('flutterwave')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        paymentGateway === 'flutterwave'
                          ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold ring-1 ring-sky-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <CreditCard className="w-3.5 h-3.5 text-orange-600" />
                        <span>Flutterwave</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">NIP & Direct</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentGateway('bank_transfer')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        paymentGateway === 'bank_transfer'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Building className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Direct Wire</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">GTBank Official</div>
                    </button>
                  </div>

                  {paymentGateway === 'bank_transfer' && (
                    <div className="mt-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                      <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider">
                        Official Corporate Account for Direct Wire Transfer:
                      </span>
                      <div className="text-slate-800">
                        Bank: <strong>{storefrontSettings?.bankName || 'Guaranty Trust Bank (GTBank)'}</strong>
                      </div>
                      <div className="text-slate-800">
                        Account No:{' '}
                        <strong className="font-mono text-emerald-700 text-sm font-black">
                          {storefrontSettings?.accountNumber || '0128994102'}
                        </strong>
                      </div>
                      <div className="text-slate-800">
                        Beneficiary:{' '}
                        <strong>
                          {storefrontSettings?.accountName || 'Elite Energy Technology Corporate Operations'}
                        </strong>
                      </div>
                      <div className="text-[10px] text-emerald-800 pt-1">
                        Please include your phone number or Order Reference as payment narration for instant automated reconciliation.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs cursor-pointer"
              >
                Confirm & Pay ₦{orderTotal.toLocaleString()} Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contractor Bulk Quotation Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <HardHat className="w-4 h-4 text-sky-400" />
                <span>Contractor Material Schedule Quotation</span>
              </h3>
              <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {quoteSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">Quotation Request Submitted Successfully!</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Reference <strong className="font-mono text-sky-700">EET-QT-1093</strong> generated. Our Commercial Projects Desk will review your material quantities and email a formal proforma quote within 2 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setQuoteSubmitted(false);
                      setShowQuoteModal(false);
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-sky-600 rounded-xl hover:bg-sky-500 transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-slate-600">
                    Contractors, site engineers, and real estate developers can submit bulk material schedules to unlock project tiered pricing and structured payment credit terms.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Company / Contractor Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Primrose Civil Ltd"
                        value={quoteCompany}
                        onChange={(e) => setQuoteCompany(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Contact Person</label>
                      <input
                        type="text"
                        placeholder="Engr. Adeyemi"
                        value={quoteContact}
                        onChange={(e) => setQuoteContact(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+234 80..."
                        value={quotePhone}
                        onChange={(e) => setQuotePhone(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 uppercase text-[10px]">Project Name & Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Eko Atlantic Block B"
                        value={quoteProjectName}
                        onChange={(e) => setQuoteProjectName(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 uppercase text-[10px]">Required Materials & Quantities</label>
                    <textarea
                      placeholder="e.g.&#10;- 500 bags Dangote 3X 42.5R Cement&#10;- 200 lengths 16mm TMT Steel Rebar&#10;- 4 x 20-Tonne Tipper loads granite 3/4&quot;"
                      value={quoteMaterialList}
                      onChange={(e) => setQuoteMaterialList(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono text-xs"
                      rows={4}
                    />
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 -mx-5 -mb-5 mt-4">
                    <button
                      onClick={() => setShowQuoteModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setQuoteSubmitted(true)}
                      className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition"
                    >
                      Request Proforma Quotation
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Order Tracking Modal */}
      {showOrderTracker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-400" />
                <span>Track Elite Energy Delivery Order</span>
              </h3>
              <button onClick={() => setShowOrderTracker(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Order Number (e.g. EET-ORD-5541)"
                  value={trackOrderNumber}
                  onChange={(e) => setTrackOrderNumber(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono font-bold uppercase focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={handleTrackOrder}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition"
                >
                  Track
                </button>
              </div>

              {trackedOrder ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-700 text-sm">{trackedOrder.orderNumber}</span>
                    <span className="capitalize px-2 py-0.5 rounded-full text-[10px] bg-sky-100 text-sky-800 font-semibold">
                      {trackedOrder.fulfillmentStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600">
                    <div>
                      Customer: <strong className="text-slate-900">{trackedOrder.customerName}</strong>
                    </div>
                    <div>Destination: {trackedOrder.deliveryAddress}</div>
                    <div>
                      Total: <strong className="font-mono text-slate-900">₦{trackedOrder.totalAmount.toLocaleString()}</strong>
                    </div>
                    <div>
                      Est Delivery: <strong className="text-slate-900">{trackedOrder.estimatedDeliveryDate}</strong>
                    </div>
                  </div>

                  {trackedOrder.assignedDriver && (
                    <div className="pt-2 border-t border-slate-200 text-slate-700">
                      <div>
                        Assigned Driver: <strong>{trackedOrder.assignedDriver}</strong>
                      </div>
                      <div>
                        Vehicle: <span className="font-mono">{trackedOrder.assignedVehicle}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : trackOrderNumber ? (
                <div className="text-slate-500 text-center py-4">No order found matching &quot;{trackOrderNumber}&quot;. Try EET-ORD-5541.</div>
              ) : null}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowOrderTracker(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Placed Order Success Modal */}
      {placedOrderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-300 p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Payment Confirmed & Order Reserved!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Order <strong className="font-mono text-sky-700">{placedOrderSuccess.orderNumber}</strong> has been allocated to our Lekki Materials Yard for fulfillment.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left font-mono space-y-1">
              <div>Ref: {placedOrderSuccess.paymentReference}</div>
              <div>Gateway: {placedOrderSuccess.paymentGateway.toUpperCase()}</div>
              <div>Total: ₦{placedOrderSuccess.totalAmount.toLocaleString()}</div>
            </div>
            <button
              onClick={() => setPlacedOrderSuccess(null)}
              className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Storefront Customization Settings Modal (Admin) */}
      {storefrontSettings && onUpdateStorefrontSettings && (
        <StorefrontSettingsModal
          settings={storefrontSettings}
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onSave={onUpdateStorefrontSettings}
        />
      )}
    </div>
  );
};
