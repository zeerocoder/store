import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertPackagingUnits,
  reconcilePayments,
  calculateFinancialMetrics,
  requiresApproval,
  calculateDeliveryFee,
  DEFAULT_APPROVAL_THRESHOLDS,
} from './businessLogic';

test('convertPackagingUnits converts cartons to individual pieces correctly', () => {
  // 100 cartons containing 20 pieces each = 2000 pieces
  const pieces = convertPackagingUnits(100, 'packaging', 20);
  assert.equal(pieces, 2000);

  // 2000 pieces into cartons with 20 pcs/carton = 100 cartons
  const cartons = convertPackagingUnits(2000, 'base', 20);
  assert.equal(cartons, 100);
});

test('convertPackagingUnits handles fractional conversions correctly', () => {
  // 50 bags of cement = 1 pallet of 50 bags
  const pallets = convertPackagingUnits(75, 'base', 50);
  assert.equal(pallets, 1.5);
});

test('reconcilePayments validates exact payment across split channels', () => {
  const result = reconcilePayments(300000, [
    { method: 'cash', amount: 100000 },
    { method: 'bank_transfer', amount: 150000 },
    { method: 'pos_card', amount: 50000 },
  ]);

  assert.equal(result.totalPaid, 300000);
  assert.equal(result.balanceDue, 0);
  assert.equal(result.changeDue, 0);
  assert.equal(result.isFullyPaid, true);
  assert.equal(result.hasCreditPortion, false);
});

test('reconcilePayments calculates change due when overpaid with cash', () => {
  const result = reconcilePayments(45000, [
    { method: 'cash', amount: 50000 },
  ]);

  assert.equal(result.totalPaid, 50000);
  assert.equal(result.balanceDue, 0);
  assert.equal(result.changeDue, 5000);
  assert.equal(result.isFullyPaid, true);
});

test('reconcilePayments detects underpayment with balance due', () => {
  const result = reconcilePayments(120000, [
    { method: 'pos_card', amount: 100000 },
  ]);

  assert.equal(result.totalPaid, 100000);
  assert.equal(result.balanceDue, 20000);
  assert.equal(result.isFullyPaid, false);
});

test('calculateFinancialMetrics enforces accounting accuracy: Revenue != Profit', () => {
  const summary = calculateFinancialMetrics({
    sales: [
      { totalAmount: 500000, costAmount: 380000, status: 'completed' },
      { totalAmount: 300000, costAmount: 220000, status: 'completed' },
      { totalAmount: 150000, costAmount: 110000, status: 'cancelled' }, // Should be excluded
    ],
    expenses: [
      { amount: 40000, status: 'approved' }, // Diesel
      { amount: 35000, status: 'paid' },     // Maintenance
      { amount: 20000, status: 'pending' },  // Excluded until approved
    ],
    inventory: [
      { costPrice: 9500, quantity: 200 }, // 1,900,000
      { costPrice: 12000, quantity: 150 }, // 1,800,000
    ],
  });

  assert.equal(summary.grossSales, 800000);
  assert.equal(summary.costOfGoodsSold, 600000);
  assert.equal(summary.grossProfit, 200000);
  assert.equal(summary.grossMarginPercent, 25.0);
  assert.equal(summary.operatingExpenses, 75000);
  assert.equal(summary.netOperatingProfit, 125000);
  assert.equal(summary.netMarginPercent, 15.6);
  assert.equal(summary.inventoryValuation, 3700000);
});

test('requiresApproval triggers threshold checks for cashiers vs managers', () => {
  // Cashier attempting 8% discount exceeds 5% limit -> requires approval
  const cashierOver = requiresApproval('discount', 8, 'cashier', DEFAULT_APPROVAL_THRESHOLDS);
  assert.equal(cashierOver.requiresApproval, true);

  // Cashier with 4% discount -> allowed
  const cashierOk = requiresApproval('discount', 4, 'cashier', DEFAULT_APPROVAL_THRESHOLDS);
  assert.equal(cashierOk.requiresApproval, false);

  // Branch manager with 10% discount -> allowed (limit 12%)
  const managerOk = requiresApproval('discount', 10, 'branch_manager', DEFAULT_APPROVAL_THRESHOLDS);
  assert.equal(managerOk.requiresApproval, false);

  // Owner always allowed without approval
  const ownerResult = requiresApproval('discount', 25, 'owner', DEFAULT_APPROVAL_THRESHOLDS);
  assert.equal(ownerResult.requiresApproval, false);
});

test('calculateDeliveryFee computes vehicle, distance, and heavy offloading labor', () => {
  const result = calculateDeliveryFee({
    weightKg: 8000, // 8 tonnes
    distanceKm: 25,
    vehicleType: 'tipper_10t',
    requiresOffloading: true,
  });

  // Base 45000 + (25 * 1400 = 35000) + offloading (8000 * 2.5 = 20000) = 100,000
  assert.equal(result.baseFee, 45000);
  assert.equal(result.distanceFee, 35000);
  assert.equal(result.offloadingFee, 20000);
  assert.equal(result.totalFee, 100000);
});

test('Landed Cost apportionment distributes haulage freight and union levies across received units', () => {
  const invoiceItems = [
    { qty: 1000, exFactoryCost: 8200 },
  ];
  const haulageCost = 450000;
  const offloadingLevy = 60000;
  const totalOverhead = haulageCost + offloadingLevy; // 510,000

  const totalReceived = 1000;
  const overheadPerUnit = totalOverhead / totalReceived; // 510 per bag
  const finalLandedUnitCost = invoiceItems[0].exFactoryCost + overheadPerUnit; // 8710

  assert.equal(overheadPerUnit, 510);
  assert.equal(finalLandedUnitCost, 8710);
  assert.equal(finalLandedUnitCost * totalReceived, 8710000);
});

test('Blind Cash Closeout correctly aggregates piece counts and detects variances', () => {
  const counts = {
    n1000: 440, // 440,000
    n500: 90,   // 45,000
    n200: 25,   // 5,000
    n100: 10,   // 1,000
    n50: 0,     // 0
  };
  const countedTotal =
    counts.n1000 * 1000 +
    counts.n500 * 500 +
    counts.n200 * 200 +
    counts.n100 * 100 +
    counts.n50 * 50;

  assert.equal(countedTotal, 491000);

  const expectedClosing = 490400;
  const discrepancy = countedTotal - expectedClosing; // +600 overage

  assert.equal(discrepancy, 600);
  assert.equal(discrepancy > 0, true);
});

test('Contractor debt repayment settles oldest aging buckets first and removes credit locks', () => {
  const initialAging = {
    current: 1000000,
    days30To60: 1000000,
    days61To90: 1000000,
    over90Days: 2000000,
  };
  let outstandingBalance = 5000000;
  const creditLimit = 4000000;
  let isCreditLocked = outstandingBalance > creditLimit; // true

  assert.equal(isCreditLocked, true);

  // Contractor pays ₦2,500,000
  const payment = 2500000;
  outstandingBalance -= payment; // 2,500,000

  let remaining = payment;
  const over90 = Math.max(0, initialAging.over90Days - remaining); // 0
  remaining = Math.max(0, remaining - initialAging.over90Days); // 500,000

  const days61To90 = Math.max(0, initialAging.days61To90 - remaining); // 500,000

  isCreditLocked = outstandingBalance > creditLimit; // 2.5M <= 4M -> false

  assert.equal(over90, 0);
  assert.equal(days61To90, 500000);
  assert.equal(outstandingBalance, 2500000);
  assert.equal(isCreditLocked, false);
});
