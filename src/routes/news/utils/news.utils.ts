import type {
  ParsedNewsData,
  ValidationResult,
  News,
} from "../types/news.types.ts";

export class ValidationUtils {
  static validateCreateNews(newsData: ParsedNewsData): ValidationResult {
    const errors: string[] = [];

    if (!newsData.newsName || newsData.newsName.trim() === "") {
      errors.push("Nama berita harus diisi");
    }

    if (!newsData.newsDescription || newsData.newsDescription.trim() === "") {
      errors.push("Deskripsi berita harus diisi");
    }

    if (newsData.newsName && newsData.newsName.length > 255) {
      errors.push("Nama berita maksimal 255 karakter");
    }

    if (newsData.newsDescription && newsData.newsDescription.length > 1000) {
      errors.push("Deskripsi berita maksimal 1000 karakter");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateNews(newsData: Partial<ParsedNewsData>): ValidationResult {
    const errors: string[] = [];

    if (newsData.newsName !== undefined) {
      if (newsData.newsName.trim() === "") {
        errors.push("Nama berita tidak boleh kosong");
      }
      if (newsData.newsName.length > 255) {
        errors.push("Nama berita maksimal 255 karakter");
      }
    }

    if (newsData.newsDescription !== undefined) {
      if (newsData.newsDescription.trim() === "") {
        errors.push("Deskripsi berita tidak boleh kosong");
      }
      if (newsData.newsDescription.length > 1000) {
        errors.push("Deskripsi berita maksimal 1000 karakter");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateNewsID(newsID: number): ValidationResult {
    const errors: string[] = [];

    if (!newsID || newsID <= 0) {
      errors.push("ID berita tidak valid");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validatePagination(page: number, limit: number): ValidationResult {
    const errors: string[] = [];

    if (!page || page <= 0) {
      errors.push("Halaman harus lebih dari 0");
    }

    if (!limit || limit <= 0) {
      errors.push("Limit harus lebih dari 0");
    }

    if (limit > 100) {
      errors.push("Limit maksimal 100");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export class ResponseUtils {
  static createSuccessResponse<T>(message: string, data: T) {
    return {
      message,
      data,
    };
  }

  static createErrorResponse(message: string) {
    return {
      message,
      data: null,
    };
  }

  static createValidationErrorResponse(errors: string[]) {
    return {
      message: errors.join(", "),
      data: null,
    };
  }

  static createPaginatedResponse<T>(message: string, data: T, pagination: any) {
    return {
      message,
      data,
      pagination,
    };
  }
}

export class TransformUtils {
  static transformNewsDates(news: News) {
    return {
      ...news,
      createdAt: news.createdAt.toISOString(),
      updatedAt: news.updatedAt.toISOString(),
    };
  }

  static transformNewsResponse(newsList: News[], pagination: any) {
    return {
      news: newsList.map(this.transformNewsDates),
      pagination,
    };
  }

  static sanitizeNewsInput(input: string): string {
    return input.trim();
  }

  static sanitizeNewsData(newsData: ParsedNewsData): ParsedNewsData {
    return {
      newsImage: newsData.newsImage,
      newsName: this.sanitizeNewsInput(newsData.newsName),
      newsDescription: this.sanitizeNewsInput(newsData.newsDescription),
    };
  }
}