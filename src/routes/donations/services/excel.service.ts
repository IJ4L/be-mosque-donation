import * as XLSX from "xlsx";

interface DonationExportData {
  donationID: number;
  donaturName: string | null;
  phoneNumber: string | null;
  donationAmount: string;
  donationType: string;
  donaturMessage: string | null;
  createdAt: Date | null;
}

class ExcelService {
  generateDonationsExcel(donations: DonationExportData[]): Buffer {
    try {
      const worksheetData = donations.map((donation) => ({
        ID: donation.donationID,
        "Donatur Name": donation.donaturName || "-",
        "Phone Number": donation.phoneNumber || "-",
        Amount: donation.donationAmount,
        Type: donation.donationType,
        Message: donation.donaturMessage || "-",
        "Created At": donation.createdAt
          ? new Date(donation.createdAt).toLocaleString()
          : "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Donations");

      const columnWidths = [
        { wch: 5 },  
        { wch: 25 },  
        { wch: 30 }, 
        { wch: 15 }, 
        { wch: 15 }, 
        { wch: 40 },  
        { wch: 20 }, 
      ];
      worksheet["!cols"] = columnWidths;

      this.applyExcelStyling(worksheet);

      return XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
        bookSST: false,
      });
    } catch (error) {
      throw new Error("Failed to generate Excel file");
    }
  }

  private applyExcelStyling(worksheet: XLSX.WorkSheet): void {
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    const tableStyle = {
      font: { name: "Arial" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
      alignment: { vertical: "center", wrapText: true },
    };

    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;

        if (R === 0) {
          worksheet[cellAddress].s = headerStyle;
        } else {
          worksheet[cellAddress].s = { ...tableStyle };
        }
      }
    }
  }

  generateFilename(prefix: string = "Donations"): string {
    const today = new Date().toISOString().split("T")[0];
    return `${prefix}_${today}.xlsx`;
  }
}

export default new ExcelService();