const sendTelegram = async (chatId, content) => {
  try {
    const BOT_TOKEN = "ISI_BOT_TOKEN_KAMU";
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const payload = {
      chat_id: chatId,
      text: content,
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

