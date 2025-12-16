import * as HttpStatusCodes from "stoker/http-status-codes";
import { parseNewsFormData, parseNewsFormDataForUpdate, } from "../util/parse-data.js";
import newsService from "./services/news.service.js";
import { ValidationUtils, ResponseUtils, TransformUtils, } from "./utils/news.utils.js";
export const list = async (c) => {
    try {
        const { page, limit } = c.req.valid("query");
        const result = await newsService.getNews(page, limit);
        if (!result.success) {
            throw new Error(result.error);
        }
        const transformedNews = result.data.news.map(TransformUtils.transformNewsDates);
        return c.json({
            message: "Successfully get news",
            data: transformedNews,
            pagination: result.data.pagination,
        }, HttpStatusCodes.OK);
    }
    catch (error) {
        throw error;
    }
};
export const create = async (c) => {
    try {
        const rawNewsData = await parseNewsFormData(c);
        if (!rawNewsData) {
            return c.json({ message: "Invalid request body", data: null }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
        }
        const newsData = TransformUtils.sanitizeNewsData(rawNewsData);
        const validation = ValidationUtils.validateCreateNews(newsData);
        if (!validation.isValid) {
            return c.json({ message: validation.errors.join(", "), data: null }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
        }
        const createData = {
            newsImage: newsData.newsImage,
            newsName: newsData.newsName,
            newsDescription: newsData.newsDescription,
        };
        const result = await newsService.createNews(createData);
        if (!result.success) {
            return c.json({ message: result.error, data: null }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
        const transformedNews = TransformUtils.transformNewsDates(result.data);
        return c.json({
            message: "News created successfully",
            data: transformedNews,
        }, HttpStatusCodes.OK);
    }
    catch (error) {
        return c.json({ message: "Failed to create news", data: null }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};
export const getOne = async (c) => {
    try {
        const { id } = c.req.valid("param");
        const result = await newsService.getNewsById(id);
        if (!result.success) {
            if (result.error?.includes("tidak ditemukan")) {
                return c.json({ message: result.error, data: null }, HttpStatusCodes.NOT_FOUND);
            }
            throw new Error(result.error);
        }
        const transformedNews = TransformUtils.transformNewsDates(result.data);
        return c.json({
            message: "News retrieved successfully",
            data: transformedNews,
        }, HttpStatusCodes.OK);
    }
    catch (error) {
        throw error;
    }
};
export const patch = async (c) => {
    try {
        const { id } = c.req.valid("param");
        const rawUpdateData = await parseNewsFormDataForUpdate(c);
        if (!rawUpdateData) {
            return c.json({ message: "Invalid request body", data: null }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
        }
        const updateValidation = ValidationUtils.validateUpdateNews(rawUpdateData);
        if (!updateValidation.isValid) {
            return c.json({ message: updateValidation.errors.join(", "), data: null }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
        }
        const result = await newsService.updateNews(id, rawUpdateData);
        if (!result.success) {
            if (result.error?.includes("tidak ditemukan")) {
                return c.json({ message: result.error, data: null }, HttpStatusCodes.NOT_FOUND);
            }
            throw new Error(result.error);
        }
        const transformedNews = TransformUtils.transformNewsDates(result.data);
        return c.json({
            message: "Successfully updated news",
            data: transformedNews,
        }, HttpStatusCodes.OK);
    }
    catch (error) {
        throw error;
    }
};
export const remove = async (c) => {
    try {
        const { id } = c.req.valid("param");
        const result = await newsService.deleteNews(id);
        if (!result.success) {
            if (result.error?.includes("tidak ditemukan")) {
                return c.json({ message: result.error }, HttpStatusCodes.NOT_FOUND);
            }
            throw new Error(result.error);
        }
        return c.json({ message: "Successfully deleted news" }, HttpStatusCodes.OK);
    }
    catch (error) {
        throw error;
    }
};
