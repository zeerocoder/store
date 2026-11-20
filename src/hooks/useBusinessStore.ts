import { useState, useEffect, useCallback } from 'react';
import {
  Location,
  StaffUser,
  Product,
  StockTransfer,
  Sale,
  OnlineOrder,
  ContractorProject,
  Quotation,
  DeliveryVehicle,
  ExpenseRecord,
  ApprovalRequest,
  AuditLogEntry,
  Supplier,
  SplitPaymentRecord,
  CashRegisterSession,
  StorefrontSettings,
  ProductLocationStock,
  Waybill,
  GatePass,
  GoodsReceivedNote,
  CashDenominationCount,
  MidDayCashDrop,
} from '../types';
import {
  INITIAL_LOCATIONS,
  INITIAL_STAFF,
  INITIAL_PRODUCTS,
  INITIAL_TRANSFERS,
  INITIAL_SALES,
  INITIAL_ONLINE_ORDERS,
  INITIAL_PROJECTS,
  INITIAL_QUOTATIONS,
  INITIAL_VEHICLES,
  INITIAL_EXPENSES,
  INITIAL_APPROVALS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SUPPLIERS,
  INITIAL_STOREFRONT_SETTINGS,
  INITIAL_WAYBILLS,
  INITIAL_GATE_PASSES,
  INITIAL_GRN,
} from '../data/initialData';
import {
  requiresApproval,
  DEFAULT_APPROVAL_THRESHOLDS,
} from '../utils/businessLogic';
import {
  safeLocalStorageSet,
  syncCollectionToIndexedDB,
  loadCollectionFromIndexedDB,
} from '../utils/imageStorage';

const STORAGE_KEY = 'elite_energy_business_db_v1';

