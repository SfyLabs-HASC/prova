module.exports = async (req, res) => {
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

    if (!process.env.PRIVATE_KEY) {
      return res.status(500).json({ 
        error: 'PRIVATE_KEY environment variable is missing',
        status: 'error'
      });
    }

    // Import DKG dynamically to avoid issues
    const DKG = require('dkg.js');

    // Configurazione per NeuroWeb testnet
    const dkg = new DKG({
      environment: 'testnet',
      endpoint: 'https://v6-pegasus-node-02.origin-trail.network',
      port: 8900,
      blockchain: {
        name: 'otp:20430',
        privateKey: process.env.PRIVATE_KEY,
        hubContract: '0xBbfF7Ea6b2Addc1f38A0798329e12C08f03750A6',
        rpc: 'https://rpc-neuroweb-testnet.origin-trail.network',
      },
      nodeApiVersion: '/v1',
      maxNumberOfRetries: 30,
      frequency: 2,
    });

    console.log('[API] DKG SDK initialized successfully');

    // Get wallet address first (simpler operation)
    const address = await dkg.wallet.getAddress();
    console.log('[API] Wallet address:', address);

    // Get wallet balance with timeout
    let balance = null;
    try {
      balance = await Promise.race([
        dkg.wallet.getBalance(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Balance check timeout')), 10000)
        )
      ]);
      console.log('[API] Wallet balance:', balance);
    } catch (balanceError) {
      console.warn('[API] Balance check failed:', balanceError.message);
      balance = 'Unable to fetch balance';
    }

    return res.status(200).json({
      status: 'success',
      address: address,
      balance: balance,
      network: 'NeuroWeb Testnet',
      chainId: 'otp:20430'
    });

  } catch (error) {
    console.error('[API] Error checking wallet status:', error);
    return res.status(500).json({
      error: error.message || 'Failed to check wallet status',
      details: error.toString(),
      status: 'error'
    });
  }
};