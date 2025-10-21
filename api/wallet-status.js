import DKG from 'dkg.js';

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

    if (!process.env.PRIVATE_KEY) {
      return res.status(500).json({ 
        error: 'PRIVATE_KEY environment variable is missing',
        status: 'error'
      });
    }

    console.log('[API] PRIVATE_KEY found, length:', process.env.PRIVATE_KEY.length);

    // Try different DKG configuration with RPC
    let dkg;
    try {
      dkg = new DKG({
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
      });
      console.log('[API] DKG instance created successfully');
    } catch (dkgError) {
      console.error('[API] DKG creation failed:', dkgError);
      return res.status(500).json({
        error: 'DKG initialization failed',
        details: dkgError.message,
        status: 'error'
      });
    }

    // Test if DKG is properly initialized
    if (!dkg) {
      throw new Error('DKG instance is null');
    }

    // Test DKG connection first
    try {
      console.log('[API] Testing DKG connection...');
      const nodeInfo = await dkg.node.info();
      console.log('[API] DKG node info:', nodeInfo);
    } catch (nodeError) {
      console.error('[API] DKG node connection failed:', nodeError);
      throw new Error(`DKG node connection failed: ${nodeError.message}`);
    }

    if (!dkg.wallet) {
      throw new Error('DKG wallet is not available');
    }

    console.log('[API] DKG wallet available');

    // Get wallet address
    let address;
    try {
      address = await dkg.wallet.getAddress();
      console.log('[API] Wallet address:', address);
    } catch (addressError) {
      console.error('[API] Failed to get address:', addressError);
      throw new Error(`Failed to get wallet address: ${addressError.message}`);
    }

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
}