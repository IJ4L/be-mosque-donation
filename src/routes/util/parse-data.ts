import fs from "fs-extra";
import path from "path";

const uploadDir = "uploads";
fs.ensureDirSync(uploadDir);

const parseFormData = async (c: any) => {
  const formData = await c.req.formData();

  const newsName = formData.get("newsName");
  const newsDescription = formData.get("newsDescription");
  const newsImage = formData.get("newsImage") as File;
  const authorID = formData.get("authorID");

  if (!authorID || !newsName || !newsDescription || !newsImage) {
    return null;
  }

  const ext = path.extname(newsImage.name);
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(uploadDir, uniqueName);

  await fs.writeFile(filePath, Buffer.from(await newsImage.arrayBuffer()));

  const parsedAuthorID = parseInt(authorID, 10);
  if (isNaN(parsedAuthorID)) return null;

  return { newsName, newsDescription, newsImage: `/images/${uniqueName}`, authorID: parsedAuthorID };
};

export default parseFormData;