import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Building2,
  Package,
  Layers,
  Calculator,
  ArrowRight,
  Eye,
  X,
  Plus,
  Edit3,
  Trash2,
  DollarSign,
  AlertCircle,
  Tag,
  CheckCircle2,
  Barcode,
  ArrowRightLeft,
  Upload,
  Camera,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, Location, StaffUser, ProductLocationStock } from '../types';
import { convertPackagingUnits } from '../utils/businessLogic';
import { generateBarcodeSvg } from '../utils/barcodeGenerator';
import { compressImage } from '../utils/imageStorage';

interface ProductsViewProps {
  products: Product[];
  locations: Location[];
  activeLocationId: string;
  currentUser: StaffUser;
  onNavigateToBarcode: (productId: string) => void;
  onNavigateToTransfer: (productId: string) => void;
  onAddProduct?: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  onUpdateProduct?: (id: string, updates: Partial<Product>) => void;
  onUpdatePrices?: (
    id: string,
    prices: {
      retailPrice?: number;
      wholesalePrice?: number;
      contractorPrice?: number;
      costPrice?: number;
    }
  ) => void;
  onDeleteProduct?: (id: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  locations,
  activeLocationId,
  currentUser,
  onNavigateToBarcode,
  onNavigateToTransfer,
  onAddProduct,
  onUpdateProduct,
  onUpdatePrices,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Add Product Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('Cement & Binders');
  const [subcategory, setSubcategory] = useState('Portland Cement');
  const [manufacturer, setManufacturer] = useState('Dangote Cement Plc');
  const [brand, setBrand] = useState('Dangote 3X');
  const [baseUnit, setBaseUnit] = useState('Bag (50kg)');
  const [packagingUnit, setPackagingUnit] = useState('Pallet (50 Bags)');
  const [unitConversionFactor, setUnitConversionFactor] = useState(50);
  const [costPrice, setCostPrice] = useState(9500);
  const [retailPrice, setRetailPrice] = useState(11500);
  const [wholesalePrice, setWholesalePrice] = useState(10800);
  const [contractorPrice, setContractorPrice] = useState(10500);
  const [minStockAlert, setMinStockAlert] = useState(50);
  const [maxStockLevel, setMaxStockLevel] = useState(1000);
  const [weightKg, setWeightKg] = useState(50);
  const [description, setDescription] = useState('');
  const [initialOpeningStock, setInitialOpeningStock] = useState<number>(250);
  const [initialStockLocationId, setInitialStockLocationId] = useState<string>('loc-vi');
  const [imageUrl, setImageUrl] = useState<string>('');

  // Edit Prices Form State
  const [editCostPrice, setEditCostPrice] = useState<number>(0);
  const [editRetailPrice, setEditRetailPrice] = useState<number>(0);
  const [editWholesalePrice, setEditWholesalePrice] = useState<number>(0);
  const [editContractorPrice, setEditContractorPrice] = useState<number>(0);
  const [editName, setEditName] = useState('');
  const [editBaseUnit, setEditBaseUnit] = useState('');
  const [editPackagingUnit, setEditPackagingUnit] = useState('');
  const [editConversionFactor, setEditConversionFactor] = useState(1);
  const [editMinStock, setEditMinStock] = useState(10);
  const [editImage, setEditImage] = useState<string>('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Selected image exceeds 20MB. Please choose a smaller photo.');
      return;
    }

