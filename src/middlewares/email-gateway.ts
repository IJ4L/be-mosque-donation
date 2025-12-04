const sendEmail = async (
  recipient: string,
  subject: string,
  content: string
): Promise<boolean> => {
  try {
    const payload = new URLSearchParams();
    payload.append("api_token", "c14e45e1a437327bcd0db303a09dde9d");
    payload.append("from_name", "Markaz Ulul Ilmi");
    payload.append("from_email", "markazululilmi@gmail.com");
    payload.append("recipient", recipient);
    payload.append("subject", subject);
    payload.append("content", content);
    payload.append("attach1", "");

    const response = await fetch("https://api.mailketing.co.id/api/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: payload.toString(),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

export default sendEmail;
