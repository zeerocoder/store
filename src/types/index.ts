export type LocationType = 'retail_branch' | 'warehouse' | 'distribution_center' | 'yard';

export interface Location {
  id: string;
  name: string;
  code: string;
  type: LocationType;
  city: string;
  state: string;
  address: string;
  phone: string;
  managerName: string;
  isActive: boolean;
  totalCapacityTons: number;
}

export type StaffRole =
  | 'owner'
  | 'general_manager'
  | 'branch_manager'
  | 'inventory_manager'
  | 'warehouse_officer'
  | 'cashier'
  | 'sales_rep'
  | 'accountant'
  | 'delivery_personnel';

export interface RolePrivileges {
  roleTitle: string;
  canSwitchLocations: boolean;
  canViewAllLocations: boolean;
  canViewExecutiveFinancials: boolean; // P&L, Net Margins, Company-Wide Gross Sales
  canProcessSales: boolean;
  canApproveDiscounts: boolean;
  maxDiscountPercent: number;
  canAdjustStock: boolean;
  canApproveStockAdjustments: boolean;
  canInitiateTransfers: boolean;
  canDispatchTransfers: boolean;
  canReceiveTransfers: boolean;
  canViewAuditTrail: boolean;
  canManageSuppliers: boolean;
  canManageFleet: boolean;
  allowedTabs: string[];
  description: string;
  grantedPrivileges: string[];
  restrictedPrivileges: string[];
}

