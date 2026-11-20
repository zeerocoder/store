export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    app: 'Elite Energy Technology Business Management System',
    timestamp: new Date().toISOString(),
    environment: 'production',
  });
}
