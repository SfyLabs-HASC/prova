const DKG = require('dkg.js').default;

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
    const { name, description, productionDate, origin, documentHash } = req.body;

    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is missing');
    }

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

    const result = await dkg.asset.create(content, {
      epochsNum: 2,
      scoreFunctionId: 2,
    });

    return res.status(200).json({
      success: true,
      UAL: result.UAL,
      publicAssertionId: result.publicAssertionId,
    });

  } catch (error) {
    console.error('Error creating asset:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create Knowledge Asset',
    });
  }
};
