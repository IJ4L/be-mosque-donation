export interface Mutation {
  mutationID: number;
  mutationType: string;
  mutationAmount: number;
  mutationDescription: string | null;
  mutationStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMutationData {
  mutationType: string;
  mutationAmount: number;
  mutationDescription?: string;
  mutationStatus?: string;
}

export interface UpdateMutationData {
  mutationType?: string;
  mutationAmount?: number;
  mutationDescription?: string;
  mutationStatus?: string;
}

export interface MutationSummary {
  totalIncome: number;
  totalOutcome: number;
  totalPending: number;
  totalBalance: number;
  withdrawableBalance: number;
}

export interface PayoutRequest {
  amount: number;
  description?: string;
}

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MutationResponse {
  mutations: Mutation[];
  pagination: PaginationData;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}