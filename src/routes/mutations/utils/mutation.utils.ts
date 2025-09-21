import * as XLSX from "xlsx";
import type { Mutation } from "../types/mutation.types.js";

export class ExcelService {
  generateMutationsExcel(mutations: Mutation[]): Buffer {
    const worksheetData = mutations.map((mutation) => ({
      ID: mutation.mutationID,
      Type: mutation.mutationType,
      Amount: mutation.mutationAmount,
      Description: mutation.mutationDescription || "",
      Status: mutation.mutationStatus || "",
      "Created At": mutation.createdAt.toISOString().split("T")[0],
      "Updated At": mutation.updatedAt.toISOString().split("T")[0],
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mutations");

    this.applyExcelStyling(worksheet, worksheetData);

    return XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    }) as Buffer;
  }

  generateFilename(prefix: string): string {
    const now = new Date();
    const timestamp = now.toISOString().split("T")[0];
    return `${prefix}_${timestamp}.xlsx`;
  }

  private applyExcelStyling(worksheet: any, data: any[]): void {
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        
        if (!worksheet[cellAddress]) continue;

        if (R === 0) {
          worksheet[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "EEEEEE" } },
          };
        }
      }
    }

    worksheet["!cols"] = [
      { wch: 10 }, { wch: 15 }, { wch: 15 },
      { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
  }
}

export class ValidationUtils {
  static validatePayoutAmount(amount: number, withdrawableBalance: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!amount || amount <= 0) {
      errors.push("Jumlah penarikan harus lebih dari 0");
    }

    if (amount > withdrawableBalance) {
      errors.push(`Jumlah penarikan melebihi saldo yang dapat ditarik (${withdrawableBalance})`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateMutationID(mutationID: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!mutationID || mutationID <= 0) {
      errors.push("ID mutation tidak valid");
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
}

export class TransformUtils {
  static transformMutationDates(mutation: Mutation) {
    return {
      ...mutation,
      createdAt: mutation.createdAt.toISOString(),
      updatedAt: mutation.updatedAt.toISOString(),
    };
  }

  static transformMutationsResponse(mutations: Mutation[], pagination: any) {
    return {
      mutations: mutations.map(this.transformMutationDates),
      pagination,
    };
  }
}