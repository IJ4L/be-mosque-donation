import * as HttpStatusCodes from "stoker/http-status-codes";
import mutationService from "./services/mutation.service.js";
import type { AppRouteHandler } from "../../lib/types.js";

import type {
  GetRoute,
  ExcelRoute,
  SummaryRoute,
  PayoutRoute,
  ApprovePayoutRoute,
} from "./mutations.routes.js";

import {
  ExcelService,
  ValidationUtils,
  ResponseUtils,
  TransformUtils,
} from "./utils/mutation.utils.js";
import sendTelegram from "../../middlewares/telegram-gateway.js";

const excelService = new ExcelService();

export const get: AppRouteHandler<GetRoute> = async (c) => {
  try {
    const { page, limit } = c.req.valid("query");
    const result = await mutationService.getMutations(page, limit);

    if (!result.success) {
      throw new Error(result.error!);
    }

    const transformedData = TransformUtils.transformMutationsResponse(
      result.data!.mutations,
      result.data!.pagination
    );

    return c.json(
      {
        message: "Mutations retrieved",
        data: transformedData,
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    throw error;
  }
};

export const generateExcel: AppRouteHandler<ExcelRoute> = async (c) => {
  try {
    const result = await mutationService.getAllMutations();

    if (!result.success) {
      return c.json(
        ResponseUtils.createErrorResponse(result.error!),
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const excelBuffer = excelService.generateMutationsExcel(result.data!);
    const filename = excelService.generateFilename("Mutations");

    c.header("Content-Disposition", `attachment; filename="${filename}"`);
    c.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return c.body(excelBuffer);
  } catch (error) {
    return c.json(
      ResponseUtils.createErrorResponse("Failed to generate Excel file"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const getSummary: AppRouteHandler<SummaryRoute> = async (c) => {
  try {
    const { month } = c.req.valid("query");
    const result = await mutationService.getSummary();

    if (!result.success) {
      return c.json(
        ResponseUtils.createErrorResponse(result.error!),
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const transformedData = {
      income: Number(result.data!.totalIncome) || 0,
      spending: Number(result.data!.totalOutcome) || 0,
      balance: Number(result.data!.totalBalance) || 0,
      withdrawableBalance: Number(result.data!.withdrawableBalance) || 0,
      period: month ? `Month: ${month}` : "All time",
    };

    return c.json(
      {
        message: "Summary retrieved",
        data: transformedData,
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    return c.json(
      ResponseUtils.createErrorResponse("Failed to retrieve summary"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const createPayout: AppRouteHandler<PayoutRoute> = async (c) => {
  try {
    const { amount, description } = await c.req.json();

    const summaryResult = await mutationService.getSummary();
    if (!summaryResult.success) {
      return c.json(
        ResponseUtils.createErrorResponse(summaryResult.error!),
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const validation = ValidationUtils.validatePayoutAmount(
      amount,
      summaryResult.data!.withdrawableBalance
    );

    if (!validation.isValid) {
      return c.json(
        ResponseUtils.createValidationErrorResponse(validation.errors),
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const result = await mutationService.createPayout({ amount, description });

    if (!result.success) {
      return c.json(
        ResponseUtils.createErrorResponse(result.error!),
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const transformedMutation = TransformUtils.transformMutationDates(
      result.data!
    );

    return c.json(
      ResponseUtils.createSuccessResponse(
        "Payout created successfully",
        transformedMutation
      ),
      HttpStatusCodes.OK
    );
  } catch (error) {
    return c.json(
      ResponseUtils.createErrorResponse("Failed to create payout"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const approvePayout: AppRouteHandler<ApprovePayoutRoute> = async (c) => {
  try {
    const mutationID = parseInt(c.req.param("mutationID"));

    const validation = ValidationUtils.validateMutationID(mutationID);
    if (!validation.isValid) {
      return c.json(
        ResponseUtils.createValidationErrorResponse(validation.errors),
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const result = await mutationService.approvePayout(mutationID);

    if (!result.success) {
      const statusCode = result.error?.includes("tidak ditemukan")
        ? HttpStatusCodes.NOT_FOUND
        : HttpStatusCodes.BAD_REQUEST;

      return c.json(
        ResponseUtils.createErrorResponse(result.error!),
        statusCode
      );
    }

    const transformedMutation = TransformUtils.transformMutationDates(
      result.data!
    );

    //     await sendEmail(
    //       "rijal9246@gmail.com",
    //       `Permintaan Penarikan Dana – ${result.data!.createdAt}`,
    //       `
    // Ada permintaan penarikan dana baru.

    // 📌 Diminta oleh: Admin
    // 💰 Jumlah: Rp ${result.data!.mutationAmount}
    // 🏦 Metode: ${result.data!.mutationType}
    // 📄 Catatan: ${result.data!.mutationDescription || "-"}

    // Silakan admin melakukan pengecekan dan memproses payout sesuai prosedur.
    //   `.trim()
    //     );

    await sendTelegram(
      "-1003627073655",
      `<b>Permintaan Penarikan Dana</b>

📌 <b>Diminta oleh:</b> Admin
💰 <b>Jumlah:</b> Rp ${result.data!.mutationAmount}
🏦 <b>Metode:</b> ${result.data!.mutationType}
📄 <b>Catatan:</b> ${result.data!.mutationDescription || "-"}

Silakan admin melakukan pengecekan dan memproses payout sesuai prosedur.`
    );

    return c.json(
      ResponseUtils.createSuccessResponse(
        "Payout approved successfully",
        transformedMutation
      ),
      HttpStatusCodes.OK
    );
  } catch (error) {
    return c.json(
      ResponseUtils.createErrorResponse("Failed to approve payout"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