export const ROLE_PRIVILEGES: Record<StaffRole, RolePrivileges> = {
  owner: {
    roleTitle: 'Chief Executive & System Administrator',
    canSwitchLocations: true,
    canViewAllLocations: true,
    canViewExecutiveFinancials: true,
    canProcessSales: true,
    canApproveDiscounts: true,
    maxDiscountPercent: 50,
    canAdjustStock: true,
    canApproveStockAdjustments: true,
    canInitiateTransfers: true,
    canDispatchTransfers: true,
    canReceiveTransfers: true,
    canViewAuditTrail: true,
    canManageSuppliers: true,
    canManageFleet: true,
    allowedTabs: [
      'dashboard',
      'pos',
      'products',
      'inventory',
      'transfers',
      'locations',
      'staff',
      'barcode',
      'scanner',
      'storefront',
      'projects',
      'deliveries',
      'purchasing',
      'finance',
      'approvals',
      'audit',
    ],
    description: 'Sovereign administrative authority over all company outlets, distribution warehouses, financials, and approvals.',
    grantedPrivileges: [
      'Consolidated Multi-Location View',
      'Full P&L & Net Profit Visibility',
      'All Sensitive Operation Approvals',
      'Unlimited Transfer & Stock Controls',
      'Complete Cryptographic Audit Logs',
    ],
    restrictedPrivileges: [],
  },
  general_manager: {
    roleTitle: 'General Operations Manager',
    canSwitchLocations: true,
    canViewAllLocations: true,
    canViewExecutiveFinancials: true,
    canProcessSales: true,
    canApproveDiscounts: true,
    maxDiscountPercent: 25,
    canAdjustStock: true,
    canApproveStockAdjustments: true,
    canInitiateTransfers: true,
    canDispatchTransfers: true,
    canReceiveTransfers: true,
    canViewAuditTrail: true,
    canManageSuppliers: true,
    canManageFleet: true,
    allowedTabs: [
      'dashboard',
      'pos',
      'products',
      'inventory',
      'transfers',
      'locations',
      'staff',
      'barcode',
      'scanner',
      'storefront',
      'projects',
      'deliveries',
      'purchasing',
      'finance',
      'approvals',
      'audit',
    ],
    description: 'Executive management oversight over all branch operations, inter-branch logistics, and employee authorizations.',
    grantedPrivileges: [
      'Multi-Branch Switching',
      'Executive P&L & Margins',
      'Approvals Authority (Up to 25%)',
      'Cross-Location Inventory Allocation',
    ],
    restrictedPrivileges: [],
  },
  branch_manager: {
    roleTitle: 'Branch & Yard Manager',
    canSwitchLocations: false,
    canViewAllLocations: false,
    canViewExecutiveFinancials: false,
    canProcessSales: true,
    canApproveDiscounts: true,
    maxDiscountPercent: 12,
    canAdjustStock: true,
    canApproveStockAdjustments: false,
    canInitiateTransfers: true,
    canDispatchTransfers: true,
    canReceiveTransfers: true,
    canViewAuditTrail: false,
    canManageSuppliers: false,
    canManageFleet: true,
    allowedTabs: [
      'dashboard',
      'pos',
      'products',
      'inventory',
      'transfers',
      'barcode',
      'scanner',
      'storefront',
      'deliveries',
      'approvals',
    ],
    description: 'On-site operations lead responsible for daily branch sales, yard inventory, driver dispatch, and staff compliance.',
    grantedPrivileges: [
      'Branch Sales Register & POS',
      'Discount Approvals (Up to 12%)',
      'Branch Inventory Coordinates',
      'Transfer Dispatch & Inbound Acceptance',
      'Local Delivery Logistics',
    ],
    restrictedPrivileges: [
      'Multi-Branch Switching (Locked to Assigned Branch)',
      'Company-Wide Financials & Net Profit',
      'Discounts above 12%',
      'Stock Adjustments > ₦100,000 without GM approval',
    ],
  },
  inventory_manager: {
    roleTitle: 'Corporate Inventory & Supply Chain Manager',
    canSwitchLocations: true,
    canViewAllLocations: true,
    canViewExecutiveFinancials: false,
    canProcessSales: false,
    canApproveDiscounts: false,
    maxDiscountPercent: 0,
    canAdjustStock: true,
    canApproveStockAdjustments: true,
    canInitiateTransfers: true,
    canDispatchTransfers: true,
    canReceiveTransfers: true,
    canViewAuditTrail: true,
    canManageSuppliers: true,
    canManageFleet: true,
    allowedTabs: [
      'dashboard',
      'inventory',
      'products',
      'transfers',
      'barcode',
      'scanner',
      'purchasing',
      'approvals',
      'audit',
    ],
    description: 'Company-wide inventory valuation, central stock replenishment, inter-branch logistics balance, and supplier procurement.',
    grantedPrivileges: [
      'Multi-Location Inventory Balancing',
      'Stock Adjustments & Approval Authority',
      'Inter-Branch Transfer Authorization',
      'Barcode Catalogue Management',
      'Supplier Purchase Orders',
    ],
    restrictedPrivileges: [
      'Executive Financial P&L & Net Margins',
      'Counter POS Sales Processing',
    ],
  },
  cashier: {
    roleTitle: 'Senior Counter Cashier',
    canSwitchLocations: false,
    canViewAllLocations: false,
    canViewExecutiveFinancials: false,
    canProcessSales: true,
    canApproveDiscounts: false,
    maxDiscountPercent: 5,
    canAdjustStock: false,
    canApproveStockAdjustments: false,
    canInitiateTransfers: false,
    canDispatchTransfers: false,
    canReceiveTransfers: false,
    canViewAuditTrail: false,
    canManageSuppliers: false,
    canManageFleet: false,
    allowedTabs: ['dashboard', 'pos', 'products', 'scanner', 'storefront'],
    description: 'High-speed counter POS operations, customer receipts, cashier till reconciliation, and local branch stock checks.',
    grantedPrivileges: [
      'POS Terminal & Split Payments',
      'Assigned Counter Shift Register',
      'Product Price & Local Stock Lookup',
      'Thermal Receipt Generation',
    ],
    restrictedPrivileges: [
      'Multi-Branch Access (Locked to Branch)',
      'Executive P&L & Financial Margins',
      'Manual Cost Price Changes',
      'Discounts above 5% (Requires Approval)',
      'Stock Adjustments & Write-Offs',
    ],
  },
  warehouse_officer: {
    roleTitle: 'Warehouse Logistics Officer',
    canSwitchLocations: false,
    canViewAllLocations: false,
    canViewExecutiveFinancials: false,
    canProcessSales: false,
    canApproveDiscounts: false,
    maxDiscountPercent: 0,
    canAdjustStock: true,
    canApproveStockAdjustments: false,
    canInitiateTransfers: true,
    canDispatchTransfers: true,
    canReceiveTransfers: true,
    canViewAuditTrail: false,
    canManageSuppliers: true,
    canManageFleet: true,
    allowedTabs: ['dashboard', 'inventory', 'transfers', 'barcode', 'scanner', 'purchasing'],
    description: 'Central distribution storage control, bin coordinate tracking, goods receiving, and inter-branch transit dispatch.',
    grantedPrivileges: [
      'Warehouse Inventory Coordinates & Bins',
      'Stock Transfer Dispatch & Goods Receiving',
      'Cycle Stock Counting & Adjustments',
      'Barcode Label Generation & Printing',
      'Camera & Hardware Barcode Scanning',
    ],
    restrictedPrivileges: [
      'POS Sales & Cash Register',
      'Company Profit & Margins',
      'Unsupervised Stock Write-Offs > ₦50,000',
      'Customer Credit Access',
    ],
  },
  accountant: {
    roleTitle: 'Chief Financial Officer & Internal Auditor',
    canSwitchLocations: true,
    canViewAllLocations: true,
    canViewExecutiveFinancials: true,
    canProcessSales: false,
    canApproveDiscounts: true,
    maxDiscountPercent: 20,
    canAdjustStock: false,
    canApproveStockAdjustments: true,
    canInitiateTransfers: false,
    canDispatchTransfers: false,
    canReceiveTransfers: false,
    canViewAuditTrail: true,
    canManageSuppliers: true,
    canManageFleet: false,
    allowedTabs: ['dashboard', 'finance', 'purchasing', 'audit', 'approvals'],
    description: 'Financial ledger oversight, daily cash drawer reconciliation, operating overheads, and merchant gateway settlements.',
    grantedPrivileges: [
      'Company P&L Statement & Margins',
      'All Branch Cash Drawer Audits',
      'Operating Expenses Ledger',
      'Paystack & Flutterwave Reconciliation',
      'Immutable Audit Trail Review',
    ],
    restrictedPrivileges: [
      'Direct POS Sales Processing',
    ],
  },
  delivery_personnel: {
    roleTitle: 'Fleet & Dispatch Driver',
    canSwitchLocations: false,
    canViewAllLocations: false,
    canViewExecutiveFinancials: false,
    canProcessSales: false,
    canApproveDiscounts: false,
    maxDiscountPercent: 0,
    canAdjustStock: false,
    canApproveStockAdjustments: false,
    canInitiateTransfers: false,
    canDispatchTransfers: false,
    canReceiveTransfers: true,
    canViewAuditTrail: false,
    canManageSuppliers: false,
    canManageFleet: true,
    allowedTabs: ['dashboard', 'deliveries', 'scanner'],
    description: 'Heavy construction materials transport, haulage truck runs, and on-site customer proof-of-delivery confirmation.',
    grantedPrivileges: [
      'Assigned Delivery Runs & Route',
      'Customer Site Address & Contact',
      'Digital Proof of Delivery (POD) Sign-off',
    ],
    restrictedPrivileges: [
      'POS & Financial Records',
      'Inventory Adjustments',
      'Multi-Branch Switching',
    ],
  },
  sales_rep: {
    roleTitle: 'Contractor & Institutional Projects Rep',
    canSwitchLocations: false,
    canViewAllLocations: false,
    canViewExecutiveFinancials: false,
    canProcessSales: true,
    canApproveDiscounts: false,
    maxDiscountPercent: 8,
    canAdjustStock: false,
    canApproveStockAdjustments: false,
    canInitiateTransfers: false,
    canDispatchTransfers: false,
    canReceiveTransfers: false,
    canViewAuditTrail: false,
    canManageSuppliers: false,
    canManageFleet: false,
    allowedTabs: ['dashboard', 'projects', 'products', 'storefront', 'pos'],
    description: 'Contractor relationship management, bulk construction material quotations, and credit limit tracking.',
    grantedPrivileges: [
      'Contractor Projects Dossiers',
      'Material Quotation Generation',
      'Contractor Tiered Pricing',
      'Storefront Product Catalogue',
    ],
    restrictedPrivileges: [
      'Company P&L & Operating Overhead',
      'Multi-Branch Access',
      'Stock Adjustments',
    ],
  },
};

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  assignedLocationId: string | 'all';
  department: string;
  phone: string;
  avatar: string;
  isActive?: boolean;
  activeShift?: boolean;
}

