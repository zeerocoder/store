/**
 * Elite Energy Technology - Core Business Logic & Financial Calculations
 * Decoupled, pure functions for unit testing and deterministic operations.
 */

export interface SplitPayment {
  method: 'cash' | 'bank_transfer' | 'pos_card' | 'paystack' | 'flutterwave' | 'credit';
  amount: number;
  reference?: string;
  notes?: string;
}

export interface ProductUnitConversion {
  baseUnit: string;
  packagingUnit: string;
  factor: number; // e.g. 1 packagingUnit = factor * baseUnit (e.g. 1 Carton = 20 Pcs, 1 Pallet = 50 Bags)
}

export interface FinancialSummaryInput {
  sales: Array<{
    totalAmount: number;
    costAmount: number;
    status: 'completed' | 'cancelled' | 'refunded';
  }>;
  expenses: Array<{
    amount: number;
    status: 'approved' | 'paid' | 'pending';
  }>;
  inventory: Array<{
    costPrice: number;
    quantity: number;
  }>;
}

export interface FinancialMetrics {
  grossSales: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: number;
  netOperatingProfit: number;
  netMarginPercent: number;
  inventoryValuation: number;
}

export interface DeliveryCalculationInput {
  weightKg: number;
  distanceKm: number;
  vehicleType: 'pickup_van' | 'canter_3t' | 'tipper_10t' | 'flatbed_30t';
  requiresOffloading: boolean;
  isUrgent?: boolean;
}

export interface ApprovalThresholds {
  maxCashierDiscountPercent: number;
  maxManagerDiscountPercent: number;
  maxStockWriteOffAmount: number;
  maxCreditSaleAmount: number;
  maxExpenseWithoutApproval: number;
}

export const DEFAULT_APPROVAL_THRESHOLDS: ApprovalThresholds = {
  maxCashierDiscountPercent: 5,
  maxManagerDiscountPercent: 12,
  maxStockWriteOffAmount: 50000,
  maxCreditSaleAmount: 200000,
  maxExpenseWithoutApproval: 30000,
};

/**
 * Packaging & unit conversions
 * Examples:
 * - 100 cartons at 20 pcs/carton = 2000 pcs
 * - 2000 pcs into cartons = 100 cartons
 */
export function convertPackagingUnits(
  quantity: number,
  fromUnit: 'base' | 'packaging',
  conversionFactor: number
): number {
  if (conversionFactor <= 0) {
    throw new Error('Conversion factor must be greater than zero');
  }
  if (quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }

  if (fromUnit === 'packaging') {
    return Math.round(quantity * conversionFactor);
  } else {
    return Number((quantity / conversionFactor).toFixed(4));
  }
}

/**
 * Split payment reconciliation:
 * Evaluates whether the sum of payments covers the sale total,
 * computes any remaining balance or change due.
 */
export function reconcilePayments(
  saleTotal: number,
  payments: SplitPayment[]
): {
  totalPaid: number;
  balanceDue: number;
  changeDue: number;
  isFullyPaid: boolean;
  hasCreditPortion: boolean;
} {
  const totalPaid = payments.reduce((acc, p) => acc + (p.amount > 0 ? p.amount : 0), 0);
  const roundedTotal = Math.round(saleTotal * 100) / 100;
  const roundedPaid = Math.round(totalPaid * 100) / 100;

  const diff = roundedPaid - roundedTotal;
  const hasCredit = payments.some(p => p.method === 'credit' && p.amount > 0);

  return {
    totalPaid: roundedPaid,
    balanceDue: diff < 0 ? Math.abs(diff) : 0,
    changeDue: diff > 0 && !hasCredit ? diff : 0,
    isFullyPaid: diff >= -0.01,
    hasCreditPortion: hasCredit,
  };
}

/**
 * Accurately calculate financial metrics:
 * Gross Sales - COGS = Gross Profit
 * Gross Profit - Operating Expenses = Net Operating Profit
 */
