const DKG = require('dkg.js');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API] Received request to create asset');
    const { name, description, productionDate, origin, documentHash } = req.body;
    console.log('[API] Form data:', { name, description, productionDate, origin, documentHash });

    if (!process.env.PRIVATE_KEY) {
      console.error('[API] PRIVATE_KEY missing!');
      throw new Error('PRIVATE_KEY environment variable is missing');
    }

    console.log('[API] Initializing DKG SDK...');
    
    // Configurazione per NeuroWeb testnet
    const dkg = new DKG({
      environment: 'testnet',
      endpoint: 'https://v6-pegasus-node-02.origin-trail.network',
      port: 8900,
      blockchain: {
        name: 'otp:20430', // NeuroWeb testnet chain ID
        privateKey: process.env.PRIVATE_KEY,
        hubContract: '0xBbfF7Ea6b2Addc1f38A0798329e12C08f03750A6',
        rpc: 'https://rpc-neuroweb-testnet.origin-trail.network',
      },
      nodeApiVersion: '/v1',
      maxNumberOfRetries: 30,
      frequency: 2,
    });

    console.log('[API] DKG configuration:', {
      environment: 'testnet',
      endpoint: 'https://v6-pegasus-node-02.origin-trail.network',
      port: 8900,
      blockchain: {
        name: 'otp:20430',
        hubContract: '0xBbfF7Ea6b2Addc1f38A0798329e12C08f03750A6',
        rpc: 'https://rpc-neuroweb-testnet.origin-trail.network',
      },
      nodeApiVersion: '/v1',
    });

    console.log('[API] DKG SDK initialized successfully');

    // Verifica che il wallet sia registrato
    console.log('[API] Checking wallet registration...');
    try {
      const walletInfo = await dkg.wallet.getBalance();
      console.log('[API] Wallet balance:', walletInfo);
    } catch (walletError) {
      console.warn('[API] Wallet check failed:', walletError.message);
    }

    const content = {
      public: {
        '@context': {
          sc: 'https://simplychain.it/schema#',
          schema: 'https://schema.org/',
        },
        '@type': 'sc:CertifiedProduct',
        'schema:name': name,
        'schema:description': description,
        'sc:productionDate': productionDate,
        'sc:origin': origin,
        'sc:documentHash': documentHash,
      },
    };

    console.log('[API] Calling dkg.asset.create...');
    console.log('[API] Content to create:', JSON.stringify(content, null, 2));
    
    // Crea il Knowledge Asset con timeout
    const createAssetPromise = dkg.asset.create(content, {
      epochsNum: 1,
      scoreFunctionId: 2,
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Asset creation took more than 5 minutes')), 300000); // 5 minutes
    });
    
    const result = await Promise.race([createAssetPromise, timeoutPromise]);

    console.log('[API] Asset created successfully!', result);
    return res.status(200).json({
      success: true,
      UAL: result.UAL,
      publicAssertionId: result.publicAssertionId,
    });

  } catch (error) {
    console.error('[API] Error creating asset:', error);
    console.error('[API] Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = error.message || 'Failed to create Knowledge Asset';
    
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds in wallet. Please ensure you have enough NEURO and TRAC tokens.';
    } else if (error.message.includes('network')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timeout. The operation took too long. Please try again.';
    } else if (error.message.includes('PRIVATE_KEY')) {
      errorMessage = 'Wallet configuration error. Please check your private key.';
    }
    
    return res.status(500).json({
      error: errorMessage,
      details: error.toString(),
      type: error.name || 'UnknownError',
    });
  }
};