export interface ProductLocationStock {
  onHand: number;
  reserved: number;
  binLocation: string;
  lastCountedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  subcategory: string;
  description: string;
  manufacturer: string;
  brand: string;
  baseUnit: string;
  packagingUnit: string;
  unitConversionFactor: number;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  contractorPrice: number;
  minStockAlert: number;
  maxStockLevel: number;
  weightKg: number;
  locationStock: Record<string, ProductLocationStock>;
  specifications: Record<string, string>;
  image: string;
  status: 'active' | 'archived';
  createdAt: string;
}

export type TransferStatus = 'requested' | 'approved' | 'dispatched' | 'in_transit' | 'received' | 'completed' | 'rejected';

export interface StockTransferItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  requestedQty: number;
  dispatchedQty?: number;
  receivedQty?: number;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  sourceLocationId: string;
  destinationLocationId: string;
  items: StockTransferItem[];
  status: TransferStatus;
  requestedBy: string;
  requestedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  dispatchedBy?: string;
  receivedBy?: string;
  driverName?: string;
  vehiclePlate?: string;
  trackingNotes?: string;
  discrepancyNotes?: string;
  createdAt: string;
  dispatchedAt?: string;
  receivedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  priceType: 'retail' | 'wholesale' | 'contractor';
  unitPrice: number;
  subtotal: number;
}