export function calculateFinancialMetrics(input: FinancialSummaryInput): FinancialMetrics {
  let grossSales = 0;
  let costOfGoodsSold = 0;

  for (const sale of input.sales) {
    if (sale.status === 'completed') {
      grossSales += sale.totalAmount;
      costOfGoodsSold += sale.costAmount;
    }
  }

  const grossProfit = grossSales - costOfGoodsSold;
  const grossMarginPercent = grossSales > 0 ? (grossProfit / grossSales) * 100 : 0;

  let operatingExpenses = 0;
  for (const exp of input.expenses) {
    if (exp.status === 'approved' || exp.status === 'paid') {
      operatingExpenses += exp.amount;
    }
  }

  const netOperatingProfit = grossProfit - operatingExpenses;
  const netMarginPercent = grossSales > 0 ? (netOperatingProfit / grossSales) * 100 : 0;

  let inventoryValuation = 0;
  for (const item of input.inventory) {
    inventoryValuation += item.costPrice * item.quantity;
  }

  return {
    grossSales: Math.round(grossSales * 100) / 100,
    costOfGoodsSold: Math.round(costOfGoodsSold * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    grossMarginPercent: Math.round(grossMarginPercent * 10) / 10,
    operatingExpenses: Math.round(operatingExpenses * 100) / 100,
    netOperatingProfit: Math.round(netOperatingProfit * 100) / 100,
    netMarginPercent: Math.round(netMarginPercent * 10) / 10,
    inventoryValuation: Math.round(inventoryValuation * 100) / 100,
  };
}

/**
 * Determines whether a sensitive business action requires senior management approval
 */
export function requiresApproval(
  actionType: 'discount' | 'price_override' | 'stock_adjustment' | 'stock_writeoff' | 'refund' | 'credit_sale' | 'expense',
  value: number,
  role: string,
  thresholds: ApprovalThresholds = DEFAULT_APPROVAL_THRESHOLDS
): { requiresApproval: boolean; reason?: string } {
  // Owner and General Manager never need approval
  if (role === 'owner' || role === 'general_manager') {
    return { requiresApproval: false };
  }

  switch (actionType) {
    case 'discount': {
      // value is discount percentage
      const maxAllowed = role === 'branch_manager' ? thresholds.maxManagerDiscountPercent : thresholds.maxCashierDiscountPercent;
      if (value > maxAllowed) {
        return {
          requiresApproval: true,
          reason: `Discount of ${value}% exceeds authorized ${role} limit of ${maxAllowed}%`,
        };
      }
      return { requiresApproval: false };
    }

    case 'price_override':
      return {
        requiresApproval: true,
        reason: 'Any manual price override requires senior management approval',
      };

    case 'stock_writeoff':
      if (value > thresholds.maxStockWriteOffAmount) {
        return {
          requiresApproval: true,
          reason: `Stock write-off of ₦${value.toLocaleString()} exceeds threshold of ₦${thresholds.maxStockWriteOffAmount.toLocaleString()}`,
        };
      }
      return { requiresApproval: false };

    case 'stock_adjustment':
      // Negative adjustments (loss/breakage) above threshold require approval
      if (value > 20000) {
        return {
          requiresApproval: true,
          reason: `Stock discrepancy adjustment of ₦${value.toLocaleString()} requires approval`,
        };
      }
      return { requiresApproval: false };

    case 'refund':
      return {
        requiresApproval: true,
        reason: 'Customer refunds and transaction reversals require management authorization',
      };

    case 'credit_sale':
      if (value > thresholds.maxCreditSaleAmount) {
        return {
          requiresApproval: true,
          reason: `Credit extension of ₦${value.toLocaleString()} exceeds credit limit of ₦${thresholds.maxCreditSaleAmount.toLocaleString()}`,
        };
      }
      return { requiresApproval: false };

    case 'expense':
      if (value > thresholds.maxExpenseWithoutApproval) {
        return {
          requiresApproval: true,
          reason: `Expense disbursement of ₦${value.toLocaleString()} exceeds approval threshold of ₦${thresholds.maxExpenseWithoutApproval.toLocaleString()}`,
        };
      }
      return { requiresApproval: false };

    default:
      return { requiresApproval: false };
  }
}

/**
 * Calculates delivery cost for heavy building materials (cement, rebar, sand, granite)
 */
export function calculateDeliveryFee(input: DeliveryCalculationInput): {
  baseFee: number;
  distanceFee: number;
  weightSurcharge: number;
  offloadingFee: number;
  totalFee: number;
} {
  const baseRates: Record<DeliveryCalculationInput['vehicleType'], { base: number; perKm: number; maxWeightKg: number }> = {
    pickup_van: { base: 12000, perKm: 500, maxWeightKg: 1500 },
    canter_3t: { base: 25000, perKm: 850, maxWeightKg: 4000 },
    tipper_10t: { base: 45000, perKm: 1400, maxWeightKg: 12000 },
    flatbed_30t: { base: 85000, perKm: 2200, maxWeightKg: 35000 },
  };

  const rate = baseRates[input.vehicleType];
  const baseFee = rate.base;
  const distanceFee = Math.round(input.distanceKm * rate.perKm);

  // Weight surcharge if exceeding 80% capacity
  const capacityRatio = input.weightKg / rate.maxWeightKg;
  let weightSurcharge = 0;
  if (capacityRatio > 0.8) {
    weightSurcharge = Math.round(baseFee * 0.15);
  }

  // Offloading labor fee (heavy building materials)
  const offloadingFee = input.requiresOffloading ? Math.max(5000, Math.round(input.weightKg * 2.5)) : 0;

  let totalFee = baseFee + distanceFee + weightSurcharge + offloadingFee;
  if (input.isUrgent) {
    totalFee = Math.round(totalFee * 1.25);
  }

  return {
    baseFee,
    distanceFee,
    weightSurcharge,
    offloadingFee,
    totalFee,
  };
}
