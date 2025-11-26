import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "../../lib/types.js";
import { parseDonationsFormData } from "../util/parse-data.js";

import midtransService from "./services/midtrans.service.js";
import donationService from "./services/donation.service.js";
import excelService from "./services/excel.service.js";

import type {
  CallbackRoute,
  CreateRoute,
  ExcelRoute,
  GetRoute,
  GetTopDonationsRoute,
} from "./donations.routes.js";

import {
  sanitizeDonationData,
  extractDonationFromCallback,
  validateDonation,
  createResponse,
  logDonation,
} from "./utils/donation.utils.js";
import sendWhatsAppMessage from "../../middlewares/wa-gateway.js";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  try {
    const rawDonation = await parseDonationsFormData(c);
    const donation = sanitizeDonationData(rawDonation);

    if (!donation) {
      logDonation("CREATE_FAILED", { error: "Invalid donation data" });
      return c.json(
        createResponse("Invalid donation", null, false),
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const validationErrors = validateDonation(donation);
    if (validationErrors.length > 0) {
      logDonation("VALIDATION_FAILED", { errors: validationErrors });
      return c.json(
        createResponse(validationErrors.join(", "), null, false),
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const orderId = midtransService.generateOrderId();
    const transactionParams = midtransService.createTransactionParams(
      orderId,
      donation.donaturName,
      donation.phoneNumber,
      donation.donaturMessage,
      Number(donation.donationAmount)
    );

    logDonation("CREATING_TRANSACTION", { orderId, params: transactionParams });

    const transaction = await midtransService.createTransaction(
      transactionParams
    );

    logDonation("TRANSACTION_CREATED", { orderId, token: transaction.token });

    return c.json(
      createResponse("Donation Created", {
        token: transaction.token,
        redirect: transaction.redirect_url,
      }),
      HttpStatusCodes.OK
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logDonation("CREATE_ERROR", { error: errorMessage });
    return c.json(
      createResponse("Error creating donation", null, false),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const midtransCallback: AppRouteHandler<CallbackRoute> = async (c) => {
  try {
    const body = await c.req.json();
    const orderId = body.order_id;

    logDonation("CALLBACK_RECEIVED", body, orderId);

    const isSuccess = midtransService.isTransactionSuccessful(
      body.transaction_status,
      body.fraud_status
    );

    if (!isSuccess) {
      logDonation(
        "TRANSACTION_NOT_SUCCESS",
        {
          status: body.transaction_status,
          fraud: body.fraud_status,
        },
        orderId
      );

      return c.json(
        createResponse("Transaksi belum berhasil, tidak disimpan", {
          order_id: orderId || "",
          transaction_status: body.transaction_status || "",
          fraud_status: body.fraud_status || "",
          status_code: body.status_code || "",
          status_message: body.status_message || "",
        }),
        HttpStatusCodes.OK
      );
    }

    const alreadyExists = await donationService.checkExistingMutation(orderId);
    if (alreadyExists) {
      logDonation("DUPLICATE_TRANSACTION", { orderId });
      return c.json(
        createResponse("Transaksi sudah pernah disimpan", {
          order_id: orderId || "",
          transaction_status: body.transaction_status || "",
          fraud_status: body.fraud_status || "",
          status_code: body.status_code || "",
          status_message: body.status_message || "",
        }),
        HttpStatusCodes.OK
      );
    }

    const deductionInfo = midtransService.calculateDeduction(body);
    logDonation(
      "DEDUCTION_CALCULATED",
      {
        ...deductionInfo,
        paymentType: body.payment_type,
        orderId: orderId,
      },
      orderId
    );

    const donationData = extractDonationFromCallback(
      body,
      deductionInfo.finalDeduction
    );
    logDonation("DONATION_DATA_EXTRACTED", donationData, orderId);

    await donationService.saveDonation(donationData, orderId, deductionInfo);
    logDonation("DONATION_SAVED", {
      orderId,
      netAmount: deductionInfo.grossAmount - deductionInfo.finalDeduction,
    });

    sendWhatsAppMessage(
      "082188749035",
      `🕌 Donasi baru dari *${donationData.donaturName}* – Rp ${donationData.donationAmount}.
Silakan admin meninjau.`
    );

    sendWhatsAppMessage(
      donationData.phoneNumber,
      `🕌 Terima kasih *${donationData.donaturName}* atas donasinya sebesar Rp ${donationData.donationAmount}.
Semoga Allah membalas kebaikan Anda.`
    );

    return c.json(
      createResponse("Data transaksi berhasil disimpan", {
        order_id: orderId || "",
        transaction_status: body.transaction_status || "",
        fraud_status: body.fraud_status || "",
        status_code: body.status_code || "",
        status_message: body.status_message || "",
      }),
      HttpStatusCodes.OK
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logDonation("CALLBACK_ERROR", { error: errorMessage });
    return c.json(
      createResponse("Error saving donation", null, false),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const get: AppRouteHandler<GetRoute> = async (c) => {
  try {
    const { page, limit } = c.req.valid("query");
    const result = await donationService.getDonations(page, limit);

    const transformedResult = {
      ...result,
      donations: result.donations.map((donation) => ({
        ...donation,
        createdAt: donation.createdAt.toISOString(),
        updatedAt: donation.updatedAt.toISOString(),
      })),
    };

    return c.json(
      {
        message: "Donations retrieved",
        data: transformedResult,
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    throw error;
  }
};

export const generateExcel: AppRouteHandler<ExcelRoute> = async (c) => {
  try {
    const donations = await donationService.getAllDonations();
    const excelBuffer = excelService.generateDonationsExcel(donations);
    const filename = excelService.generateFilename("Donations");

    c.header("Content-Disposition", `attachment; filename="${filename}"`);
    c.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return c.body(excelBuffer);
  } catch (error) {
    return c.json(
      createResponse("Error generating Excel file", null, false),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const getTopDonations: AppRouteHandler<GetTopDonationsRoute> = async (
  c
) => {
  try {
    const topDonations = await donationService.getTopDonations(5);

    const transformedDonations = topDonations.map((donation) => ({
      ...donation,
      createdAt: donation.createdAt.toISOString(),
      updatedAt: donation.updatedAt.toISOString(),
    }));

    return c.json(
      createResponse("Top donations retrieved", transformedDonations),
      HttpStatusCodes.OK
    );
  } catch (error) {
    return c.json(
      createResponse("Error retrieving top donations", null, false),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