export type PaymentMethodType = 'cash' | 'bank_transfer' | 'pos_card' | 'paystack' | 'flutterwave' | 'credit';

export interface SplitPaymentRecord {
  method: PaymentMethodType;
  amount: number;
  reference?: string;
  channelDetails?: string;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  branchId: string;
  branchName: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  pricingTier: 'retail' | 'wholesale' | 'contractor';
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    costPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  discountApprovedBy?: string;
  taxAmount: number;
  totalAmount: number;
  costTotal: number;
  grossProfit: number;
  payments: SplitPaymentRecord[];
  paymentStatus: 'paid' | 'partial' | 'credit' | 'refunded';
  notes?: string;
  createdAt: string;
}

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  fulfillmentLocationId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }>;
  itemsSubtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentGateway: 'paystack' | 'flutterwave' | 'bank_transfer';
  paymentReference: string;
  paymentStatus: 'paid' | 'pending_verification' | 'failed';
  fulfillmentStatus: 'order_received' | 'processing' | 'ready_for_dispatch' | 'dispatched' | 'delivered';
  assignedDriver?: string;
  assignedVehicle?: string;
  estimatedDeliveryDate: string;
  createdAt: string;
}

export interface ContractorInvoiceAging {
  current: number; // 0-30 days
  days30To60: number; // 31-60 days
  days61To90: number; // 61-90 days
  over90Days: number; // > 90 days
  isCreditLocked: boolean;
}

export interface ContractorProject {
  id: string;
  contractorName: string;
  companyName: string;
  projectName: string;
  siteLocation: string;
  contactPhone: string;
  creditLimit: number;
  outstandingBalance: number;
  totalPurchased: number;
  assignedSalesRep: string;
  status: 'active' | 'completed' | 'on_hold';
  notes?: string;
  agingSummary?: ContractorInvoiceAging;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  contractorProjectId?: string;
  clientName: string;
  projectName: string;
  clientPhone: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }>;
  totalAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'converted';
  validUntil: string;
  preparedBy: string;
  createdAt: string;
}

export interface DeliveryVehicle {
  id: string;
  vehicleNumber: string;
  model: string;
  capacityTons: number;
  assignedDriver: string;
  driverPhone: string;
  status: 'available' | 'on_delivery' | 'maintenance';
}

