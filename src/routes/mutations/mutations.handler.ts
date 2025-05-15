import db from "../../db/index.ts";
import { mutations, donations } from "../../db/schema.ts";
import type { AppRouteHandler } from "../../lib/types.ts";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { GetRoute, ExcelRoute, SummaryRoute } from "./mutations.routes.ts";
import { desc, sql } from "drizzle-orm";
import * as XLSX from "xlsx";

export const get: AppRouteHandler<GetRoute> = async (c) => {
  const { page, limit } = c.req.valid('query');
  const offset = (page - 1) * limit;
  
  const countResult = await db.select({
    count: sql`count(*)`.mapWith(Number)
  }).from(mutations);
  
  const total = countResult[0].count;
  const totalPages = Math.ceil(total / limit);
  
  const mutationsList = await db.select()
    .from(mutations)
    .orderBy(desc(mutations.createdAt))
    .limit(limit)
    .offset(offset);
    
  return c.json(
    { 
      message: "Mutations retrieved", 
      data: {
        mutations: mutationsList,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      } 
    },
    HttpStatusCodes.OK
  );
};

export const generateExcel: AppRouteHandler<ExcelRoute> = async (c) => {
  try {
    const mutationsList = await db.select()
      .from(mutations)
      .orderBy(desc(mutations.createdAt));
      
    const worksheetData = mutationsList.map(mutation => ({
      'ID': mutation.mutationID,
      'Type': mutation.mutationType,
      'Amount': mutation.mutationAmount,
      'Description': mutation.mutationDescription || '-',
      'Created At': mutation.createdAt ? new Date(mutation.createdAt).toLocaleString() : '-',
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mutations');
    
    const columnWidths = [
      { wch: 5 },
      { wch: 15 },
      { wch: 15 },
      { wch: 40 },
      { wch: 20 },
    ];
    worksheet['!cols'] = columnWidths;
    
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
    
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const tableStyle = {
      font: { name: "Arial" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      },
      alignment: { vertical: "center", wrapText: true }
    };
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;
        
        if (R === 0) {
          worksheet[cellAddress].s = headerStyle;
        } 
        else {
          const rowStyle = {...tableStyle};
          worksheet[cellAddress].s = rowStyle;
        }
      }
    }
    
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      bookSST: false
    });
    
    const filename = `Mutations_${new Date().toISOString().split('T')[0]}.xlsx`;
    c.header('Content-Disposition', `attachment; filename="${filename}"`);
    c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    return c.body(excelBuffer);
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return c.json(
      { message: "Error generating Excel file", data: null },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const getSummary: AppRouteHandler<SummaryRoute> = async (c) => {
  try {  
    const donationList = await db.select({
      amount: donations.donationAmount
    })
    .from(donations);
    
    const income = donationList.reduce((sum, donation) => {
      const amount = parseFloat(donation.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const spendingResult = await db.select({
      total: sql`COALESCE(SUM(mutation_amount), 0)`.mapWith(Number)
    })
    .from(mutations)
    .where(sql`mutation_type = 'Spending'`);
    
    const spending = spendingResult[0]?.total || 0;
    const balance = income - spending;
    
    return c.json(
      { 
        message: "Mutation summary retrieved", 
        data: {
          income: income,
          spending: spending,
          balance: balance
        } 
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Error retrieving summary:", error);
    return c.json(
      { message: "Error retrieving summary", data: null },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};