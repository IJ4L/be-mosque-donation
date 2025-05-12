import fs from "fs-extra";
import path from "path";

const uploadDir = "uploads";
fs.ensureDirSync(uploadDir);

const parseNewsFormData = async (c: any) => {
    const formData = await c.req.formData();
  
    const newsName = formData.get("newsName");
    const newsDescription = formData.get("newsDescription");
    const rawNewsImage = formData.get("newsImage");
  
    const authorID = 1;
  
    if (!newsName || !newsDescription || !rawNewsImage) {
      return null;
    }
  
    let imagePath: string;
  
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

const parseDonationsFormData = async (c: any) => {
  const formData = await c.req.formData();

  const donationAmount = formData.get("donationAmount") as number;
  const donationDeduction = formData.get("donationDeduction") as number;
  const donationType = formData.get("donationType") as string;
  const donaturName = formData.get("donaturName") as string;
  const donaturEmail = formData.get("donaturEmail") as string;
  const donaturMessage = formData.get("donaturMessage") as string;

  if (!donationAmount || !donationDeduction || !donationType || !donaturName) {
    return null;
  }

  return { donationAmount, donationDeduction, donationType, donaturName, donaturEmail, donaturMessage };
}

export { parseNewsFormData };
export { parseDonationsFormData };