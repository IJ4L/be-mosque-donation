import midtransClient from "midtrans-client";
import env from "../../../env.js";
class MidtransService {
    snap;
    constructor() {
        this.snap = new midtransClient.Snap({
            isProduction: env.MIDTRANS_IS_PRODUCTION === "true",
            serverKey: env.MIDTRANS_SERVER_KEY,
            clientKey: env.MIDTRANS_CLIENT_KEY,
        });
    }
    async createTransaction(params) {
        try {
            const transaction = await this.snap.createTransaction(params);
            return {
                token: transaction.token,
                redirect_url: transaction.redirect_url,
            };
        }
        catch (error) {
            throw new Error("Failed to create payment transaction");
        }
    }
    generateOrderId() {
        return `ORDER-${Date.now()}`;
    }
    createTransactionParams(orderId, donaturName, phoneNumber, donaturMessage, amount) {
        const phoneForMidtrans = phoneNumber && phoneNumber !== "-" && phoneNumber.trim() !== ""
            ? phoneNumber
            : "62000000000";
        return {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            customer_details: {
                first_name: donaturName,
                phone: phoneForMidtrans,
            },
            item_details: [
                {
                    id: "donasi_custom",
                    name: "Donasi Spesial",
                    price: amount,
                    quantity: 1,
                },
            ],
            custom_field1: donaturName,
            custom_field2: phoneNumber,
            custom_field3: donaturMessage,
        };
    }
    calculateDeduction(body) {
        const grossAmount = parseFloat(body.gross_amount || "0");
        const settlementGross = parseFloat(body.settlement_gross || body.gross_amount || "0");
        const transactionFee = parseFloat(body.transaction_fee || "0");
        let calculatedDeduction = 0;
        if (body.transaction_fee && transactionFee > 0) {
            calculatedDeduction = transactionFee;
        }
        else if (body.settlement_gross && body.settlement_gross !== body.gross_amount) {
            calculatedDeduction = grossAmount - settlementGross;
        }
        else {
            calculatedDeduction = this.calculateFeeByPaymentType(body.payment_type, grossAmount);
        }
        const finalDeduction = Math.max(0, calculatedDeduction);
        return {
            grossAmount,
            settlementGross,
            transactionFee,
            calculatedDeduction,
            finalDeduction,
        };
    }
    calculateFeeByPaymentType(paymentType, amount) {
        const feeRates = {
            'qris': 0.007,
            'gopay': 0.007,
            'shopeepay': 0.007,
            'bank_transfer': amount >= 10000 ? 4000 : 0,
            'permata': amount >= 10000 ? 4000 : 0,
            'bca': amount >= 10000 ? 4000 : 0,
            'bni': amount >= 10000 ? 4000 : 0,
            'bri': amount >= 10000 ? 4000 : 0,
            'mandiri': amount >= 10000 ? 4000 : 0,
            'credit_card': 0.029,
            'cstore': 2500,
            'indomaret': 2500,
            'alfamart': 2500,
        };
        const lowerPaymentType = paymentType.toLowerCase();
        if (lowerPaymentType in feeRates) {
            const rate = feeRates[lowerPaymentType];
            return rate < 1 ? amount * rate : rate;
        }
        for (const [key, rate] of Object.entries(feeRates)) {
            if (lowerPaymentType.includes(key)) {
                return rate < 1 ? amount * rate : rate;
            }
        }
        return amount * 0.007;
    }
    isTransactionSuccessful(transactionStatus, fraudStatus) {
        return (transactionStatus === "settlement" ||
            (transactionStatus === "capture" && fraudStatus === "accept"));
    }
}
export default new MidtransService();
