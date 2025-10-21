import DKG from 'dkg.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

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
    
    // DKG configuration using environment variables
    let dkg;
    try {
      dkg = new DKG({
        environment: process.env.DKG_ENV || 'testnet',
        // endpoint: process.env.DKG_ENDPOINT || 'https://v8-pegasus-node-02.origin-trail.network',
        // port: parseInt(process.env.DKG_PORT) || 8900,
        blockchain: {
          name: process.env.DKG_CHAIN_NAME || 'otp:20430',
          privateKey: process.env.PRIVATE_KEY,
          hubContract: process.env.DKG_HUB_CONTRACT || '0xBbfF7Ea6b2Addc1f38A0798329e12C08f03750A6',
          rpc: process.env.DKG_RPC || 'https://lofar-testnet.origin-trail.network',
        },
        nodeApiVersion: process.env.DKG_NODE_API_VERSION || '/v1',
      });
      console.log('[API] DKG instance created successfully');
      console.log('[API] DKG config:', {
        environment: process.env.DKG_ENV,
        endpoint: process.env.DKG_ENDPOINT,
        port: process.env.DKG_PORT,
        chainName: process.env.DKG_CHAIN_NAME,
        hubContract: process.env.DKG_HUB_CONTRACT,
        rpc: process.env.DKG_RPC,
        nodeApiVersion: process.env.DKG_NODE_API_VERSION
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
    if (!dkg || !dkg.blockchain) {
      throw new Error('DKG initialization failed - blockchain not available');
    }

    // Get wallet address for logging
    const address = dkg.blockchain.blockchainService.config.blockchain.publicKey;
    console.log('[API] Using wallet address:', address);

    console.log('[API] DKG SDK initialized successfully');

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
    
    // Crea il Knowledge Asset con configurazione ottimizzata per velocità
    const createAssetPromise = dkg.asset.create(content, {
      epochsNum: 0, // Nessun epoch per velocità massima
      scoreFunctionId: 0, // Score function più veloce
      maxNumberOfRetries: 1, // Ridotto retry
      frequency: 1000, // Check ogni secondo
    });
    
    console.log('[API] Asset creation started, waiting for completion...');
    
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
