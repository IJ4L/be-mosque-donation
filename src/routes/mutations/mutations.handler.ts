import db from "../../db/index.ts";
import { mutations, donations } from "../../db/schema.ts";
import type { AppRouteHandler } from "../../lib/types.ts";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { GetRoute, ExcelRoute, SummaryRoute, PayoutRoute, ApprovePayoutRoute } from "./mutations.routes.ts";
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
    const { month } = c.req.valid('query');
      let incomeCondition = sql`mutation_type = 'Income'`;
    let spendingCondition = sql`mutation_type = 'Spending' AND (mutation_status = 'completed' OR mutation_status IS NULL)`;
    
    if (month) {
      const [year, monthNum] = month.split('-');
      if (year && monthNum) {
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);
        
        console.log(`Filtering mutations from ${startDate.toISOString()} to ${endDate.toISOString()}`);
        
        incomeCondition = sql`mutation_type = 'Income' AND created_at >= ${startDate.toISOString()} AND created_at <= ${endDate.toISOString()}`;
        spendingCondition = sql`mutation_type = 'Spending' AND (mutation_status = 'completed' OR mutation_status IS NULL) AND created_at >= ${startDate.toISOString()} AND created_at <= ${endDate.toISOString()}`;
      }
    }
    const incomeResult = await db.select({
      total: sql`COALESCE(SUM(mutation_amount), 0)`.mapWith(Number)
    })
    .from(mutations)
    .where(incomeCondition);
    
    const income = incomeResult[0]?.total || 0;
    
    const spendingResult = await db.select({
      total: sql`COALESCE(SUM(mutation_amount), 0)`.mapWith(Number)
    })
    .from(mutations)
    .where(spendingCondition);
    
    const spending = spendingResult[0]?.total || 0;
    const balance = income - spending;
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    let withdrawableIncomeCondition = sql`mutation_type = 'Income' AND created_at < ${oneDayAgo.toISOString()}`;
    let withdrawableSpendingCondition = sql`mutation_type = 'Spending' AND (mutation_status = 'completed' OR mutation_status IS NULL)`;
    
    if (month) {
      const [year, monthNum] = month.split('-');
      if (year && monthNum) {
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);
        
        withdrawableIncomeCondition = sql`mutation_type = 'Income' AND created_at < ${oneDayAgo.toISOString()} AND created_at >= ${startDate.toISOString()} AND created_at <= ${endDate.toISOString()}`;
        withdrawableSpendingCondition = sql`mutation_type = 'Spending' AND (mutation_status = 'completed' OR mutation_status IS NULL) AND created_at >= ${startDate.toISOString()} AND created_at <= ${endDate.toISOString()}`;
      }
    }
    
    const withdrawableIncomeResult = await db.select({
      total: sql`COALESCE(SUM(mutation_amount), 0)`.mapWith(Number)
    })
    .from(mutations)
    .where(withdrawableIncomeCondition);
    
    const withdrawableIncome = withdrawableIncomeResult[0]?.total || 0;
    
    const withdrawableSpendingResult = await db.select({
      total: sql`COALESCE(SUM(mutation_amount), 0)`.mapWith(Number)
    })
    .from(mutations)
    .where(withdrawableSpendingCondition);
    
    const withdrawableSpending = withdrawableSpendingResult[0]?.total || 0;
    const withdrawableBalance = withdrawableIncome - withdrawableSpending;
    
    let period = "All Time";
    if (month) {
      const [year, monthNum] = month.split('-');
      if (year && monthNum) {
        const monthNames = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const monthIndex = parseInt(monthNum) - 1;
        const monthName = monthNames[monthIndex];
        period = `${monthName} ${year}`;
      }
    }

    return c.json(
      { 
        message: "Mutation summary retrieved", 
        data: {
          income: income,
          spending: spending,
          balance: balance,
          withdrawableBalance: withdrawableBalance,
          period: period
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

export const createPayout: AppRouteHandler<PayoutRoute> = async (c) => {
  try {
    const { amount, description } = await c.req.json();
    
    if (!amount || amount <= 0) {
      return c.json(
        { message: "Jumlah payout harus lebih dari 0", data: null },
        HttpStatusCodes.BAD_REQUEST
      );
    }

    if (!description || description.trim() === '') {
      return c.json(
        { message: "Deskripsi payout harus diisi", data: null },
        HttpStatusCodes.BAD_REQUEST
      );
    }
    const pendingPayouts = await db
      .select()
      .from(mutations)
      .where(sql`mutation_type = 'Spending' AND mutation_status = 'pending'`);
    
    if (pendingPayouts.length > 0) {
      return c.json(
        { 
          message: "Tidak dapat membuat payout baru karena terdapat payout yang masih pending", 
          data: null 
        },
        HttpStatusCodes.BAD_REQUEST
      );
    }
    const incomeResult = await db.select({
      total: sql`COALESCE(SUM(mutation_amount), 0)`.mapWith(Number)
    })
    .from(mutations)
    .where(sql`mutation_type = 'Income'`);
    
    const income = incomeResult[0]?.total || 0;
    
    const spendingResult = await db.select({
      total: sql`COALESCE(SUM(mutation_amount), 0)`.mapWith(Number)
    })
    .from(mutations)
    .where(sql`mutation_type = 'Spending' AND (mutation_status = 'completed' OR mutation_status IS NULL)`);
    
    const spending = spendingResult[0]?.total || 0;
    const currentBalance = income - spending;
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const withdrawableIncomeResult = await db.select({
      total: sql`COALESCE(SUM(mutation_amount), 0)`.mapWith(Number)
    })
    .from(mutations)
    .where(sql`mutation_type = 'Income' AND created_at < ${oneDayAgo.toISOString()}`);
    
    const withdrawableIncome = withdrawableIncomeResult[0]?.total || 0;
    
    const withdrawableSpendingResult = await db.select({
      total: sql`COALESCE(SUM(mutation_amount), 0)`.mapWith(Number)
    })
    .from(mutations)
    .where(sql`mutation_type = 'Spending' AND (mutation_status = 'completed' OR mutation_status IS NULL)`);
    
    const withdrawableSpending = withdrawableSpendingResult[0]?.total || 0;
    const withdrawableBalance = withdrawableIncome - withdrawableSpending;
    
    if (amount > currentBalance) {
      return c.json(
        { 
          message: `Jumlah penarikan (${amount}) melebihi saldo total yang tersedia (${currentBalance})`, 
          data: null 
        },
        HttpStatusCodes.BAD_REQUEST
      );
    }
    
    if (amount > withdrawableBalance) {
      return c.json(
        { 
          message: `Jumlah penarikan (${amount}) melebihi saldo yang dapat dicairkan (${withdrawableBalance}). Saldo donasi yang baru masuk harus menunggu minimal 1 hari untuk dapat dicairkan.`, 
          data: null 
        },
        HttpStatusCodes.BAD_REQUEST
      );
    }
    
    const payoutData = {
      mutationType: "Spending",
      mutationAmount: amount,
      mutationDescription: description,
      mutationStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.insert(mutations).values(payoutData).returning();
    
    if (!result || result.length === 0) {
      return c.json(
        { message: "Gagal membuat payout", data: null },
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    
    return c.json(
      {
        message: "Payout berhasil dibuat dengan status pending",
        data: result[0]
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Error saat membuat payout:", error);
    return c.json(
      { message: "Terjadi kesalahan saat membuat payout", data: null },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const approvePayout: AppRouteHandler<ApprovePayoutRoute> = async (c) => {
  try {
    const mutationID = parseInt(c.req.param("mutationID"));
    
    if (isNaN(mutationID)) {
      return c.json(
        { message: "ID mutasi tidak valid", data: null },
        HttpStatusCodes.BAD_REQUEST
      );
    }
    
    const existingPayout = await db
      .select()
      .from(mutations)
      .where(sql`mutation_id = ${mutationID} AND mutation_type = 'Spending' AND mutation_status = 'pending'`)
      .limit(1);
      
    if (!existingPayout || existingPayout.length === 0) {
      return c.json(
        { message: "Payout tidak ditemukan atau bukan berstatus pending", data: null },
        HttpStatusCodes.NOT_FOUND
      );
    }
    
    const result = await db
      .update(mutations)
      .set({
        mutationStatus: "completed",
        updatedAt: new Date()
      })
      .where(sql`mutation_id = ${mutationID}`)
      .returning();
      
    if (!result || result.length === 0) {
      return c.json(
        { message: "Gagal mengupdate status payout", data: null },
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    
    return c.json(
      {
        message: "Payout berhasil disetujui dan status diubah menjadi completed",
        data: result[0]
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Error saat approve payout:", error);
    return c.json(
      { message: "Terjadi kesalahan saat approve payout", data: null },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};