import DKG from 'dkg.js';

export default async (req, res) => {
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
    // Inizializza DKG SDK v8
    const dkg = new DKG({
      environment: 'testnet',
      endpoint: 'https://v6-pegasus-node-02.origin-trail.network',
      port: 8900,
      blockchain: {
        name: 'otp:20430',
        privateKey: process.env.PRIVATE_KEY,
        hubContract: '0xBbfF7Ea6b2Addc1f38A0798329e12C08f03750A6',
      },
      nodeApiVersion: '/v1',
    });

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
    // Crea il Knowledge Asset
    const result = await dkg.asset.create(content, {
      epochsNum: 1,
      scoreFunctionId: 2,
    });

    console.log('[API] Asset created successfully!', result);
    return res.status(200).json({
      success: true,
      UAL: result.UAL,
      publicAssertionId: result.publicAssertionId,
    });

  } catch (error) {
    console.error('[API] Error creating asset:', error);
    console.error('[API] Error stack:', error.stack);
    return res.status(500).json({
      error: error.message || 'Failed to create Knowledge Asset',
      details: error.toString(),
    });
  }
};
