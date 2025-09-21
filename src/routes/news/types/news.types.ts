export interface News {
  newsID: number;
  newsImage: string;
  newsName: string;
  newsDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNewsData {
  newsImage: string;
  newsName: string;
  newsDescription: string;
}

export interface UpdateNewsData {
  newsImage?: string;
  newsName?: string;
  newsDescription?: string;
}

export interface ParsedNewsData {
  newsImage: string;
  newsName: string;
  newsDescription: string;
  authorID?: number;
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

export interface NewsResponse {
  news: News[];
  pagination: PaginationData;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}