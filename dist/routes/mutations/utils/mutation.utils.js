import * as XLSX from "xlsx";
export class ExcelService {
    generateMutationsExcel(mutations) {
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
        });
    }
    generateFilename(prefix) {
        const now = new Date();
        const timestamp = now.toISOString().split("T")[0];
        return `${prefix}_${timestamp}.xlsx`;
    }
    applyExcelStyling(worksheet, data) {
        const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[cellAddress])
                    continue;
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
    static validatePayoutAmount(amount, withdrawableBalance) {
        const errors = [];
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
    static validateMutationID(mutationID) {
        const errors = [];
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
    static createSuccessResponse(message, data) {
        return {
            message,
            data,
        };
    }
    static createErrorResponse(message) {
        return {
            message,
            data: null,
        };
    }
    static createValidationErrorResponse(errors) {
        return {
            message: errors.join(", "),
            data: null,
        };
    }
}
export class TransformUtils {
    static transformMutationDates(mutation) {
        return {
            ...mutation,
            createdAt: mutation.createdAt.toISOString(),
            updatedAt: mutation.updatedAt.toISOString(),
        };
    }
    static transformMutationsResponse(mutations, pagination) {
        return {
            mutations: mutations.map(this.transformMutationDates),
            pagination,
        };
    }
}
