export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API] Checking wallet status...');

    // Basic response without DKG for now
    return res.status(200).json({
      status: 'success',
      message: 'API is working',
      hasPrivateKey: !!process.env.PRIVATE_KEY,
      privateKeyLength: process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.length : 0,
      network: 'NeuroWeb Testnet',
      chainId: 'otp:20430',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API] Error checking wallet status:', error);
    return res.status(500).json({
      error: error.message || 'Failed to check wallet status',
      details: error.toString(),
      status: 'error'
    });
  }
}