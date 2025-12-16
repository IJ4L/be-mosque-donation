const sendTelegram = async (chatId, message) => {
  try {
    const BOT_TOKEN = "8511026121:AAGBmtMYXFQvuNga3Cbfx0Xz8biWbcwScN8";

    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    };

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return response.ok;
  } catch (error) {
    return false;
  }
};

export default sendTelegram;
