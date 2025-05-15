import db from "../../db/index.ts";
import { donations, mutations } from "../../db/schema.ts";
import type { AppRouteHandler } from "../../lib/types.ts";
import { parseDonationsFormData } from "../util/parse-data.ts";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type {
  CallbackRoute,
  CreateRoute,
  ExcelRoute,
  GetRoute,
} from "./donations.routes.ts";
// import sendWhatsAppMessage from "../../middlewares/wa-gateway.ts";
import midtransClient from "midtrans-client";
import env from "../../env.ts";
import { desc, sql } from "drizzle-orm";
import * as XLSX from "xlsx";

const snap = new midtransClient.Snap({
  isProduction: env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: env.MIDTRANS_SERVER_KEY,
  clientKey: env.MIDTRANS_CLIENT_KEY,
});

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const donation = await parseDonationsFormData(c);
  if (!donation) {
    return c.json(
      { message: "Invalid donation", data: null },
      HttpStatusCodes.BAD_REQUEST
    );
  }

  try {
    const orderId = `ORDER-${Date.now()}`;
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: donation.donationAmount,
      },
      customer_details: {
        first_name: donation.donaturName,
        email: donation.donaturEmail,
      },
      item_details: [
        {
          id: "donasi_custom",
          name: "Donasi Spesial",
          price: donation.donationAmount,
          quantity: 1,
        },
      ],
      custom_field1: donation.donaturName,
      custom_field2: donation.donaturEmail,
      custom_field3: donation.donaturMessage,
    };
    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;

    return c.json(
      {
        message: "Donation Created",
        data: {
          token: snapToken,
          redirect: transaction.redirect_url,
        },
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Error creating donation:", error);
    return c.json(
      { message: "Error creating donation", data: null },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  //   const sendWAMessage = sendWhatsAppMessage(
  //     "081241438052",
  //     `New donation from ${donation.donaturName} with amount ${donation.donationAmount}`
  //   );
  //   if (!sendWAMessage) {
  //     return c.json(
  //       { message: "Error creating donation", data: null },
  //       HttpStatusCodes.INTERNAL_SERVER_ERROR
  //     );
  //   }
};

export const midtransCallback: AppRouteHandler<CallbackRoute> = async (c) => {
  const body = await c.req.json();

  const transactionStatus = body.transaction_status;
  const fraudStatus = body.fraud_status;
  const isSuccess =
    transactionStatus === "settlement" ||
    (transactionStatus === "capture" && fraudStatus === "accept");

  if (!isSuccess) {
    return c.json(
      {
        message: "Transaksi belum berhasil, tidak disimpan",
        data: {
          order_id: body.order_id || "",
          transaction_status: transactionStatus || "",
          fraud_status: fraudStatus || "",
          status_code: body.status_code || "",
          status_message: body.status_message || "",
        },
      },
      HttpStatusCodes.OK
    );
  }

  const orderId = body.order_id;
  const donaturName = body.custom_field1;
  const donaturEmail = body.custom_field2;
  const donaturMessage = body.custom_field3;
  const donationAmount = body.gross_amount;
  const donationType = body.payment_type;
  const donationDeduction = 0;

  const donation = {
    donationAmount,
    donationDeduction,
    donationType,
    donaturName,
    donaturEmail,
    donaturMessage,
  };

  try {
    await db.insert(donations).values(donation);
    await db.insert(mutations).values({
      mutationType: "Income", 
      mutationAmount: donationAmount,
      mutationDescription: `Donation from ${donaturName} (${donaturEmail})`,
    });
  } catch (error) {
    console.error("Error saving donation:", error);
    return c.json(
      {
        message: "Error saving donation",
        data: null,
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return c.json(
    {
      message: "Data transaksi berhasil disimpan",
      data: {
        order_id: orderId,
        transaction_status: transactionStatus,
        fraud_status: fraudStatus,
        status_code: body.status_code || "",
        status_message: body.status_message || "",
      },
    },
    HttpStatusCodes.OK
  );
};

export const get: AppRouteHandler<GetRoute> = async (c) => {
  const { page, limit } = c.req.valid('query');
  const offset = (page - 1) * limit;
  
  const countResult = await db.select({
    count: sql`count(*)`.mapWith(Number)
  }).from(donations);
  
  const total = countResult[0].count;
  const totalPages = Math.ceil(total / limit);
  
  const donationsList = await db.select()
    .from(donations)
    .orderBy(desc(donations.createdAt))
    .limit(limit)
    .offset(offset);
    
  return c.json(
    { 
      message: "Donations retrieved", 
      data: {
        donations: donationsList,
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
    const donationsList = await db.select()
      .from(donations)
      .orderBy(desc(donations.createdAt));

    const worksheetData = donationsList.map(donation => ({
      'ID': donation.donationID,
      'Donatur Name': donation.donaturName,
      'Email': donation.donaturEmail || '-',
      'Amount': donation.donationAmount,
      'Type': donation.donationType,
      'Message': donation.donaturMessage || '-',
      'Created At': donation.createdAt ? new Date(donation.createdAt).toLocaleString() : '-',
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations');
    
    const columnWidths = [
      { wch: 5 }, 
      { wch: 25 },
      { wch: 30 },
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
    
    const filename = `Donations_${new Date().toISOString().split('T')[0]}.xlsx`;
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
