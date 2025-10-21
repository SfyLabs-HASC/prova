declare module 'dkg.js' {
  interface BlockchainConfig {
    name: string;
    publicKey: string;
    privateKey?: string;
    rpc?: string;
    hubContract?: string;
  }

  interface DKGConfig {
    environment?: string;
    endpoint: string;
    port: number;
    blockchain: BlockchainConfig;
    maxNumberOfRetries?: number;
    frequency?: number;
    contentType?: string;
    nodeApiVersion?: string;
  }

  interface AssetContent {
    public?: {
      '@context': any;
      '@type'?: string;
      [key: string]: any;
    };
    private?: {
      '@context': any;
      '@graph'?: any[];
      [key: string]: any;
    };
  }

  interface CreateAssetOptions {
    epochsNum: number;
    immutable?: boolean;
    tokenAmount?: string;
    paranetUAL?: string;
  }

  interface KnowledgeAsset {
    UAL: string;
    publicAssertionId: string;
    operation: {
      [key: string]: any;
    };
  }

  interface AssetManager {
    create(content: AssetContent, options: CreateAssetOptions): Promise<KnowledgeAsset>;
    get(ual: string, options?: any): Promise<any>;
    update(ual: string, content: AssetContent, options?: CreateAssetOptions): Promise<KnowledgeAsset>;
    getOwner(ual: string): Promise<string>;
  }

  class DKG {
    constructor(config: DKGConfig);
    asset: AssetManager;
  }

  export default DKG;
}