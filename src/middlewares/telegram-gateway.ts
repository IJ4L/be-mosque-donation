const sendTelegram = async (recipient: string, content: string) => {
  try {
    const BOT_TOKEN = "8511026121:AAGBmtMYXFQvuNga3Cbfx0Xz8biWbcwScN8";
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const message = `${content}`;

    const payload = {
      chat_id: recipient,
      text: message,
      parse_mode: "HTML",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

export default sendTelegram;
