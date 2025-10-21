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

    // For now, just return a mock response to test the API
    console.log('[API] Mock asset creation...');
    
    const mockUAL = `did:dkg:otp:20430:${Date.now()}`;
    const mockAssertionId = `0x${Math.random().toString(16).substr(2, 8)}`;

    console.log('[API] Mock asset created successfully!');
    return res.status(200).json({
      success: true,
      UAL: mockUAL,
      publicAssertionId: mockAssertionId,
      message: 'Mock asset created - DKG integration pending'
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
