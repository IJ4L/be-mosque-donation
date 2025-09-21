import db from "../../../db/index.ts";
import { news } from "../../../db/schema.ts";
import { desc, sql, eq } from "drizzle-orm";

import type {
  News,
  CreateNewsData,
  UpdateNewsData,
  ServiceResult,
  NewsResponse,
} from "../types/news.types.ts";

class NewsService {
  async getNews(page: number, limit: number): Promise<ServiceResult<NewsResponse>> {
    try {
      const offset = (page - 1) * limit;

      const [newsList, countResult] = await Promise.all([
        db.select().from(news).offset(offset).limit(limit).orderBy(desc(news.createdAt)),
        db.select({ count: sql`count(*)` }).from(news),
      ]);

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          news: newsList,
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
        error: "Failed to retrieve news",
      };
    }
  }

  async getNewsById(newsID: number): Promise<ServiceResult<News>> {
    try {
      const newsItem = await db.select().from(news).where(eq(news.newsID, newsID)).limit(1);

      if (newsItem.length === 0) {
        return {
          success: false,
          error: "News tidak ditemukan",
        };
      }

      return {
        success: true,
        data: newsItem[0],
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve news",
      };
    }
  }

  async createNews(newsData: CreateNewsData): Promise<ServiceResult<News>> {
    try {
      const newNews = await db.insert(news).values(newsData).returning();

      return {
        success: true,
        data: newNews[0],
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to create news",
      };
    }
  }

  async updateNews(newsID: number, newsData: UpdateNewsData): Promise<ServiceResult<News>> {
    try {
      const existingNews = await this.getNewsById(newsID);
      if (!existingNews.success) {
        return existingNews;
      }

      const updatePayload = {
        ...newsData,
        updatedAt: new Date(),
      };

      const updatedNews = await db
        .update(news)
        .set(updatePayload)
        .where(eq(news.newsID, newsID))
        .returning();

      return {
        success: true,
        data: updatedNews[0],
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to update news",
      };
    }
  }

  async deleteNews(newsID: number): Promise<ServiceResult<News>> {
    try {
      const existingNews = await this.getNewsById(newsID);
      if (!existingNews.success) {
        return existingNews;
      }

      const deletedNews = await db.delete(news).where(eq(news.newsID, newsID)).returning();

      return {
        success: true,
        data: deletedNews[0],
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete news",
      };
    }
  }
}

export default new NewsService();