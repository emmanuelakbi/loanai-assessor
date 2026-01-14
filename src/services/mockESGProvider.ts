import { ESGProviderResponse } from '../types/api';

/**
 * Industry-specific ESG score modifiers
 * Different industries have different baseline ESG characteristics
 */
const INDUSTRY_ESG_PROFILES: Record<string, { envMod: number; socMod: number; govMod: number }> = {
  'technology': { envMod: 10, socMod: 5, govMod: 15 },
  'healthcare': { envMod: 5, socMod: 20, govMod: 10 },
  'finance': { envMod: 0, socMod: 5, govMod: 20 },
  'manufacturing': { envMod: -15, socMod: 0, govMod: 5 },
  'energy': { envMod: -20, socMod: 0, govMod: 10 },
  'retail': { envMod: -5, socMod: 10, govMod: 5 },
  'agriculture': { envMod: -10, socMod: 5, govMod: 0 },
  'construction': { envMod: -10, socMod: 5, govMod: 5 },
  'transportation': { envMod: -15, socMod: 5, govMod: 5 },
  'hospitality': { envMod: -5, socMod: 15, govMod: 5 },
};

/**
 * Simple hash function for company name
 */
function hashString(str: string): number {
  let hash = 0;
  const normalized = str.toLowerCase().trim();
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generate industry-specific ESG scores (0-100 range)
 */
function generateESGScores(
  company: string,
  industry: string
): { environmental: number; social: number; governance: number } {
  const hash = hashString(company);
  const normalizedIndustry = industry.toLowerCase().trim();
  const profile = INDUSTRY_ESG_PROFILES[normalizedIndustry] || { envMod: 0, socMod: 0, govMod: 0 };
  
  // Base scores from company hash (40-80 range)
  const baseEnv = 40 + (hash % 41);
  const baseSoc = 40 + ((hash >> 8) % 41);
  const baseGov = 40 + ((hash >> 16) % 41);
  
  // Apply industry modifiers and clamp to 0-100
  return {
    environmental: clamp(baseEnv + profile.envMod, 0, 100),
    social: clamp(baseSoc + profile.socMod, 0, 100),
    governance: clamp(baseGov + profile.govMod, 0, 100),
  };
}

/**
 * Calculate overall ESG score (weighted average)
 */
function calculateOverallScore(env: number, soc: number, gov: number): number {
  // Equal weighting for E, S, G components
  return Math.round((env + soc + gov) / 3);
}

/**
 * Determine carbon footprint category based on environmental score
 */
function getCarbonFootprint(envScore: number): 'low' | 'medium' | 'high' {
  if (envScore >= 70) return 'low';
  if (envScore >= 40) return 'medium';
  return 'high';
}

/**
 * Determine compliance status based on governance score
 */
function getComplianceStatus(govScore: number): 'compliant' | 'warning' | 'violation' {
  if (govScore >= 60) return 'compliant';
  if (govScore >= 40) return 'warning';
  return 'violation';
}

/**
 * Generate industry rank (deterministic based on company hash)
 */
function generateIndustryRank(company: string): { rank: number; total: number } {
  const hash = hashString(company);
  const total = 50 + (hash % 451); // 50-500 companies in industry
  const rank = 1 + (hash % total);
  return { rank, total };
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
  return `ESG-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Mock ESG Provider API
 * Returns industry-specific ESG scores (0-100 range)
 * Simulates 500-1500ms network latency
 * 
 * Requirements: 5.2, 5.3, 5.5
 */
export async function fetchESGScore(
  company: string,
  industry: string
): Promise<ESGProviderResponse> {
  const latency = generateLatency();
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, latency));
  
  const scores = generateESGScores(company, industry);
  const overallScore = calculateOverallScore(scores.environmental, scores.social, scores.governance);
  const { rank, total } = generateIndustryRank(company);
  
  return {
    success: true,
    data: {
      overallScore,
      breakdown: scores,
      industryRank: rank,
      industryTotal: total,
      carbonFootprint: getCarbonFootprint(scores.environmental),
      complianceStatus: getComplianceStatus(scores.governance),
    },
    requestId: generateRequestId(),
    latencyMs: latency,
  };
}

/**
 * Synchronous version for testing - returns overall score without latency
 */
export function getESGScoreSync(company: string, industry: string): number {
  const scores = generateESGScores(company, industry);
  return calculateOverallScore(scores.environmental, scores.social, scores.governance);
}

/**
 * Get list of supported industries
 */
export function getSupportedIndustries(): string[] {
  return Object.keys(INDUSTRY_ESG_PROFILES);
}
