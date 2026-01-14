import type { CreditBureauResponse } from '../types/api';

/**
 * Simple hash function to generate deterministic values from SSN
 * Uses a basic string hashing algorithm for demo purposes
 */
function hashSSN(ssn: string): number {
  let hash = 0;
  const cleanSSN = ssn.replace(/\D/g, '');
  for (let i = 0; i < cleanSSN.length; i++) {
    const char = cleanSSN.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate deterministic credit score from SSN (300-850 range)
 */
function generateCreditScore(ssn: string): number {
  const hash = hashSSN(ssn);
  // Map hash to 300-850 range (551 possible values)
  return 300 + (hash % 551);
}

/**
 * Generate deterministic credit factors from SSN
 */
function generateCreditFactors(ssn: string): CreditBureauResponse['data']['factors'] {
  const hash = hashSSN(ssn);
  return {
    paymentHistory: 50 + ((hash >> 4) % 51),   // 50-100
    creditUtilization: (hash >> 8) % 101,      // 0-100
    creditAge: 1 + ((hash >> 12) % 30),        // 1-30 years
    creditMix: 1 + ((hash >> 16) % 10),        // 1-10
    newCredit: (hash >> 20) % 6,               // 0-5 inquiries
  };
}

/**
 * Generate deterministic account info from SSN
 */
function generateAccounts(ssn: string): CreditBureauResponse['data']['accounts'] {
  const hash = hashSSN(ssn);
  const total = 3 + ((hash >> 6) % 15); // 3-17 accounts
  return {
    total,
    delinquent: (hash >> 10) % 3,       // 0-2
    collections: (hash >> 14) % 2,      // 0-1
  };
}

/**
 * Generate random latency between 500-1500ms
 */
function generateLatency(): number {
  return 500 + Math.floor(Math.random() * 1001);
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `CB-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Mock Credit Bureau API
 * Returns deterministic credit scores based on SSN hash
 * Simulates 500-1500ms network latency
 * 
 * Requirements: 5.1, 5.3, 5.4
 */
export async function fetchCreditScore(ssn: string): Promise<CreditBureauResponse> {
  const latency = generateLatency();
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, latency));
  
  const score = generateCreditScore(ssn);
  const factors = generateCreditFactors(ssn);
  const accounts = generateAccounts(ssn);
  
  return {
    success: true,
    data: {
      score,
      scoreDate: new Date().toISOString(),
      factors,
      accounts,
    },
    requestId: generateRequestId(),
    latencyMs: latency,
  };
}

/**
 * Synchronous version for testing - returns score without latency
 */
export function getCreditScoreSync(ssn: string): number {
  return generateCreditScore(ssn);
}
