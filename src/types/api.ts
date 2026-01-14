// Credit Bureau API Response
export interface CreditBureauResponse {
  success: boolean;
  data: {
    score: number;
    scoreDate: string;
    factors: {
      paymentHistory: number;
      creditUtilization: number;
      creditAge: number;
      creditMix: number;
      newCredit: number;
    };
    accounts: {
      total: number;
      delinquent: number;
      collections: number;
    };
  };
  requestId: string;
  latencyMs: number;
}

// ESG Provider API Response
export interface ESGProviderResponse {
  success: boolean;
  data: {
    overallScore: number;
    breakdown: {
      environmental: number;
      social: number;
      governance: number;
    };
    industryRank: number;
    industryTotal: number;
    carbonFootprint: 'low' | 'medium' | 'high';
    complianceStatus: 'compliant' | 'warning' | 'violation';
  };
  requestId: string;
  latencyMs: number;
}

// Generic API error response
export interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  requestId: string;
}

// CSV row for batch processing
export interface CSVBorrowerRow {
  name: string;
  ssn: string;
  annual_income: string;
  assets: string;
  company: string;
  industry: string;
}
