import type {
  DonationData,
  MidtransCallbackBody,
} from "../types/donation.types.js";

export function sanitizeDonationData(donation: any): DonationData | null {
  if (!donation) return null;

  return {
    donationAmount: String(donation.donationAmount || "0"),
    donationDeduction: Number(donation.donationDeduction || 0),
    donationType: String(donation.donationType || ""),
    donaturName: String(donation.donaturName || "Hamba Allah."),
    phoneNumber: String(donation.phoneNumber || "-"),
    donaturMessage: String(donation.donaturMessage || "-"),
  };
}

export function extractDonationFromCallback(
  body: MidtransCallbackBody,
  deduction: number
): DonationData {
  const donaturName = body.custom_field1 || "Hamba Allah.";

  let phoneNumber = body.custom_field2 || "";
  if ((!phoneNumber || phoneNumber === "-") && body.customer_details?.phone) {
    phoneNumber = body.customer_details.phone;
  }
  phoneNumber = phoneNumber || "-";

  const donaturMessage = body.custom_field3 || "-";
  const donationAmount = body.gross_amount;
  const donationType = body.payment_type;

  return {
    donationAmount: String(donationAmount),
    donationDeduction: deduction,
    donationType,
    donaturName,
    phoneNumber,
    donaturMessage,
  };
}

export function validateDonation(donation: DonationData): string[] {
  const errors: string[] = [];

  if (!donation.donationAmount || parseFloat(donation.donationAmount) <= 0) {
    errors.push("Donation amount must be greater than 0");
  }

  if (!donation.donationType) {
    errors.push("Donation type is required");
  }

  if (!donation.donaturName) {
    errors.push("Donatur name is required");
  }

  return errors;
}

export function formatPhoneForMidtrans(phoneNumber: string): string {
  if (!phoneNumber || phoneNumber === "-" || phoneNumber.trim() === "") {
    return "62000000000";
  }

  let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");

  if (!cleaned.startsWith("62") && !cleaned.startsWith("+62")) {
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    } else {
      cleaned = "62" + cleaned;
    }
  }

  cleaned = cleaned.replace("+", "");

  return cleaned;
}

export function createResponse<T>(
  message: string,
  data: T,
  success: boolean = true
) {
  return {
    message,
    data,
    success,
    timestamp: new Date().toISOString(),
  };
}

export function logDonation(action: string, data: any, orderId?: string) {
  const logData = {
    action,
    orderId,
    timestamp: new Date().toISOString(),
    data,
  };
}

