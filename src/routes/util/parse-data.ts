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

  // Log all form keys for debugging
  console.log("Form data keys:", [...formData.keys()]);
  
  const donationAmount = formData.get("donationAmount") as string;
  const donationDeduction = formData.get("donationDeduction") ? parseInt(formData.get("donationDeduction") as string) : 0;
  const donationType = formData.get("donationType") as string;
  const donaturName = formData.get("donaturName") as string;
  
  // Handle phone number explicitly and log its value
  // First check for "donaturNumber" which is what the form is actually using
  let phoneNumber = formData.get("donaturNumber") as string;
  console.log("Raw phone number from donaturNumber field:", phoneNumber);
  
  // Also try alternate field names as fallback
  if (!phoneNumber) {
    phoneNumber = formData.get("phoneNumber") as string || 
                  formData.get("phone") as string || 
                  formData.get("phone_number") as string || "";
    console.log("Phone number from alternate fields:", phoneNumber);
  }
  
  const donaturMessage = formData.get("donaturMessage") as string;

  if (!donationAmount || !donationType) {
    return null;
  }

  // Log the final phone number we're using
  console.log("Final phone number to be used:", phoneNumber);

  return { 
    donationAmount, 
    donationDeduction, 
    donationType, 
    donaturName, 
    phoneNumber, // This will now use donaturNumber from the form
    donaturMessage 
  };
}

export { parseNewsFormData };
export { parseDonationsFormData };