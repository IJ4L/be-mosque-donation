import fs from "fs-extra";
import path from "path";
const uploadDir = "uploads";
fs.ensureDirSync(uploadDir);
const parseNewsFormData = async (c) => {
    const formData = await c.req.formData();
    const newsName = formData.get("newsName");
    const newsDescription = formData.get("newsDescription");
    const rawNewsImage = formData.get("newsImage");
    const authorID = 1;
    if (!newsName || !newsDescription || !rawNewsImage) {
        return null;
    }
    let imagePath;
    if (typeof rawNewsImage === "object" && rawNewsImage instanceof File) {
        const ext = path.extname(rawNewsImage.name);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const filePath = path.join(uploadDir, uniqueName);
        await fs.writeFile(filePath, Buffer.from(await rawNewsImage.arrayBuffer()));
        imagePath = `/images/${uniqueName}`;
    }
    else if (typeof rawNewsImage === "string") {
        imagePath = rawNewsImage;
    }
    else {
        return null;
    }
    return { newsName, newsDescription, newsImage: imagePath, authorID };
};
const parseNewsFormDataForUpdate = async (c) => {
    const formData = await c.req.formData();
    const newsName = formData.get("newsName");
    const newsDescription = formData.get("newsDescription");
    const rawNewsImage = formData.get("newsImage");
    const updateData = {};
    if (newsName) {
        updateData.newsName = newsName;
    }
    if (newsDescription) {
        updateData.newsDescription = newsDescription;
    }
    if (rawNewsImage && rawNewsImage !== "") {
        if (typeof rawNewsImage === "object" && rawNewsImage instanceof File && rawNewsImage.size > 0) {
            const ext = path.extname(rawNewsImage.name);
            const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
            const filePath = path.join(uploadDir, uniqueName);
            await fs.writeFile(filePath, Buffer.from(await rawNewsImage.arrayBuffer()));
            updateData.newsImage = `/images/${uniqueName}`;
        }
        else if (typeof rawNewsImage === "string") {
            updateData.newsImage = rawNewsImage;
        }
    }
    if (Object.keys(updateData).length === 0) {
        return null;
    }
    return updateData;
};
const parseDonationsFormData = async (c) => {
    const formData = await c.req.formData();
    const donationAmount = formData.get("donationAmount");
    const donationDeduction = formData.get("donationDeduction") ? parseInt(formData.get("donationDeduction")) : 0;
    const donationType = formData.get("donationType");
    const donaturName = formData.get("donaturName");
    let phoneNumber = formData.get("donaturNumber");
    if (!phoneNumber) {
        phoneNumber = formData.get("phoneNumber") ||
            formData.get("phone") ||
            formData.get("phone_number") || "";
    }
    const donaturMessage = formData.get("donaturMessage");
    if (!donationAmount || !donationType) {
        return null;
    }
    return {
        donationAmount,
        donationDeduction,
        donationType,
        donaturName,
        phoneNumber,
        donaturMessage
    };
};
export { parseNewsFormData, parseNewsFormDataForUpdate };
export { parseDonationsFormData };
