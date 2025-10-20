declare module 'dkg.js' {
  import { providers, Wallet } from 'ethers';

  interface DKGConfig {
    provider: providers.Provider;
    wallet: Wallet;
    network: string;
    blockchain: string;
    nodeHost: string;
    nodePort: number;
  }

  interface KnowledgeAssetData {
    '@context': {
      sc: string;
      schema: string;
    };
    '@type': string;
    'schema:name': string;
    'schema:description': string;
    'sc:productionDate': string;
    'sc:origin': string;
    'sc:documentHash': string;
  }

  interface CreateAssetOptions {
    data: KnowledgeAssetData;
    visibility: 'public' | 'private';
    keywords: string[];
  }

  interface KnowledgeAsset {
    id: string;
  }

  interface AssetManager {
    create(options: CreateAssetOptions): Promise<KnowledgeAsset>;
  }

  class DKG {
    constructor(config: DKGConfig);
    asset: AssetManager;
  }

  export default DKG;
}