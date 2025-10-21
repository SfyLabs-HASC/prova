import DKG from 'dkg.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

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

    // Try DKG configuration using environment variables
    let dkg;
    try {
      dkg = new DKG({
        environment: process.env.DKG_ENV || 'testnet',
        blockchain: {
          name: process.env.DKG_CHAIN_NAME || 'otp:20430',
          privateKey: process.env.PRIVATE_KEY,
          hubContract: process.env.DKG_HUB_CONTRACT || '0xBbfF7Ea6b2Addc1f38A0798329e12C08f03750A6',
          rpc: process.env.DKG_RPC || 'https://lofar-testnet.origin-trail.network',
        },
      });
      console.log('[API] DKG instance created successfully');
      console.log('[API] DKG config:', {
        environment: process.env.DKG_ENV,
        chainName: process.env.DKG_CHAIN_NAME,
        hubContract: process.env.DKG_HUB_CONTRACT,
        rpc: process.env.DKG_RPC
      });
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

    // Wait a bit for blockchain to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!dkg.blockchain) {
      console.error('[API] DKG blockchain is null after initialization');
      console.log('[API] DKG object keys:', Object.keys(dkg));
      throw new Error('DKG blockchain is not available');
    }

    console.log('[API] DKG blockchain available');

    // Get wallet address from blockchain config
    let address;
    try {
      address = dkg.blockchain.blockchainService.config.blockchain.publicKey;
      console.log('[API] Wallet address:', address);
    } catch (addressError) {
      console.error('[API] Failed to get address:', addressError);
      throw new Error(`Failed to get wallet address: ${addressError.message}`);
    }

    // For balance, we'll need to use a different approach
    // For now, we'll return a placeholder
    let balance = 'Balance check not implemented yet';
    console.log('[API] Wallet balance:', balance);

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