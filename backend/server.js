import express from 'express';
import cors from 'cors';
import DKG from 'dkg.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'NeuroWeb DKG Backend running' });
});

// Create Knowledge Asset endpoint
app.post('/api/create-asset', async (req, res) => {
  try {
    console.log('[Backend] Received request to create asset');
    const { name, description, productionDate, origin, documentHash } = req.body;
    console.log('[Backend] Form data:', { name, description, productionDate, origin, documentHash });

    if (!process.env.PRIVATE_KEY) {
      console.error('[Backend] PRIVATE_KEY missing!');
      return res.status(500).json({ error: 'PRIVATE_KEY environment variable is missing' });
    }

    console.log('[Backend] Initializing DKG SDK...');
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

    console.log('[Backend] DKG SDK initialized successfully');

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

    console.log('[Backend] Calling dkg.asset.create...');
    const result = await dkg.asset.create(content, {
      epochsNum: 2,
      scoreFunctionId: 2,
    });

    console.log('[Backend] Asset created successfully!', result);
    return res.status(200).json({
      success: true,
      UAL: result.UAL,
      publicAssertionId: result.publicAssertionId,
    });

  } catch (error) {
    console.error('[Backend] Error creating asset:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create Knowledge Asset',
      details: error.toString(),
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
