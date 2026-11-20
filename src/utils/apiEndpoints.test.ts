import { test } from 'node:test';
import assert from 'node:assert';
import healthHandler from '../../api/health';
import insightsHandler from '../../api/ai/insights';
import paymentsHandler from '../../api/payments/verify';

function createMockRes() {
  const res: any = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.data = payload;
      return this;
    },
  };
  return res;
}

test('GET /api/health returns ok status and app name', async () => {
  const req: any = { method: 'GET' };
  const res = createMockRes();

  await healthHandler(req, res);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'ok');
  assert.strictEqual(res.data.app, 'Elite Energy Technology Business Management System');
  assert.strictEqual(res.data.environment, 'production');
  assert.ok(res.data.timestamp);
});

test('POST /api/ai/insights returns operational intelligence report', async () => {
  const req: any = {
    method: 'POST',
    body: {
      activeLocation: 'Victoria Island Hub (VI-01)',
      metrics: {
        grossSales: 35000000,
        grossProfit: 5800000,
        grossMarginPercent: 16.5,
        netOperatingProfit: 3400000,
        operatingExpenses: 2400000,
        inventoryValuation: 185000000,
      },
      lowStockCount: 2,
      topSellingProducts: [
        { name: 'Dangote 3X Cement', sku: 'EET-CEM-001', price: 10200, stock: 420 },
      ],
    },
  };
  const res = createMockRes();

  await insightsHandler(req, res);

  assert.strictEqual(res.statusCode, 200);
  assert.ok(typeof res.data.insights === 'string');
  assert.ok(res.data.insights.includes('Stockout Prevention'));
  assert.ok(res.data.insights.includes('Margin Optimization'));
});

test('POST /api/ai/insights rejects non-POST requests with 405', async () => {
  const req: any = { method: 'GET' };
  const res = createMockRes();

  await insightsHandler(req, res);

  assert.strictEqual(res.statusCode, 405);
  assert.strictEqual(res.data.error, 'Method not allowed');
});

test('POST /api/payments/verify reconciles reference and corporate GTBank account', async () => {
  const req: any = {
    method: 'POST',
    body: {
      reference: 'PAYSTACK-991204',
      gateway: 'paystack',
      amount: 450000,
    },
  };
  const res = createMockRes();

  await paymentsHandler(req, res);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'success');
  assert.strictEqual(res.data.verified, true);
  assert.strictEqual(res.data.reference, 'PAYSTACK-991204');
  assert.strictEqual(res.data.gateway, 'paystack');
  assert.strictEqual(res.data.amount, 450000);
  assert.ok(res.data.settlementReference.startsWith('EET-SETTLE-'));
  assert.ok(res.data.settledTo.includes('Guaranty Trust Bank (0128994102)'));
});

test('POST /api/payments/verify rejects non-POST requests with 405', async () => {
  const req: any = { method: 'GET' };
  const res = createMockRes();

  await paymentsHandler(req, res);

  assert.strictEqual(res.statusCode, 405);
  assert.strictEqual(res.data.error, 'Method not allowed');
});
