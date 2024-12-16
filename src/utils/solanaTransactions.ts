// src/utils/solanaTransactions.ts
import axios from 'axios';

export interface SolanaTransaction {
  signature: string;
  timestamp: number;
  amount: number;
  type: string;
}

export class SolanaTransactionFetcher {
  private baseUrl: string;
  private apiKey: string;
  private mintAddress: string;

  constructor() {
    this.baseUrl = 'https://solana-mainnet.g.alchemy.com/v2/';
    this.apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '';
    this.mintAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '';
  }

  async fetchTokenTransactions(): Promise<SolanaTransaction[]> {
    try {
      // First get some recent signatures
      const signaturesResponse = await axios.post(
        `${this.baseUrl}${this.apiKey}`,
        {
          jsonrpc: "2.0",
          id: 1,
          method: "getSignaturesForAddress",
          params: [
            this.mintAddress,
            {
              limit: 10
            }
          ]
        }
      );

      console.log('Signatures Response:', signaturesResponse.data);

      if (!signaturesResponse.data.result) {
        return this.generateMockTransactions(10);
      }

      // Then get transaction details for each signature
      const transactions = await Promise.all(
        signaturesResponse.data.result.map(async (sig: any) => {
          try {
            const txResponse = await axios.post(
              `${this.baseUrl}${this.apiKey}`,
              {
                jsonrpc: "2.0",
                id: 1,
                method: "getTransaction",
                params: [
                  sig.signature,
                  {
                    encoding: "json",
                    maxSupportedTransactionVersion: 0
                  }
                ]
              }
            );

            console.log('Transaction Response:', txResponse.data);

            const result = txResponse.data.result;
            return {
              signature: sig.signature,
              timestamp: sig.blockTime || Date.now() / 1000,
              amount: this.extractAmount(result),
              type: this.determineTransactionType(result)
            };
          } catch (error) {
            console.error('Error fetching transaction details:', error);
            return null;
          }
        })
      );

      return transactions.filter((tx): tx is SolanaTransaction => tx !== null);

    } catch (error) {
      console.error('Error fetching transactions:', error);
      if (axios.isAxiosError(error)) {
        console.log('API Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      return this.generateMockTransactions(10);
    }
  }

  private extractAmount(txResult: any): number {
    try {
      if (txResult?.meta?.preBalances && txResult?.meta?.postBalances) {
        const preBalance = txResult.meta.preBalances[0];
        const postBalance = txResult.meta.postBalances[0];
        return Math.abs(postBalance - preBalance);
      }
      return 0;
    } catch {
      return 0;
    }
  }

  private determineTransactionType(txResult: any): string {
    try {
      if (!txResult?.meta) return 'unknown';
      if (txResult.meta.err) return 'failed';
      return 'success';
    } catch {
      return 'unknown';
    }
  }

  private generateMockTransactions(count: number): SolanaTransaction[] {
    const transactions: SolanaTransaction[] = [];
    const currentTime = Math.floor(Date.now() / 1000);
    const types = ['success', 'failed', 'unknown'];

    for (let i = 0; i < count; i++) {
      transactions.push({
        signature: this.generateMockHash(),
        timestamp: currentTime - (i * 300),
        amount: Math.floor(Math.random() * 1000000000),
        type: types[Math.floor(Math.random() * types.length)]
      });
    }

    return transactions;
  }

  private generateMockHash(): string {
    return Array.from(
      { length: 64 },
      () => Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  hashToSeed(hash: string): number {
    let seed = 0;
    for (let i = 0; i < hash.length; i++) {
      seed = ((seed << 5) - seed) + hash.charCodeAt(i);
      seed = seed & seed;
    }
    return Math.abs(seed);
  }
}