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
        environment: 'testnet',
        endpoint: 'https://v6-pegasus-node-02.origin-trail.network',
        port: 8900,
        blockchain: {
          name: 'otp:20430',
          privateKey: process.env.PRIVATE_KEY,
          hubContract: '0xBbfF7Ea6b2Addc1f38A0798329e12C08f03750A6',
          rpc: 'https://lofar-testnet.origin-trail.network',
        },
        nodeApiVersion: '/v1',
      });
      console.log('[API] DKG instance created successfully');
      console.log('[API] DKG config:', {
        environment: 'testnet',
        endpoint: 'https://v6-pegasus-node-02.origin-trail.network',
        port: 8900,
        chainName: 'otp:20430',
        hubContract: '0xBbfF7Ea6b2Addc1f38A0798329e12C08f03750A6',
        rpc: 'https://lofar-testnet.origin-trail.network',
        nodeApiVersion: '/v1'
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
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': name,
        'description': description,
        'productionDate': productionDate,
        'origin': origin,
        'documentHash': documentHash,
      },
    };

    console.log('[API] Calling dkg.asset.create...');
    console.log('[API] Content to create:', JSON.stringify(content, null, 2));
    
    // Crea il Knowledge Asset con configurazione ultra-veloce
    const createAssetPromise = dkg.asset.create(content, {
      epochsNum: 0, // Nessun epoch
      scoreFunctionId: 0, // Score function più veloce
      maxNumberOfRetries: 0, // Nessun retry
      frequency: 100, // Check ogni 100ms per velocità massima
    });
    
    console.log('[API] Asset creation started, waiting for completion...');
    
    // Aggiungi un timer per monitorare il progresso
    const progressTimer = setInterval(() => {
      console.log('[API] Asset creation still in progress...');
    }, 10000); // Log ogni 10 secondi
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        clearInterval(progressTimer);
        reject(new Error('Timeout: Asset creation took more than 1 minute'));
      }, 60000); // 1 minute
    });
    
    const result = await Promise.race([createAssetPromise, timeoutPromise]);
    
    // Pulisci il timer se l'asset è stato creato con successo
    clearInterval(progressTimer);

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
