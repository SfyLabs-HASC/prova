import express from 'express';
import cors from 'cors';
import DKG from 'dkg.js';

const app = express();
const PORT = process.env.PORT || 3001;
// Configurable request timeout for long-running DKG asset creation
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 720000); // default 12 minutes

// DKG configuration via environment variables (sensible defaults for NeuroWeb testnet)
const DKG_ENV = process.env.DKG_ENV || 'testnet';
const DKG_ENDPOINT = process.env.DKG_ENDPOINT || 'https://v6-pegasus-node-02.origin-trail.network';
const DKG_PORT = Number(process.env.DKG_PORT || 8900);
const DKG_CHAIN_NAME = process.env.DKG_CHAIN_NAME || 'otp:20430';
const DKG_HUB_CONTRACT = process.env.DKG_HUB_CONTRACT || '0xBbfF7Ea6b2Addc1f38A0798329e12C08f03750A6';
const DKG_RPC = process.env.DKG_RPC; // optional, only included if set
const DKG_NODE_API_VERSION = process.env.DKG_NODE_API_VERSION || '/v1';
const DKG_MAX_RETRIES = Number(process.env.DKG_MAX_RETRIES || 30);
const DKG_FREQUENCY = Number(process.env.DKG_FREQUENCY || 2);
const EPOCHS_NUM = Number(process.env.EPOCHS_NUM || 1);
const SCORE_FUNCTION_ID = Number(process.env.SCORE_FUNCTION_ID || 2);

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
      environment: DKG_ENV,
      endpoint: DKG_ENDPOINT,
      port: DKG_PORT,
      blockchain: {
        name: DKG_CHAIN_NAME,
        privateKey: process.env.PRIVATE_KEY,
        hubContract: DKG_HUB_CONTRACT,
        ...(DKG_RPC ? { rpc: DKG_RPC } : {}),
      },
      nodeApiVersion: DKG_NODE_API_VERSION,
      maxNumberOfRetries: DKG_MAX_RETRIES,
      frequency: DKG_FREQUENCY,
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
    console.log(`[Backend] Timeout set to ${Math.round(REQUEST_TIMEOUT_MS / 60000)} minutes`);
    
    // Timeout wrapper - max 5 minuti
    const createAssetPromise = dkg.asset.create(content, {
      epochsNum: EPOCHS_NUM,
      scoreFunctionId: SCORE_FUNCTION_ID,
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout: Asset creation took more than ${Math.round(REQUEST_TIMEOUT_MS / 60000)} minutes`)), REQUEST_TIMEOUT_MS);
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
