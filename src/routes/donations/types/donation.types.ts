export interface DonationData {
  donationAmount: string;
  donationDeduction: number;
  donationType: string;
  donaturName: string;
  phoneNumber: string;
  donaturMessage: string;
}

export interface MidtransCallbackBody {
  transaction_status: string;
  fraud_status: string;
  order_id: string;
  gross_amount: string;
  settlement_gross?: string;
  transaction_fee?: string;
  payment_type: string;
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
  customer_details?: {
    phone?: string;
    first_name?: string;
  };
  status_code?: string;
  status_message?: string;
}

export interface MidtransTransactionParams {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    first_name: string;
    phone: string;
  };
  item_details: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  custom_field1: string;
  custom_field2: string;
  custom_field3: string;
}

export interface DeductionCalculation {
  grossAmount: number;
  settlementGross: number;
  transactionFee: number;
  calculatedDeduction: number;
  finalDeduction: number;
}

export interface TransactionResponse {
  token: string;
  redirect_url: string;
}