export function useBusinessStore() {
  // Load saved state or fall back to rich initial data
  const [locations, setLocations] = useState<Location[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_locations`);
      return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
    } catch {
      return INITIAL_LOCATIONS;
    }
  });

  const [staff, setStaff] = useState<StaffUser[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_staff`);
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [storefrontSettings, setStorefrontSettings] = useState<StorefrontSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_storefront`);
      return saved ? JSON.parse(saved) : INITIAL_STOREFRONT_SETTINGS;
    } catch {
      return INITIAL_STOREFRONT_SETTINGS;
    }
  });

  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [vehicles] = useState<DeliveryVehicle[]>(INITIAL_VEHICLES);

  // Active view context - remember chosen operator across reloads
  const [currentUser, setCurrentUser] = useState<StaffUser>(() => {
    try {
      const savedId = localStorage.getItem(`${STORAGE_KEY}_current_user_id`);
      const savedStaff = localStorage.getItem(`${STORAGE_KEY}_staff`);
      const list: StaffUser[] = savedStaff ? JSON.parse(savedStaff) : INITIAL_STAFF;
      if (savedId) {
        const found = list.find((s) => s.id === savedId);
        if (found) return found;
      }
      return list[0] || INITIAL_STAFF[0];
    } catch {
      return INITIAL_STAFF[0];
    }
  });
  const [activeLocationId, setActiveLocationId] = useState<string>('all'); // 'all' or locationId
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Dynamic state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sales`);
      return saved ? JSON.parse(saved) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
      return saved ? JSON.parse(saved) : INITIAL_ONLINE_ORDERS;
    } catch {
      return INITIAL_ONLINE_ORDERS;
    }
  });

  const [transfers, setTransfers] = useState<StockTransfer[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transfers`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
    } catch {
      return INITIAL_TRANSFERS;
    }
  });

  const [projects, setProjects] = useState<ContractorProject[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_quotations`);
      return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
    } catch {
      return INITIAL_QUOTATIONS;
    }
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_approvals`);
      return saved ? JSON.parse(saved) : INITIAL_APPROVALS;
    } catch {
      return INITIAL_APPROVALS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [waybills, setWaybills] = useState<Waybill[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_waybills`);
      return saved ? JSON.parse(saved) : INITIAL_WAYBILLS;
    } catch {
      return INITIAL_WAYBILLS;
    }
  });

  const [gatePasses, setGatePasses] = useState<GatePass[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_gatepasses`);
      return saved ? JSON.parse(saved) : INITIAL_GATE_PASSES;
    } catch {
      return INITIAL_GATE_PASSES;
    }
  });

  const [goodsReceivedNotes, setGoodsReceivedNotes] = useState<GoodsReceivedNote[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_grn`);
      return saved ? JSON.parse(saved) : INITIAL_GRN;
    } catch {
      return INITIAL_GRN;
    }
  });

  const [cashRegister, setCashRegister] = useState<CashRegisterSession>({
    id: 'reg-session-today',
    branchId: 'loc-vi',
    cashierId: 'usr-cashier-vi',
    cashierName: 'Grace Bassey',
    openingCash: 50000,
    cashSalesRecorded: 440400,
    cashPaidOut: 0,
    expectedClosingCash: 490400,
    status: 'open',
    openedAt: '2026-11-19T07:45:00Z',
    midDayDrops: [
      {
        id: 'drop-001',
        amount: 200000,
        time: '12:30 PM',
        droppedBy: 'Grace Bassey (Cashier)',
        witnessName: 'Chioma Okonkwo (Regional Dir)',
        vaultReceiptNumber: 'VLT-REC-081',
      },
    ],
  });

  // Hydrate data from IndexedDB on startup (ensures offline persistence even if localStorage was pruned)
  useEffect(() => {
    let mounted = true;
    loadCollectionFromIndexedDB<Product>('products').then((idbProducts) => {
      if (mounted && idbProducts && idbProducts.length > 0) {
        setProducts((prev) => {
          // If indexedDB has custom images or a larger/custom catalog, merge/restore
          const hasCustom = idbProducts.some((p) => p.image?.startsWith('data:') || p.id.startsWith('prod-'));
          return hasCustom || idbProducts.length > prev.length ? idbProducts : prev;
        });
      }
    }).catch(() => {});

    loadCollectionFromIndexedDB<StaffUser>('staff').then((idbStaff) => {
      if (mounted && idbStaff && idbStaff.length > 0) {
        setStaff((prev) => {
          const hasCustom = idbStaff.some((s) => s.avatar?.startsWith('data:') || s.id.startsWith('usr-'));
          return hasCustom || idbStaff.length > prev.length ? idbStaff : prev;
        });
      }
    }).catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Dual-Layer Sync: Safe localStorage with per-key boundary + IndexedDB high-capacity store
  useEffect(() => {
    safeLocalStorageSet(`${STORAGE_KEY}_locations`, JSON.stringify(locations));
    safeLocalStorageSet(`${STORAGE_KEY}_staff`, JSON.stringify(staff));
    safeLocalStorageSet(`${STORAGE_KEY}_storefront`, JSON.stringify(storefrontSettings));
    safeLocalStorageSet(`${STORAGE_KEY}_products`, JSON.stringify(products));
    safeLocalStorageSet(`${STORAGE_KEY}_sales`, JSON.stringify(sales));
    safeLocalStorageSet(`${STORAGE_KEY}_orders`, JSON.stringify(onlineOrders));
    safeLocalStorageSet(`${STORAGE_KEY}_transfers`, JSON.stringify(transfers));
    safeLocalStorageSet(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
    safeLocalStorageSet(`${STORAGE_KEY}_quotations`, JSON.stringify(quotations));
    safeLocalStorageSet(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
    safeLocalStorageSet(`${STORAGE_KEY}_approvals`, JSON.stringify(approvals));
    safeLocalStorageSet(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
    safeLocalStorageSet(`${STORAGE_KEY}_waybills`, JSON.stringify(waybills));
    safeLocalStorageSet(`${STORAGE_KEY}_gatepasses`, JSON.stringify(gatePasses));
    safeLocalStorageSet(`${STORAGE_KEY}_grn`, JSON.stringify(goodsReceivedNotes));
    safeLocalStorageSet(`${STORAGE_KEY}_current_user_id`, currentUser.id);

    // Asynchronously mirror high-capacity stores to IndexedDB
    syncCollectionToIndexedDB('products', products).catch(() => {});
    syncCollectionToIndexedDB('staff', staff).catch(() => {});
  }, [
    locations,
    staff,
    storefrontSettings,
    products,
    sales,
    onlineOrders,
    transfers,
    projects,
    quotations,
    expenses,
    approvals,
    auditLogs,
    waybills,
    gatePasses,
    goodsReceivedNotes,
    currentUser.id,
  ]);

  // Helper to append immutable audit log
  const logAudit = useCallback((action: string, details: string, previousValue?: string, newValue?: string) => {
    const locName = locations.find(l => l.id === activeLocationId)?.name || 'Central Management';
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      locationId: activeLocationId === 'all' ? (currentUser.assignedLocationId === 'all' ? 'loc-vi' : currentUser.assignedLocationId) : activeLocationId,
      locationName: locName,
      action,
      details,
      previousValue,
      newValue,
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  }, [activeLocationId, currentUser, locations]);

  // Switch employee user (enforces location lock for staff and persists active user)
  const switchUser = useCallback((userId: string) => {
    const selected = staff.find(s => s.id === userId);
    if (!selected) return;
    setCurrentUser(selected);
    safeLocalStorageSet(`${STORAGE_KEY}_current_user_id`, selected.id);
    if (selected.assignedLocationId !== 'all') {
      setActiveLocationId(selected.assignedLocationId);
    }
    logAudit('USER_SWITCH', `Switched active operator account to ${selected.name} (${selected.role}).`);
  }, [staff, logAudit]);

  // Switch viewing location (restricted to owner, GM, accountant)
  const setViewingLocation = useCallback((locId: string) => {
    if (currentUser.assignedLocationId !== 'all' && currentUser.assignedLocationId !== locId) {
      // Cashier or branch manager cannot view another branch
      return;
    }
    setActiveLocationId(locId);
  }, [currentUser]);

  // Complete a POS Sale
  const processPosSale = useCallback((saleData: {
    items: Array<{ product: Product; quantity: number; unitPrice: number; pricingTier: 'retail' | 'wholesale' | 'contractor' }>;
    discountPercent: number;
    discountReason?: string;
    customerName: string;
    customerPhone?: string;
    pricingTier: 'retail' | 'wholesale' | 'contractor';
    payments: SplitPaymentRecord[];
  }) => {
    const branchId = activeLocationId === 'all' ? 'loc-vi' : activeLocationId;
    const branchName = locations.find(l => l.id === branchId)?.name || 'Victoria Island Central Hub';

    // Verify stock availability
    for (const item of saleData.items) {
      const stock = item.product.locationStock[branchId]?.onHand || 0;
      if (stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name} at ${branchName}. Available: ${stock}, Requested: ${item.quantity}`);
      }
    }

    // Check discount authorization
    if (saleData.discountPercent > 0) {
      const check = requiresApproval('discount', saleData.discountPercent, currentUser.role, DEFAULT_APPROVAL_THRESHOLDS);
      if (check.requiresApproval) {
        // Create an approval request instead of silent execution
        const newApproval: ApprovalRequest = {
          id: `appr-${Date.now()}`,
          actionType: 'discount',
          requestedBy: currentUser.id,
          requestedByName: `${currentUser.name} (${currentUser.role})`,
          userRole: currentUser.role,
          branchId,
          branchName,
          description: `Sale discount of ${saleData.discountPercent}% requested for ${saleData.customerName}. Reason: ${saleData.discountReason || 'Customer loyalty request'}`,
          value: saleData.discountPercent,
          details: {
            customerName: saleData.customerName,
            itemsCount: saleData.items.length,
          },
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        setApprovals(prev => [newApproval, ...prev]);
        logAudit('SUBMIT_APPROVAL_REQUEST', `Submitted discount authorization ticket for ${saleData.discountPercent}% by ${currentUser.name}`);
        throw new Error(`Discount of ${saleData.discountPercent}% exceeds your authorized limit. An approval ticket has been submitted to Senior Management.`);
      }
    }

    // Calculate totals
    let subtotal = 0;
    let costTotal = 0;
    const saleItems = saleData.items.map(item => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const lineCost = item.quantity * item.product.costPrice;
      subtotal += lineSubtotal;
      costTotal += lineCost;
      return {
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unit: item.product.baseUnit,
        unitPrice: item.unitPrice,
        costPrice: item.product.costPrice,
        subtotal: lineSubtotal,
      };
    });

    const discountAmount = Math.round(subtotal * (saleData.discountPercent / 100));
    const totalAmount = subtotal - discountAmount;
    const grossProfit = totalAmount - costTotal;

    const receiptNumber = `EET-REC-${Math.floor(10000 + Math.random() * 90000)}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      receiptNumber,
      branchId,
      branchName,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerName: saleData.customerName || 'Walk-in Customer',
      customerPhone: saleData.customerPhone,
      pricingTier: saleData.pricingTier,
      items: saleItems,
      subtotal,
      discountPercent: saleData.discountPercent,
      discountAmount,
      taxAmount: 0,
      totalAmount,
      costTotal,
      grossProfit,
      payments: saleData.payments,
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
    };

    // Deduct stock from this specific location
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const itemInSale = saleData.items.find(i => i.product.id === p.id);
        if (!itemInSale) return p;

        const currentLocStock = p.locationStock[branchId] || { onHand: 0, reserved: 0, binLocation: 'General', lastCountedAt: '' };
        return {
          ...p,
          locationStock: {
            ...p.locationStock,
            [branchId]: {
              ...currentLocStock,
              onHand: Math.max(0, currentLocStock.onHand - itemInSale.quantity),
            },
          },
        };
      })
    );

    // Update cash register if cash was received
    const cashPortion = saleData.payments.filter(p => p.method === 'cash').reduce((acc, p) => acc + p.amount, 0);
    if (cashPortion > 0) {
      setCashRegister(prev => ({
        ...prev,
        cashSalesRecorded: prev.cashSalesRecorded + cashPortion,
        expectedClosingCash: prev.expectedClosingCash + cashPortion,
      }));
    }

    setSales(prev => [newSale, ...prev]);

    logAudit(
      'COMPLETED_POS_SALE',
      `Completed Sale ${receiptNumber} for ₦${totalAmount.toLocaleString()} at ${branchName} by ${currentUser.name}. Deducted ${saleItems.length} product lines.`
    );

    return newSale;
  }, [activeLocationId, currentUser, locations, logAudit]);

  // Create an Online Order from Storefront
  const placeOnlineOrder = useCallback((orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    city: string;
    items: Array<{ product: Product; quantity: number }>;
    deliveryFee: number;
    paymentGateway: 'paystack' | 'flutterwave' | 'bank_transfer';
    paymentReference: string;
  }) => {
    // Fulfill from nearest or largest branch (default to Lekki Yard for bulk building materials)
    const fulfillmentLocationId = 'loc-lekki';

    let itemsSubtotal = 0;
    const orderItems = orderData.items.map(item => {
      const lineSubtotal = item.quantity * item.product.retailPrice;
      itemsSubtotal += lineSubtotal;
      return {
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unit: item.product.baseUnit,
        unitPrice: item.product.retailPrice,
        subtotal: lineSubtotal,
      };
    });

    const totalAmount = itemsSubtotal + orderData.deliveryFee;
    const orderNumber = `EET-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: OnlineOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress,
      city: orderData.city,
      fulfillmentLocationId,
      items: orderItems,
      itemsSubtotal,
      deliveryFee: orderData.deliveryFee,
      totalAmount,
      paymentGateway: orderData.paymentGateway,
      paymentReference: orderData.paymentReference,
      paymentStatus: 'paid',
      fulfillmentStatus: 'processing',
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    // Reserve stock at fulfillment location
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const item = orderData.items.find(i => i.product.id === p.id);
        if (!item) return p;

        const currentLocStock = p.locationStock[fulfillmentLocationId] || { onHand: 0, reserved: 0, binLocation: 'General', lastCountedAt: '' };
        return {
          ...p,
          locationStock: {
            ...p.locationStock,
            [fulfillmentLocationId]: {
              ...currentLocStock,
              onHand: Math.max(0, currentLocStock.onHand - item.quantity),
              reserved: currentLocStock.reserved + item.quantity,
            },
          },
        };
      })
    );

    setOnlineOrders(prev => [newOrder, ...prev]);

    logAudit(
      'ONLINE_ORDER_PLACED',
      `Online Order ${orderNumber} placed by ${orderData.customerName} for ₦${totalAmount.toLocaleString()} via ${orderData.paymentGateway}. Allocated to Lekki Yard.`
    );

    return newOrder;
  }, [logAudit]);

  // Request a multi-branch Stock Transfer
  const requestStockTransfer = useCallback((
    sourceLocationId: string,
    destinationLocationId: string,
    items: Array<{ productId: string; requestedQty: number }>
  ) => {
    const transferNumber = `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const transferItems = items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod?.name || 'Unknown Product',
        sku: prod?.sku || '',
        unit: prod?.baseUnit || 'Unit',
        requestedQty: item.requestedQty,
      };
    });

    const newTransfer: StockTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber,
      sourceLocationId,
      destinationLocationId,
      items: transferItems,
      status: 'requested',
      requestedBy: currentUser.id,
      requestedByName: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    setTransfers(prev => [newTransfer, ...prev]);

    const sourceName = locations.find(l => l.id === sourceLocationId)?.name;
    const destName = locations.find(l => l.id === destinationLocationId)?.name;
    logAudit('REQUEST_STOCK_TRANSFER', `Requested transfer ${transferNumber} from ${sourceName} to ${destName} for ${items.length} items.`);

    return newTransfer;
  }, [currentUser, locations, products, logAudit]);

  // Approve a Stock Transfer
  const approveStockTransfer = useCallback((transferId: string) => {
    setTransfers(prev =>
      prev.map(t => {
        if (t.id !== transferId) return t;
        return {
          ...t,
          status: 'approved',
          approvedBy: currentUser.id,
          approvedByName: currentUser.name,
        };
      })
    );
    logAudit('APPROVE_STOCK_TRANSFER', `Approved transfer ticket ${transferId} by ${currentUser.name}.`);
  }, [currentUser, logAudit]);

  // Dispatch Stock Transfer
  const dispatchStockTransfer = useCallback((transferId: string, driverName: string, vehiclePlate: string) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;

    // Deduct stock from source location
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const item = transfer.items.find(i => i.productId === p.id);
        if (!item) return p;

        const currentLoc = p.locationStock[transfer.sourceLocationId] || { onHand: 0, reserved: 0, binLocation: 'General', lastCountedAt: '' };
        return {
          ...p,
          locationStock: {
            ...p.locationStock,
            [transfer.sourceLocationId]: {
              ...currentLoc,
              onHand: Math.max(0, currentLoc.onHand - item.requestedQty),
            },
          },
        };
      })
    );

    setTransfers(prev =>
      prev.map(t => {
        if (t.id !== transferId) return t;
        return {
          ...t,
          status: 'in_transit',
          dispatchedBy: currentUser.name,
          dispatchedAt: new Date().toISOString(),
          driverName,
          vehiclePlate,
          items: t.items.map(i => ({ ...i, dispatchedQty: i.requestedQty })),
        };
      })
    );

    logAudit('DISPATCH_STOCK_TRANSFER', `Dispatched transfer ${transfer.transferNumber} on vehicle ${vehiclePlate} by driver ${driverName}.`);
  }, [transfers, currentUser, logAudit]);

  // Receive Stock Transfer at Destination Branch
  const receiveStockTransfer = useCallback((transferId: string, receivedItems: Record<string, number>, discrepancyNotes?: string) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;

    // Credit stock to destination location
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const receivedQty = receivedItems[p.id];
        if (receivedQty === undefined) return p;

        const currentLoc = p.locationStock[transfer.destinationLocationId] || { onHand: 0, reserved: 0, binLocation: 'General', lastCountedAt: '' };
        return {
          ...p,
          locationStock: {
            ...p.locationStock,
            [transfer.destinationLocationId]: {
              ...currentLoc,
              onHand: currentLoc.onHand + receivedQty,
              lastCountedAt: new Date().toISOString().split('T')[0],
            },
          },
        };
      })
    );

    setTransfers(prev =>
      prev.map(t => {
        if (t.id !== transferId) return t;
        return {
          ...t,
          status: 'completed',
          receivedBy: currentUser.name,
          receivedAt: new Date().toISOString(),
          discrepancyNotes,
          items: t.items.map(i => ({
            ...i,
            receivedQty: receivedItems[i.productId] !== undefined ? receivedItems[i.productId] : (i.dispatchedQty || i.requestedQty),
          })),
        };
      })
    );

    const destName = locations.find(l => l.id === transfer.destinationLocationId)?.name;
    logAudit('RECEIVE_STOCK_TRANSFER', `Received and verified transfer ${transfer.transferNumber} at ${destName}. Stock balances updated.`);
  }, [transfers, currentUser, locations, logAudit]);

  // Resolve an approval request
  const resolveApproval = useCallback((approvalId: string, decision: 'approved' | 'rejected', reason?: string) => {
    setApprovals(prev =>
      prev.map(a => {
        if (a.id !== approvalId) return a;
        return {
          ...a,
          status: decision,
          resolvedBy: currentUser.id,
          resolvedByName: `${currentUser.name} (${currentUser.role})`,
          rejectionReason: reason,
          resolvedAt: new Date().toISOString(),
        };
      })
    );

    logAudit(
      'RESOLVE_APPROVAL',
      `${decision.toUpperCase()} approval ticket ${approvalId} by ${currentUser.name}. ${reason ? `Notes: ${reason}` : ''}`
    );
  }, [currentUser, logAudit]);

  // Record an operational expense
  const recordExpense = useCallback((expenseData: {
    category: ExpenseRecord['category'];
    description: string;
    amount: number;
    referenceReceipt?: string;
  }) => {
    const branchId = activeLocationId === 'all' ? 'loc-vi' : activeLocationId;
    const branchName = locations.find(l => l.id === branchId)?.name || 'Victoria Island Central Hub';

    const check = requiresApproval('expense', expenseData.amount, currentUser.role, DEFAULT_APPROVAL_THRESHOLDS);
    const status: ExpenseRecord['status'] = check.requiresApproval ? 'pending' : 'paid';

    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      branchId,
      branchName,
      category: expenseData.category,
      description: expenseData.description,
      amount: expenseData.amount,
      recordedBy: currentUser.name,
      status,
      referenceReceipt: expenseData.referenceReceipt,
      createdAt: new Date().toISOString(),
    };

    setExpenses(prev => [newExpense, ...prev]);

    if (check.requiresApproval) {
      const newApproval: ApprovalRequest = {
        id: `appr-${Date.now()}`,
        actionType: 'expense',
        requestedBy: currentUser.id,
        requestedByName: currentUser.name,
        userRole: currentUser.role,
        branchId,
        branchName,
        description: `Expense: ${expenseData.description} (₦${expenseData.amount.toLocaleString()})`,
        value: expenseData.amount,
        details: expenseData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setApprovals(prev => [newApproval, ...prev]);
    }

    logAudit('RECORD_EXPENSE', `Recorded ${expenseData.category} expense of ₦${expenseData.amount.toLocaleString()} at ${branchName}. Status: ${status}`);
    return newExpense;
  }, [activeLocationId, currentUser, locations, logAudit]);

  // Manual stock adjustment with threshold approval
  const adjustStock = useCallback((productId: string, locationId: string, newQuantity: number, reason: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentQty = product.locationStock[locationId]?.onHand || 0;
    const diff = newQuantity - currentQty;
    const financialImpact = Math.abs(diff) * product.costPrice;

    if (financialImpact > 50000 && currentUser.role !== 'owner' && currentUser.role !== 'general_manager') {
      // Exceeds writeoff threshold -> Submit approval request
      const locName = locations.find(l => l.id === locationId)?.name || locationId;
      const newApproval: ApprovalRequest = {
        id: `appr-${Date.now()}`,
        actionType: 'stock_writeoff',
        requestedBy: currentUser.id,
        requestedByName: currentUser.name,
        userRole: currentUser.role,
        branchId: locationId,
        branchName: locName,
        description: `Stock adjustment for ${product.name}: ${currentQty} → ${newQuantity} (${diff > 0 ? '+' : ''}${diff} units). Financial impact: ₦${financialImpact.toLocaleString()}. Reason: ${reason}`,
        value: financialImpact,
        details: { productId, locationId, currentQty, newQuantity, reason },
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setApprovals(prev => [newApproval, ...prev]);
      logAudit('SUBMIT_APPROVAL_REQUEST', `Submitted stock adjustment approval ticket for ${product.name} (₦${financialImpact.toLocaleString()}).`);
      throw new Error(`Stock adjustment value (₦${financialImpact.toLocaleString()}) exceeds your authorized threshold. An approval request has been dispatched to Senior Management.`);
    }

    // Apply adjustment immediately
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id !== productId) return p;
        const currentLoc = p.locationStock[locationId] || { onHand: 0, reserved: 0, binLocation: 'General', lastCountedAt: '' };
        return {
          ...p,
          locationStock: {
            ...p.locationStock,
            [locationId]: {
              ...currentLoc,
              onHand: Math.max(0, newQuantity),
              lastCountedAt: new Date().toISOString().split('T')[0],
            },
          },
        };
      })
    );

    logAudit(
      'STOCK_ADJUSTMENT',
      `Adjusted stock for ${product.name} at location ${locationId} from ${currentQty} to ${newQuantity}. Reason: ${reason}`,
      `Qty: ${currentQty}`,
      `Qty: ${newQuantity}`
    );
  }, [products, currentUser, locations, logAudit]);

  // --- CATALOGUE & PRODUCT MANAGEMENT ---
  const addProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt'>) => {
    const id = `prod-${Date.now()}`;
    const initialLocStock: Record<string, ProductLocationStock> = {};
    locations.forEach((loc) => {
      initialLocStock[loc.id] = productData.locationStock?.[loc.id] || {
        onHand: 0,
        reserved: 0,
        binLocation: 'General Yard',
        lastCountedAt: new Date().toISOString().split('T')[0],
      };
    });

    const newProduct: Product = {
      ...productData,
      id,
      locationStock: { ...initialLocStock, ...(productData.locationStock || {}) },
      status: productData.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProducts((prev) => [newProduct, ...prev]);
    logAudit('CREATE_PRODUCT', `Registered product ${newProduct.name} (SKU: ${newProduct.sku}) in catalogue. Barcode: ${newProduct.barcode}`);
    return newProduct;
  }, [locations, logAudit]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, ...updates };
      })
    );
    logAudit('UPDATE_PRODUCT', `Updated specifications and details for product ${id}`);
  }, [logAudit]);

  const deleteProduct = useCallback((id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logAudit('DELETE_PRODUCT', `Archived/Removed product ${prod?.name || id} (${prod?.sku || ''}) from central catalogue.`);
  }, [products, logAudit]);

  const updatePrices = useCallback(
    (
      id: string,
      prices: {
        retailPrice?: number;
        wholesalePrice?: number;
        contractorPrice?: number;
        costPrice?: number;
      }
    ) => {
      const prod = products.find((p) => p.id === id);
      if (!prod) return;

      const oldValues = `Retail: ₦${prod.retailPrice.toLocaleString()}, Wholesale: ₦${prod.wholesalePrice.toLocaleString()}, Contractor: ₦${prod.contractorPrice.toLocaleString()}, Cost: ₦${prod.costPrice.toLocaleString()}`;

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            ...(prices.retailPrice !== undefined ? { retailPrice: Math.max(0, prices.retailPrice) } : {}),
            ...(prices.wholesalePrice !== undefined ? { wholesalePrice: Math.max(0, prices.wholesalePrice) } : {}),
            ...(prices.contractorPrice !== undefined ? { contractorPrice: Math.max(0, prices.contractorPrice) } : {}),
            ...(prices.costPrice !== undefined ? { costPrice: Math.max(0, prices.costPrice) } : {}),
          };
        })
      );

      const newValues = `Retail: ₦${(prices.retailPrice ?? prod.retailPrice).toLocaleString()}, Wholesale: ₦${(prices.wholesalePrice ?? prod.wholesalePrice).toLocaleString()}, Contractor: ₦${(prices.contractorPrice ?? prod.contractorPrice).toLocaleString()}, Cost: ₦${(prices.costPrice ?? prod.costPrice).toLocaleString()}`;
      logAudit('PRICE_REVISION', `Updated price schedule for ${prod.name} (${prod.sku})`, oldValues, newValues);
    },
    [products, logAudit]
  );

  // --- LOCATION MANAGEMENT (BRANCHES & WAREHOUSES) ---
  const addLocation = useCallback((locationData: Omit<Location, 'id'>) => {
    const id = `loc-${Date.now().toString(36)}`;
    const newLocation: Location = { ...locationData, id, isActive: true };
    setLocations((prev) => [...prev, newLocation]);

    // Initialize stock coordinates for this location across all products
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        locationStock: {
          ...p.locationStock,
          [id]: {
            onHand: 0,
            reserved: 0,
            binLocation: 'General Yard',
            lastCountedAt: new Date().toISOString().split('T')[0],
          },
        },
      }))
    );

    logAudit('ADD_LOCATION', `Commissioned new company operating location: ${newLocation.name} (${newLocation.code}) in ${newLocation.city}`);
    return newLocation;
  }, [logAudit]);

  const updateLocation = useCallback((id: string, updates: Partial<Location>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    logAudit('UPDATE_LOCATION', `Updated location record for location ID ${id}`);
  }, [logAudit]);

  const deleteLocation = useCallback((id: string) => {
    const loc = locations.find((l) => l.id === id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
    logAudit('REMOVE_LOCATION', `Decommissioned operating facility: ${loc?.name || id}`);
  }, [locations, logAudit]);

  // --- USER & ACCESS PRIVILEGES MANAGEMENT ---
  const addStaff = useCallback((staffData: Omit<StaffUser, 'id'>) => {
    const id = `usr-${Date.now().toString(36)}`;
    const newStaff: StaffUser = {
      ...staffData,
      id,
      avatar: staffData.avatar || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?w=150&auto=format&fit=crop&q=80`,
      isActive: true,
    };
    setStaff((prev) => [...prev, newStaff]);
    logAudit('REGISTER_STAFF', `Provisioned employee credentials for ${newStaff.name} as ${newStaff.role} (${newStaff.department})`);
    return newStaff;
  }, [logAudit]);

  const updateStaff = useCallback((id: string, updates: Partial<StaffUser>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
    logAudit('UPDATE_STAFF', `Updated staff access profile and privileges for ${id}`);
  }, [currentUser.id, logAudit]);

  const deleteStaff = useCallback((id: string) => {
    const member = staff.find((s) => s.id === id);
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: false } : s)));
    logAudit('DEACTIVATE_STAFF', `Deactivated employee account: ${member?.name || id}. Historical transactional audit preserved.`);
  }, [staff, logAudit]);

  // --- CONTRACTOR PROJECTS & ESTIMATES ---
  const addProject = useCallback(
    (projectData: Omit<ContractorProject, 'id' | 'outstandingBalance' | 'totalPurchased'>) => {
      const id = `proj-${Date.now()}`;
      const newProject: ContractorProject = {
        ...projectData,
        id,
        outstandingBalance: 0,
        totalPurchased: 0,
        status: projectData.status || 'active',
      };
      setProjects((prev) => [newProject, ...prev]);
      logAudit(
        'CREATE_PROJECT',
        `Opened contractor project dossier: ${newProject.projectName} for ${newProject.companyName}. Credit limit: ₦${newProject.creditLimit.toLocaleString()}`
      );
      return newProject;
    },
    [logAudit]
  );

  const updateProject = useCallback((id: string, updates: Partial<ContractorProject>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    logAudit('UPDATE_PROJECT', `Updated contractor project dossier for ${id}`);
  }, [logAudit]);

  const deleteProject = useCallback((id: string) => {
    const proj = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    logAudit('DELETE_PROJECT', `Closed contractor project dossier: ${proj?.projectName || id}`);
  }, [projects, logAudit]);

  const addQuotation = useCallback((quoteData: Omit<Quotation, 'id' | 'createdAt'>) => {
    const id = `quote-${Date.now()}`;
    const newQuote: Quotation = {
      ...quoteData,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setQuotations((prev) => [newQuote, ...prev]);
    logAudit('GENERATE_QUOTATION', `Issued formal material quotation ${newQuote.quoteNumber} for ${newQuote.clientName} (₦${newQuote.totalAmount.toLocaleString()})`);
    return newQuote;
  }, [logAudit]);

  // --- STOREFRONT CONFIGURATION ---
  const updateStorefrontSettings = useCallback((settings: Partial<StorefrontSettings>) => {
    setStorefrontSettings((prev) => ({ ...prev, ...settings }));
    logAudit('UPDATE_STOREFRONT_CONFIG', 'Updated public e-commerce storefront banners, payment gateway credentials, and commercial announcements.');
  }, [logAudit]);

  // --- LOGISTICS & WAYBILLS ---
  const createWaybill = useCallback((data: Omit<Waybill, 'id' | 'waybillNumber' | 'dispatchTimestamp'>) => {
    const wbNumber = `EET-WB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const newWaybill: Waybill = {
      ...data,
      id: `wb-${Date.now()}`,
      waybillNumber: wbNumber,
      dispatchTimestamp: new Date().toISOString(),
    };
    setWaybills((prev) => [newWaybill, ...prev]);
    logAudit('ISSUE_WAYBILL', `Issued 3-Part Commercial Waybill ${wbNumber} for vehicle ${newWaybill.vehiclePlateNumber} (${newWaybill.totalWeightTons} Tons)`);
    return newWaybill;
  }, [logAudit]);

  const createGatePass = useCallback((data: Omit<GatePass, 'id' | 'passNumber'>) => {
    const passNumber = `EET-GP-${Date.now().toString().slice(-4)}`;
    const newGatePass: GatePass = {
      ...data,
      id: `gp-${Date.now()}`,
      passNumber,
    };
    setGatePasses((prev) => [newGatePass, ...prev]);
    logAudit('ISSUE_GATE_PASS', `Security clearance Gate Pass ${passNumber} generated for vehicle ${newGatePass.vehiclePlateNumber}`);
    return newGatePass;
  }, [logAudit]);

  // --- PROCUREMENT & GOODS RECEIVED NOTES (LANDED COST) ---
  const recordGoodsReceivedNote = useCallback((data: Omit<GoodsReceivedNote, 'id' | 'grnNumber'>) => {
    const grnNumber = `EET-GRN-${Date.now().toString().slice(-4)}`;
    const newGrn: GoodsReceivedNote = {
      ...data,
      id: `grn-${Date.now()}`,
      grnNumber,
    };
    setGoodsReceivedNotes((prev) => [newGrn, ...prev]);

    // Automatically update product cost price to new landed cost and update stock at receiving location
    setProducts((prev) =>
      prev.map((prod) => {
        const receivedItem = newGrn.items.find((item) => item.productId === prod.id);
        if (!receivedItem) return prod;

        const currentStock = prod.locationStock[newGrn.locationId]?.onHand || 0;
        const newStock = currentStock + receivedItem.receivedQty;

        return {
          ...prod,
          costPrice: Math.round(receivedItem.finalLandedUnitCost),
          locationStock: {
            ...prod.locationStock,
            [newGrn.locationId]: {
              ...(prod.locationStock[newGrn.locationId] || { binLocation: 'Main Depot', lastCountedAt: new Date().toISOString().split('T')[0], reserved: 0 }),
              onHand: newStock,
              lastCountedAt: new Date().toISOString().split('T')[0],
            },
          },
        };
      })
    );

    logAudit(
      'RECORD_GRN_LANDED_COST',
      `Goods Received Note ${grnNumber} from ${newGrn.supplierName}. Total Landed Cost: ₦${newGrn.totalLandedCost.toLocaleString()} (Haulage: ₦${newGrn.haulageCost.toLocaleString()})`
    );
    return newGrn;
  }, [logAudit]);

  // --- CASH REGISTER & BLIND CLOSEOUT ---
  const recordMidDayCashDrop = useCallback((amount: number, witnessName: string) => {
    const drop: MidDayCashDrop = {
      id: `drop-${Date.now()}`,
      amount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      droppedBy: `${currentUser.name} (${currentUser.role})`,
      witnessName,
      vaultReceiptNumber: `VLT-REC-${Date.now().toString().slice(-4)}`,
    };

    setCashRegister((prev) => ({
      ...prev,
      cashPaidOut: prev.cashPaidOut + amount,
      expectedClosingCash: prev.expectedClosingCash - amount,
      midDayDrops: [...(prev.midDayDrops || []), drop],
    }));

    logAudit('CASH_REGISTER_DROP', `Vault Cash Drop of ₦${amount.toLocaleString()} witnessed by ${witnessName}`);
    return drop;
  }, [currentUser, logAudit]);

  const performBlindCloseout = useCallback((counts: CashDenominationCount, notes?: string) => {
    const countedTotal =
      (counts.n1000 || 0) * 1000 +
      (counts.n500 || 0) * 500 +
      (counts.n200 || 0) * 200 +
      (counts.n100 || 0) * 100 +
      (counts.n50 || 0) * 50;

    const discrepancy = countedTotal - cashRegister.expectedClosingCash;
    const status: 'balanced' | 'overage' | 'shortage' =
      discrepancy === 0 ? 'balanced' : discrepancy > 0 ? 'overage' : 'shortage';

    setCashRegister((prev) => ({
      ...prev,
      actualClosingCash: countedTotal,
      discrepancy,
      blindDenominations: counts,
      status: 'closed',
      closedAt: new Date().toISOString(),
      notes: notes || `Blind reconciliation completed: ${status.toUpperCase()} of ₦${Math.abs(discrepancy).toLocaleString()}`,
    }));

    logAudit(
      'BLIND_REGISTER_RECONCILIATION',
      `Cash register blind closeout: Counted ₦${countedTotal.toLocaleString()} vs Expected ₦${cashRegister.expectedClosingCash.toLocaleString()} (Discrepancy: ₦${discrepancy.toLocaleString()})`
    );

    return { countedTotal, discrepancy, status };
  }, [cashRegister, logAudit]);

  // --- CONTRACTOR DEBT RECOVERY ---
  const recordContractorPayment = useCallback((projectId: string, amount: number, paymentRef: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const newBalance = Math.max(0, proj.outstandingBalance - amount);
        const isLocked = newBalance > proj.creditLimit;

        // Pro-rate payment across oldest aging buckets first
        let remainingPayment = amount;
        const over90 = Math.max(0, (proj.agingSummary?.over90Days || 0) - remainingPayment);
        remainingPayment = Math.max(0, remainingPayment - (proj.agingSummary?.over90Days || 0));

        const days61To90 = Math.max(0, (proj.agingSummary?.days61To90 || 0) - remainingPayment);
        remainingPayment = Math.max(0, remainingPayment - (proj.agingSummary?.days61To90 || 0));

        const days30To60 = Math.max(0, (proj.agingSummary?.days30To60 || 0) - remainingPayment);
        remainingPayment = Math.max(0, remainingPayment - (proj.agingSummary?.days30To60 || 0));

        const current = Math.max(0, (proj.agingSummary?.current || 0) - remainingPayment);

        return {
          ...proj,
          outstandingBalance: newBalance,
          agingSummary: {
            current,
            days30To60,
            days61To90,
            over90Days: over90,
            isCreditLocked: isLocked,
          },
        };
      })
    );

    logAudit(
      'CONTRACTOR_DEBT_PAYMENT',
      `Recorded debt settlement of ₦${amount.toLocaleString()} for contractor project ${projectId} (Ref: ${paymentRef})`
    );
  }, [logAudit]);

  // Export full business data JSON backup
  const exportBackup = useCallback(() => {
    const backupData = {
      company: 'Elite Energy Technology',
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      locations,
      staff,
      storefrontSettings,
      products,
      sales,
      onlineOrders,
      transfers,
      projects,
      quotations,
      expenses,
      approvals,
      auditLogs,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `EliteEnergy_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logAudit('EXPORT_DATABASE_BACKUP', 'Exported encrypted system backup containing full catalogue, sales, and audit trails.');
  }, [locations, staff, storefrontSettings, products, sales, onlineOrders, transfers, projects, quotations, expenses, approvals, auditLogs, logAudit]);

  return {
    locations,
    staff,
    suppliers,
    vehicles,
    products,
    sales,
    onlineOrders,
    transfers,
    projects,
    quotations,
    expenses,
    approvals,
    auditLogs,
    cashRegister,
    storefrontSettings,
    waybills,
    gatePasses,
    goodsReceivedNotes,
    currentUser,
    activeLocationId,
    activeTab,
    setActiveTab,
    switchUser,
    setViewingLocation,
    processPosSale,
    placeOnlineOrder,
    requestStockTransfer,
    approveStockTransfer,
    dispatchStockTransfer,
    receiveStockTransfer,
    resolveApproval,
    recordExpense,
    adjustStock,
    exportBackup,
    logAudit,
    addProduct,
    updateProduct,
    deleteProduct,
    updatePrices,
    addLocation,
    updateLocation,
    deleteLocation,
    addStaff,
    updateStaff,
    deleteStaff,
    addProject,
    updateProject,
    deleteProject,
    addQuotation,
    updateStorefrontSettings,
    createWaybill,
    createGatePass,
    recordGoodsReceivedNote,
    recordMidDayCashDrop,
    performBlindCloseout,
    recordContractorPayment,
  };
}