export interface DeliveryRun {
  id: string;
  runNumber: string;
  vehicleId: string;
  driverName: string;
  destinationAddress: string;
  orderOrSaleRef: string;
  cargoDescription: string;
  weightTons: number;
  dispatchTime: string;
  deliveredTime?: string;
  status: 'scheduled' | 'in_transit' | 'delivered';
  proofNotes?: string;
}

export interface CashDenominationCount {
  n1000: number;
  n500: number;
  n200: number;
  n100: number;
  n50: number;
}

export interface MidDayCashDrop {
  id: string;
  amount: number;
  time: string;
  droppedBy: string;
  witnessName: string;
  vaultReceiptNumber: string;
}

export interface CashRegisterSession {
  id: string;
  branchId: string;
  cashierId: string;
  cashierName: string;
  openingCash: number;
  cashSalesRecorded: number;
  cashPaidOut: number;
  expectedClosingCash: number;
  actualClosingCash?: number;
  discrepancy?: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  notes?: string;
  midDayDrops?: MidDayCashDrop[];
  blindDenominations?: CashDenominationCount;
}

export interface WaybillItem {
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
  weightTons: number;
}

export interface Waybill {
  id: string;
  waybillNumber: string;
  saleOrOrderId: string;
  dispatchLocationId: string;
  dispatchLocationName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  vehiclePlateNumber: string;
  driverName: string;
  driverPhone: string;
  transporterCompany: string;
  items: WaybillItem[];
  totalWeightTons: number;
  dispatchTimestamp: string;
  dispatchedBy: string;
  securityOfficerName: string;
  status: 'issued' | 'in_transit' | 'delivered';
  notes?: string;
}

export interface GatePass {
  id: string;
  passNumber: string;
  waybillNumber: string;
  vehiclePlateNumber: string;
  driverName: string;
  driverPhone: string;
  destination: string;
  cargoSummary: string;
  weighbridgeGrossTons: number;
  weighbridgeTareTons: number;
  netPayloadTons: number;
  timeIn: string;
  timeOut: string;
  securityCheckPassed: boolean;
  securityOfficer: string;
}

export interface GrnItem {
  productId: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  damagedQty: number;
  unit: string;
  unitPurchaseCost: number;
  apportionedHaulageCost: number;
  finalLandedUnitCost: number;
}

export interface GoodsReceivedNote {
  id: string;
  grnNumber: string;
  supplierId: string;
  supplierName: string;
  locationId: string;
  locationName: string;
  receivedDate: string;
  purchaseOrderRef: string;
  supplierInvoiceRef: string;
  haulageTransporter: string;
  haulageCost: number;
  offloadingUnionLevy: number;
  items: GrnItem[];
  totalInvoiceAmount: number;
  totalLandedCost: number;
  inspectedBy: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  branchId: string;
  branchName: string;
  category: 'diesel_generator' | 'fleet_fuel' | 'truck_maintenance' | 'rent' | 'utilities' | 'wages' | 'offloading_labor' | 'office_supplies';
  description: string;
  amount: number;
  recordedBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'paid';
  referenceReceipt?: string;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  actionType: 'discount' | 'price_override' | 'stock_adjustment' | 'stock_writeoff' | 'refund' | 'credit_sale' | 'expense' | 'stock_transfer';
  requestedBy: string;
  requestedByName: string;
  userRole: StaffRole;
  branchId: string;
  branchName: string;
  description: string;
  value: number;
  details: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  resolvedBy?: string;
  resolvedByName?: string;
  rejectionReason?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: StaffRole;
  locationId: string;
  locationName: string;
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categoriesSupplied: string[];
  paymentTerms: string;
  outstandingBalance: number;
}

export interface StorefrontSettings {
  storeName: string;
  tagline: string;
  bannerHeadline: string;
  bannerSubheadline: string;
  announcementBarText: string;
  showAnnouncement: boolean;
  supportPhone: string;
  supportEmail: string;
  salesWhatsApp: string;
  centralDepotAddress: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  paystackEnabled: boolean;
  flutterwaveEnabled: boolean;
  bankTransferEnabled: boolean;
  freeDeliveryThresholdTons: number;
}

