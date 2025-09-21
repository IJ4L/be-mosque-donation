import db from "../../../db/index.ts";
import { donations, mutations } from "../../../db/schema.ts";
import { desc, sql } from "drizzle-orm";
import type { DonationData, MidtransCallbackBody, DeductionCalculation } from "../types/donation.types.ts";

class DonationService {
  async saveDonation(
    donationData: DonationData,
    orderId: string,
    deductionInfo: DeductionCalculation
  ): Promise<void> {
    try {
      await db.insert(donations).values(donationData);
      const netAmount = deductionInfo.grossAmount - deductionInfo.finalDeduction;
      await db.insert(mutations).values({
        mutationType: "Income",
        mutationAmount: Number(netAmount),
        mutationDescription: `Donation from ${donationData.donaturName} (${donationData.phoneNumber}) - Order ID: ${orderId} | Gross: ${deductionInfo.grossAmount}, Deduction: ${deductionInfo.finalDeduction}, Net: ${netAmount}`,
      });
    } catch (error) {
      throw new Error("Failed to save donation to database");
    }
  }

  async checkExistingMutation(orderId: string): Promise<boolean> {
    try {
      const existingMutation = await db
        .select()
        .from(mutations)
        .where(sql`mutation_description LIKE ${`%${orderId}%`}`)
        .limit(1);

      return existingMutation.length > 0;
    } catch (error) {
      throw new Error("Failed to check existing mutation");
    }
  }

  async getDonations(page: number, limit: number) {
    try {
      const offset = (page - 1) * limit;

      const countResult = await db
        .select({
          count: sql`count(*)`.mapWith(Number),
        })
        .from(donations);

      const total = countResult[0].count;
      const totalPages = Math.ceil(total / limit);

      const donationsList = await db
        .select()
        .from(donations)
        .orderBy(desc(donations.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        donations: donationsList,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      throw new Error("Failed to retrieve donations");
    }
  }

  async getAllDonations() {
    try {
      return await db
        .select()
        .from(donations)
        .orderBy(desc(donations.createdAt));
    } catch (error) {
      throw new Error("Failed to retrieve donations for export");
    }
  }

  async getTopDonations(limit: number = 5) {
    try {
      return await db
        .select()
        .from(donations)
        .orderBy(sql`CAST(${donations.donationAmount} AS NUMERIC) DESC`)
        .limit(limit);
    } catch (error) {
      throw new Error("Failed to retrieve top donations");
    }
  }
}

export default new DonationService();