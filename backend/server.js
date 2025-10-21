import express from 'express';
import cors from 'cors';
import DKG from 'dkg.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configurato per permettere tutte le origini
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(express.json());

// Gestisci preflight requests
app.options('*', cors());

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
        publicKey: '0x41d1038b4c5b27F192753974Da535034E216cC15',
        privateKey: process.env.PRIVATE_KEY,
        rpc: 'https://lofar-testnet.origin-trail.network',
        hubContract: '0xBbfF7Ea6b2Addc1f38A0798329e12C08f03750A6',
      },
      nodeApiVersion: '/v1',
      maxNumberOfRetries: 30,
      frequency: 2,
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
    
    // Timeout wrapper - max 5 minuti
    const createAssetPromise = dkg.asset.create(content, {
      epochsNum: 2,
      scoreFunctionId: 2,
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Asset creation took more than 5 minutes')), 300000);
    });
    
    const result = await Promise.race([createAssetPromise, timeoutPromise]);

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