    try {
      // Automatically compress device/camera photos to ~40KB-70KB
      const compressed = await compressImage(file, 800, 800, 0.82);
      if (compressed) {
        setter(compressed);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setter(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Unit conversion tool state
  const [showConverter, setShowConverter] = useState(false);
  const [convertQty, setConvertQty] = useState<number>(100);
  const [convertDir, setConvertDir] = useState<'packaging_to_base' | 'base_to_packaging'>('packaging_to_base');
  const [activeConvertFactor, setActiveConvertFactor] = useState<number>(20);
  const [packagingUnitName, setPackagingUnitName] = useState<string>('Cartons');
  const [baseUnitName, setBaseUnitName] = useState<string>('Pieces');

  const canManageProducts = ['owner', 'general_manager', 'inventory_manager'].includes(currentUser.role);
  const canEditPrices = ['owner', 'general_manager', 'inventory_manager', 'branch_manager'].includes(currentUser.role);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.manufacturer.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const convertedResult = (() => {
    try {
      if (convertDir === 'packaging_to_base') {
        return convertPackagingUnits(convertQty, 'packaging', activeConvertFactor);
      } else {
        return convertPackagingUnits(convertQty, 'base', activeConvertFactor);
      }
    } catch {
      return 0;
    }
  })();

  const openConverterForProduct = (p: Product) => {
    setPackagingUnitName(p.packagingUnit);
    setBaseUnitName(p.baseUnit);
    setActiveConvertFactor(p.unitConversionFactor);
    setConvertQty(10);
    setShowConverter(true);
  };

  const getCategoryDefaultImage = (cat: string): string => {
    switch (cat) {
      case 'Cement & Binders':
        return 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80';
      case 'Iron & Steel':
        return 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=800&auto=format&fit=crop&q=80';
      case 'Roofing Materials':
        return 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800&auto=format&fit=crop&q=80';
      case 'Blocks & Bricks':
        return 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&auto=format&fit=crop&q=80';
      case 'Aggregates & Sand':
        return 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=800&auto=format&fit=crop&q=80';
      case 'Tiles & Flooring':
        return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80';
      case 'Paints & Finishes':
        return 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop&q=80';
      case 'Electrical Materials':
        return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80';
      case 'Plumbing Materials':
        return 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=80';
      case 'Timber & Formwork':
        return 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=800&auto=format&fit=crop&q=80';
      default:
        return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80';
    }
  };

  const handleOpenAdd = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setName('');
    setSku(`EET-MAT-${randomCode}`);
    setBarcode(`111005${randomCode}`);
    setCategory('Cement & Binders');
    setSubcategory('Structural Materials');
    setManufacturer('Elite Manufacturer');
    setBrand('Elite Grade');
    setBaseUnit('Piece');
    setPackagingUnit('Bundle (10 Pcs)');
    setUnitConversionFactor(10);
    setCostPrice(5000);
    setRetailPrice(7500);
    setWholesalePrice(6800);
    setContractorPrice(6400);
    setMinStockAlert(50);
    setMaxStockLevel(1000);
    setWeightKg(20);
    setDescription('');
    setImageUrl('');
    setInitialOpeningStock(250);
    setInitialStockLocationId(activeLocationId === 'all' ? 'loc-vi' : activeLocationId);
    setShowAddModal(true);
  };

  const handleSaveAdd = () => {
    if (!name || !sku || !barcode) {
      alert('Please fill in product name, SKU and barcode.');
      return;
    }

    const locationStock: Record<string, ProductLocationStock> = {};
    locations.forEach((loc) => {
      const isInitial = loc.id === initialStockLocationId;
      locationStock[loc.id] = {
        onHand: isInitial ? Number(initialOpeningStock) || 0 : 0,
        reserved: 0,
        binLocation: isInitial ? 'Main Storage Facility' : 'General Yard',
        lastCountedAt: new Date().toISOString().split('T')[0],
      };
    });

    if (onAddProduct) {
      onAddProduct({
        name,
        sku: sku.toUpperCase(),
        barcode,
        category,
        subcategory,
        description: description || `${name} - Certified commercial building material.`,
        manufacturer,
        brand,
        baseUnit,
        packagingUnit,
        unitConversionFactor: Number(unitConversionFactor) || 1,
        costPrice: Number(costPrice) || 0,
        retailPrice: Number(retailPrice) || 0,
        wholesalePrice: Number(wholesalePrice) || 0,
        contractorPrice: Number(contractorPrice) || 0,
        minStockAlert: Number(minStockAlert) || 20,
        maxStockLevel: Number(maxStockLevel) || 1000,
        weightKg: Number(weightKg) || 10,
        specifications: {
          'Origin': 'Federal Republic of Nigeria',
          'Standard': 'NIS / SON Certified',
        },
        image: imageUrl.trim() || getCategoryDefaultImage(category),
        status: 'active',
        locationStock,
      });
    }
    setShowAddModal(false);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditCostPrice(prod.costPrice);
    setEditRetailPrice(prod.retailPrice);
    setEditWholesalePrice(prod.wholesalePrice);
    setEditContractorPrice(prod.contractorPrice);
    setEditBaseUnit(prod.baseUnit);
    setEditPackagingUnit(prod.packagingUnit);
    setEditConversionFactor(prod.unitConversionFactor);
    setEditMinStock(prod.minStockAlert);
    setEditImage(prod.image || '');
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    if (onUpdatePrices) {
      onUpdatePrices(editingProduct.id, {
        costPrice: Number(editCostPrice),
        retailPrice: Number(editRetailPrice),
        wholesalePrice: Number(editWholesalePrice),
        contractorPrice: Number(editContractorPrice),
      });
    }
    if (onUpdateProduct) {
      onUpdateProduct(editingProduct.id, {
        name: editName,
        baseUnit: editBaseUnit,
        packagingUnit: editPackagingUnit,
        unitConversionFactor: Number(editConversionFactor) || 1,
        minStockAlert: Number(editMinStock) || 10,
        image: editImage.trim() || getCategoryDefaultImage(editingProduct.category),
      });
    }
    setEditingProduct(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    if (onDeleteProduct) {
      onDeleteProduct(deletingProduct.id);
    }
    setDeletingProduct(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Boxes className="w-3.5 h-3.5 text-sky-600" />
            <span>Central Product Catalogue & Price Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Single Product Identity, Pricing & Unit Conversions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Company-wide SKU, Code 128 barcode, multi-tier pricing schedules (Retail, Wholesale, Contractor), and branch inventory.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowConverter(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Calculator className="w-3.5 h-3.5 text-sky-600" />
            <span>Unit Converter</span>
          </button>

          {canManageProducts && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, Barcode, Cement, Iron Rods, Roofing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition capitalize ${
                selectedCategory === c
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c === 'all' ? 'All Materials' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile Cards (<md) */}
        <div className="md:hidden divide-y divide-slate-100 p-2 space-y-3">
          {filtered.map((prod) => {
            const totalStock = Object.values(prod.locationStock).reduce((acc, loc) => acc + loc.onHand, 0);
            const isLow = totalStock <= prod.minStockAlert;

            return (
              <div key={prod.id} className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 shrink-0 shadow-2xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                        {prod.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug">{prod.name}</h3>
                      <div className="text-[11px] text-slate-500">{prod.manufacturer}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isLow
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    }`}
                  >
                    {isLow ? `Low Stock (${totalStock})` : `${totalStock} in stock`}
                  </span>
                </div>

                {/* SKU, Barcode, Packaging */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-sky-700 font-bold">
                    SKU: {prod.sku}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                    BAR: {prod.barcode}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-sans">
                    1 {prod.packagingUnit} = {prod.unitConversionFactor} {prod.baseUnit}
                  </span>
                </div>

                {/* Multi-tier Price Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs font-mono">
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block uppercase font-bold">Retail</span>
                    <span className="font-bold text-slate-900 text-sm">₦{prod.retailPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block uppercase font-bold">Wholesale</span>
                    <span className="font-semibold text-slate-700">₦{prod.wholesalePrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block uppercase font-bold">Contractor</span>
                    <span className="font-bold text-sky-800">₦{prod.contractorPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block uppercase font-bold">Cost (COGS)</span>
                    <span className="text-slate-500">₦{prod.costPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Mobile Action Touch Targets (min-h-[44px]) */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedProduct(prod)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold min-h-[44px]"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    <span>Stock</span>
                  </button>

                  {canEditPrices && (
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold min-h-[44px]"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Prices</span>
                    </button>
                  )}

                  <button
                    onClick={() => onNavigateToBarcode(prod.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold min-h-[44px]"
                  >
                    <Barcode className="w-3.5 h-3.5" />
                    <span>Barcode</span>
                  </button>

                  <button
                    onClick={() => openConverterForProduct(prod)}
                    className="p-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Calculate Unit Conversion"
                  >
                    <Calculator className="w-4 h-4 text-slate-600" />
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
                <th className="py-3 px-4">Product & Category</th>
                <th className="py-3 px-3 font-mono">SKU / Barcode</th>
                <th className="py-3 px-3">Packaging & Conversion</th>
                <th className="py-3 px-3 text-right font-mono">Retail Price</th>
                <th className="py-3 px-3 text-right font-mono">Wholesale</th>
                <th className="py-3 px-3 text-right font-mono">Contractor</th>
                <th className="py-3 px-3 text-right font-mono">Cost Price</th>
                <th className="py-3 px-3 text-right font-mono">Total Stock</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((prod) => {
                const totalStock = Object.values(prod.locationStock).reduce((acc, loc) => acc + loc.onHand, 0);
                const isLow = totalStock <= prod.minStockAlert;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
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
                          <div className="text-[11px] text-slate-400">
                            {prod.category} · {prod.manufacturer}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      <div className="font-semibold text-sky-700">{prod.sku}</div>
                      <div className="text-slate-400">{prod.barcode}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-slate-800 font-medium">{prod.baseUnit}</div>
                      <div className="text-[11px] text-slate-500">
                        1 {prod.packagingUnit} = {prod.unitConversionFactor} {prod.baseUnit}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ₦{prod.retailPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                      ₦{prod.wholesalePrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-sky-800 font-semibold tabular-nums">
                      ₦{prod.contractorPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-500 tabular-nums">
                      ₦{prod.costPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums">
                      <span className={isLow ? 'text-amber-600 font-extrabold' : 'text-slate-900'}>
                        {totalStock.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedProduct(prod)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-sky-600 transition"
                          title="View location stock breakdown"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canEditPrices && (
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-emerald-600 transition"
                            title="Edit Prices & Product Data"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onNavigateToBarcode(prod.id)}
                          className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                          title="Generate Barcode & Labels"
                        >
                          Barcode
                        </button>
                        <button
                          onClick={() => openConverterForProduct(prod)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-sky-600 transition"
                          title="Calculate Unit Conversion"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                        {canManageProducts && products.length > 1 && (
                          <button
                            onClick={() => setDeletingProduct(prod)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                            title="Archive / Remove Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4 text-sky-400" />
                  <span>Register New Product in Catalogue</span>
                </h3>
                <p className="text-[11px] text-slate-400">Adds single company-wide SKU, Code 128 barcode, and multi-tier pricing.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Material Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. BUA Cement Grade 42.5R (50kg Bag)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">SKU Identifier *</label>
                  <input
                    type="text"
                    placeholder="e.g. EET-BUA-425"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-sky-50 rounded-xl border border-sky-200">
                <div>
                  <label className="font-bold text-sky-900 uppercase text-[10px]">Initial Opening Stock (Units)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 250"
                    value={initialOpeningStock}
                    onChange={(e) => setInitialOpeningStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full mt-1 p-2 rounded-lg border border-sky-300 bg-white font-mono font-bold text-slate-900 text-sm"
                  />
                  <span className="text-[10px] text-sky-700 mt-0.5 block">Immediately recorded and available for sale at POS.</span>
                </div>
                <div>
                  <label className="font-bold text-sky-900 uppercase text-[10px]">Allocated Facility for Stock</label>
                  <select
                    value={initialStockLocationId}
                    onChange={(e) => setInitialStockLocationId(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-sky-300 bg-white font-medium text-xs text-slate-800"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Barcode (Code 128) *</label>
                  <input
                    type="text"
                    placeholder="e.g. 111005991823"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Category *</label>
                  <input
                    type="text"
                    placeholder="e.g. Cement & Binders"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Manufacturer / Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. BUA Cement Plc"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-700 uppercase">
                  Multi-Tier Pricing Schedules (Nigerian Naira ₦)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Cost Price (COGS)</label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full mt-1 p-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Retail Price</label>
                    <input
                      type="number"
                      value={retailPrice}
                      onChange={(e) => setRetailPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full mt-1 p-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Wholesale Price</label>
                    <input
                      type="number"
                      value={wholesalePrice}
                      onChange={(e) => setWholesalePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full mt-1 p-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Contractor Tier</label>
                    <input
                      type="number"
                      value={contractorPrice}
                      onChange={(e) => setContractorPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full mt-1 p-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-sky-800"
                    />
                  </div>
                </div>
              </div>

              {/* Units & Conversions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Base Retail Unit *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bag (50kg) / Length (12m)"
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Packaging Bulk Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Pallet / Bundle / Carton"
                    value={packagingUnit}
                    onChange={(e) => setPackagingUnit(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Conversion Factor</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={unitConversionFactor}
                    onChange={(e) => setUnitConversionFactor(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Min Stock Alert</label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(parseInt(e.target.value, 10) || 10)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Unit Weight (Kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Subcategory</label>
                  <input
                    type="text"
                    placeholder="e.g. Construction Chemicals"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Product Image Upload, URL & Removal Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 uppercase text-[10px] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                    <span>Product Photography & Image</span>
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Image</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Image Preview Thumbnail */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 relative group shadow-2xs">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&auto=format&fit=crop&q=80';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <ImageIcon className="w-6 h-6 mx-auto stroke-1" />
                        <span className="text-[9px] block mt-1 font-medium">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & URL Input */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Device / Camera</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, setImageUrl)}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setImageUrl(getCategoryDefaultImage(category))}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Use Category Default</span>
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Or paste image URL (https://...)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono text-[11px]"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Supports local device photos (JPEG, PNG, WebP) or web image URLs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleSaveAdd}
                className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs"
              >
                Register & Add to Catalogue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Prices & Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-sky-400 font-mono">{editingProduct.sku}</span>
                <h3 className="text-sm font-bold">Edit Prices & Specifications</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Material Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 uppercase text-[10px]">Price Revision (₦)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold">Retail Price (Walk-in)</label>
                    <input
                      type="number"
                      value={editRetailPrice}
                      onChange={(e) => setEditRetailPrice(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold">Wholesale Tier</label>
                    <input
                      type="number"
                      value={editWholesalePrice}
                      onChange={(e) => setEditWholesalePrice(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold">Contractor Price</label>
                    <input
                      type="number"
                      value={editContractorPrice}
                      onChange={(e) => setEditContractorPrice(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-sky-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 font-bold">Cost Price (COGS)</label>
                    <input
                      type="number"
                      value={editCostPrice}
                      onChange={(e) => setEditCostPrice(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Base Unit</label>
                  <input
                    type="text"
                    value={editBaseUnit}
                    onChange={(e) => setEditBaseUnit(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Packaging Unit</label>
                  <input
                    type="text"
                    value={editPackagingUnit}
                    onChange={(e) => setEditPackagingUnit(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Factor</label>
                  <input
                    type="number"
                    value={editConversionFactor}
                    onChange={(e) => setEditConversionFactor(parseFloat(e.target.value) || 1)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Product Image Upload, URL & Removal Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 uppercase text-[10px] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                    <span>Product Photography & Image</span>
                  </label>
                  {editImage && (
                    <button
                      type="button"
                      onClick={() => setEditImage('')}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Image</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Current Image Preview */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 relative group shadow-2xs">
                    {editImage ? (
                      <>
                        <img
                          src={editImage}
                          alt={editName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&auto=format&fit=crop&q=80';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setEditImage('')}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <ImageIcon className="w-6 h-6 mx-auto stroke-1" />
                        <span className="text-[9px] block mt-1 font-medium">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & URL Input */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Device / Camera</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, setEditImage)}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setEditImage(getCategoryDefaultImage(editingProduct.category))}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Category Photo</span>
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Or paste external image URL (https://...)"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono text-[11px]"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Upload a photo from your phone/PC or paste an external link. Click &quot;Apply &amp; Log Revision&quot; to save.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setEditingProduct(null)} className="px-4 py-2 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-xs"
              >
                Apply & Log Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-300 p-5 space-y-4 text-slate-900">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Archive Catalogue Material</span>
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to archive <strong>{deletingProduct.name}</strong> ({deletingProduct.sku})? All past sales and stock histories remain preserved in the cryptographic audit trail.
            </p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setDeletingProduct(null)} className="px-3 py-1.5 font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details & Location Breakdown Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-sky-400 font-mono uppercase">{selectedProduct.sku}</span>
                <h3 className="text-sm font-bold">{selectedProduct.name}</h3>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              <div className="flex flex-col sm:flex-row gap-4 items-start pb-2 border-b border-slate-100">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full sm:w-36 h-28 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                      {selectedProduct.category}
                    </span>
                    {canEditPrices && (
                      <button
                        onClick={() => {
                          const p = selectedProduct;
                          setSelectedProduct(null);
                          handleOpenEdit(p);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Photo & Prices</span>
                      </button>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm leading-snug">{selectedProduct.name}</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{selectedProduct.description}</p>
                </div>
              </div>

              {/* Specifications Matrix */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">Technical Specifications</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500">{key}:</span>
                      <span className="font-semibold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Stock Matrix */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Location-Specific Stock Balances</h4>
                <div className="space-y-2">
                  {locations.map((loc) => {
                    const stock = selectedProduct.locationStock[loc.id] || { onHand: 0, reserved: 0, binLocation: 'None', lastCountedAt: '' };
                    return (
                      <div key={loc.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{loc.name}</div>
                          <div className="text-[11px] text-slate-500">
                            Storage Bin: <span className="font-mono">{stock.binLocation}</span> · Last Counted: {stock.lastCountedAt || 'Recent'}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                            {stock.onHand} {selectedProduct.baseUnit}
                          </div>
                          {stock.reserved > 0 && (
                            <div className="text-[10px] text-amber-600 font-mono">
                              ({stock.reserved} reserved)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  onNavigateToTransfer(selectedProduct.id);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition shadow-xs"
              >
                Initiate Inter-Branch Transfer
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unit Conversion Calculator Modal */}
      {showConverter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Calculator className="w-4 h-4 text-sky-400" />
                <span>Building Materials Packaging & Unit Converter</span>
              </h3>
              <button onClick={() => setShowConverter(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                Instantly convert between bulk wholesale packaging (cartons, pallets, bundles, tippers) and individual retail selling units (pieces, bags, metres).
              </p>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Conversion Direction</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setConvertDir('packaging_to_base')}
                    className={`p-2 rounded-lg border text-center font-medium transition ${
                      convertDir === 'packaging_to_base'
                        ? 'bg-sky-50 border-sky-500 text-sky-700 font-bold'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {packagingUnitName} → {baseUnitName}
                  </button>
                  <button
                    onClick={() => setConvertDir('base_to_packaging')}
                    className={`p-2 rounded-lg border text-center font-medium transition ${
                      convertDir === 'base_to_packaging'
                        ? 'bg-sky-50 border-sky-500 text-sky-700 font-bold'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {baseUnitName} → {packagingUnitName}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Quantity to Convert</label>
                  <input
                    type="number"
                    min="1"
                    value={convertQty}
                    onChange={(e) => setConvertQty(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Factor (Units per Package)</label>
                  <input
                    type="number"
                    min="1"
                    value={activeConvertFactor}
                    onChange={(e) => setActiveConvertFactor(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-sm"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white text-center space-y-1">
                <div className="text-[11px] text-slate-400">Calculated Available Quantity</div>
                <div className="text-2xl font-bold font-mono text-sky-400">
                  {convertedResult.toLocaleString()}{' '}
                  <span className="text-sm font-sans text-white">
                    {convertDir === 'packaging_to_base' ? baseUnitName : packagingUnitName}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Example: 100 Cartons × 20 Pcs = 2,000 Pcs ready for retail POS deduction.
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowConverter(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
