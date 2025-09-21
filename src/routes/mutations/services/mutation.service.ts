import db from "../../../db/index.js";
import { mutations, donations } from "../../../db/schema.js";
import { desc, sql, eq } from "drizzle-orm";
import type {
  Mutation,
  CreateMutationData,
  ServiceResult,
  PaginationData,
  MutationSummary,
  PayoutRequest,
} from "../types/mutation.types.ts";

class MutationService {
  async getMutations(page: number, limit: number): Promise<ServiceResult<{ mutations: Mutation[]; pagination: PaginationData }>> {
    try {
      const offset = (page - 1) * limit;

      const [mutationsList, countResult] = await Promise.all([
        db
          .select()
          .from(mutations)
          .offset(offset)
          .limit(limit)
          .orderBy(desc(mutations.createdAt)),
        db
          .select({
            count: sql`count(*)`.mapWith(Number),
          })
          .from(mutations),
      ]);

      const total = countResult[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          mutations: mutationsList,
          pagination: {
            total,
            page,
            limit,
            totalPages,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve mutations",
      };
    }
  }

  async getAllMutations(): Promise<ServiceResult<Mutation[]>> {
    try {
      const mutationsList = await db
        .select()
        .from(mutations)
        .orderBy(desc(mutations.createdAt));

      return {
        success: true,
        data: mutationsList,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve all mutations",
      };
    }
  }

  async getSummary(): Promise<ServiceResult<MutationSummary>> {
    try {
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      const [summaryResult] = await db
        .select({
          totalIncome: sql`COALESCE(SUM(CASE WHEN ${mutations.mutationType} = 'Income' AND ${mutations.mutationStatus} = 'completed' THEN ${mutations.mutationAmount} ELSE 0 END), 0)`.mapWith(Number),
          totalOutcome: sql`COALESCE(SUM(CASE WHEN ${mutations.mutationType} = 'Outcome' AND ${mutations.mutationStatus} = 'completed' THEN ${mutations.mutationAmount} ELSE 0 END), 0)`.mapWith(Number),
          totalPending: sql`COALESCE(SUM(CASE WHEN ${mutations.mutationStatus} = 'pending' THEN ${mutations.mutationAmount} ELSE 0 END), 0)`.mapWith(Number),
        })
        .from(mutations);

      const totalBalance = summaryResult.totalIncome - summaryResult.totalOutcome;

      const [withdrawableResult] = await db
        .select({
          withdrawableIncome: sql`COALESCE(SUM(CASE WHEN ${mutations.mutationType} = 'Income' AND ${mutations.mutationStatus} = 'completed' AND ${mutations.createdAt} <= ${fourDaysAgo.toISOString()} THEN ${mutations.mutationAmount} ELSE 0 END), 0)`.mapWith(Number),
        })
        .from(mutations);

      const withdrawableBalance = withdrawableResult.withdrawableIncome - summaryResult.totalOutcome;

      return {
        success: true,
        data: {
          totalIncome: summaryResult.totalIncome,
          totalOutcome: summaryResult.totalOutcome,
          totalPending: summaryResult.totalPending,
          totalBalance: totalBalance,
          withdrawableBalance: Math.max(0, withdrawableBalance),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to generate summary",
      };
    }
  }

  async createPayout(payoutData: PayoutRequest): Promise<ServiceResult<Mutation>> {
    try {
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      const [withdrawableResult] = await db
        .select({
          withdrawableIncome: sql`COALESCE(SUM(CASE WHEN ${mutations.mutationType} = 'Income' AND ${mutations.mutationStatus} = 'completed' AND ${mutations.createdAt} <= ${fourDaysAgo.toISOString()} THEN ${mutations.mutationAmount} ELSE 0 END), 0)`.mapWith(Number),
          totalOutcome: sql`COALESCE(SUM(CASE WHEN ${mutations.mutationType} = 'Outcome' AND ${mutations.mutationStatus} = 'completed' THEN ${mutations.mutationAmount} ELSE 0 END), 0)`.mapWith(Number),
        })
        .from(mutations);

      const withdrawableBalance = withdrawableResult.withdrawableIncome - withdrawableResult.totalOutcome;

      if (payoutData.amount > withdrawableBalance) {
        return {
          success: false,
          error: "Jumlah penarikan melebihi saldo yang tersedia",
        };
      }

      const [newMutation] = await db
        .insert(mutations)
        .values({
          mutationType: "Outcome",
          mutationAmount: payoutData.amount,
          mutationDescription: payoutData.description || "Payout",
          mutationStatus: "pending",
        })
        .returning();

      return {
        success: true,
        data: newMutation,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to create payout",
      };
    }
  }

  async approvePayout(mutationID: number): Promise<ServiceResult<Mutation>> {
    try {
      const [updatedMutation] = await db
        .update(mutations)
        .set({
          mutationStatus: "completed",
          updatedAt: new Date(),
        })
        .where(eq(mutations.mutationID, mutationID))
        .returning();

      if (!updatedMutation) {
        return {
          success: false,
          error: "Mutation tidak ditemukan",
        };
      }

      return {
        success: true,
        data: updatedMutation,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to approve payout",
      };
    }
  }

  async createMutation(mutationData: CreateMutationData): Promise<ServiceResult<Mutation>> {
    try {
      const [newMutation] = await db
        .insert(mutations)
        .values(mutationData)
        .returning();

      return {
        success: true,
        data: newMutation,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to create mutation",
      };
    }
  }
}

export default new MutationService();