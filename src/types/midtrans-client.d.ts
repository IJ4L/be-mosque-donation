declare module 'midtrans-client' {
  export class Snap {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    
    createTransaction(parameter: {
      transaction_details: {
        order_id: string;
        gross_amount: number;
      };
      customer_details?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
      };
      item_details?: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
      }>;
      [key: string]: any;
    }): Promise<{
      token: string;
      redirect_url: string;
      [key: string]: any;
    }>;
  }

  export class CoreApi {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
  }

  export class Iris {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
    });
  }

  export class MidtransError extends Error {
    constructor(message: string, options?: {
      httpStatusCode?: number;
      ApiResponse?: any;
      rawApiResponseJson?: string;
    });
  }
}
