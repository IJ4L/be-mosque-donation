import env from "../env.js";

const sendWhatsAppMessage = async (
  phone: string,
  message: string
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("message", message);

    const response = await fetch(env.WABLAS_DOMAIN + "/api/send-message", {
      method: "POST",
      headers: {
        Authorization: env.WABLAS_TOKEN + "." + env.WABLAS_SECRET,
      },
      body: formData,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export default sendWhatsAppMessage;
