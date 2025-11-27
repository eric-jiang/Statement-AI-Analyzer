export interface ParsedTransaction {
  date: string;
  originalDescription: string;
  supplier: string;
  project: string | null;
  amount: number;
}

export interface AnalysisSummary {
  totalAmount: number;
  bySupplier: Record<string, number>;
  byProject: Record<string, number>;
}

export enum ViewMode {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
}
