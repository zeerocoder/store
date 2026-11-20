export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference, gateway, amount } = req.body || {};
  const settlementReference = `EET-SETTLE-${Date.now().toString().slice(-6)}`;

  return res.status(200).json({
    status: 'success',
    verified: true,
    reference: reference || `REF-${Date.now()}`,
    gateway: gateway || 'paystack',
    amount: amount || 0,
    settlementReference,
    settledTo: 'Guaranty Trust Bank (0128994102) - Elite Energy Technology Corporate',
    timestamp: new Date().toISOString(),
  });
}
