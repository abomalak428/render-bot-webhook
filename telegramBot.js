// Telegram Bot Access Control

const axios = require('axios');
const allowedUsers = [
  "@Ibrahim_Asiri94BOT", // البوت الرسمي لأبو ملاك
  "@a_aseeri"             // أخو أبو ملاك
];

// Function to check if a user is authorized
function isAuthorized(user) {
  return allowedUsers.includes(user);
}

// Function to generate detailed stock analysis message
function generateStockAnalysis({ symbol, price, trend, entry, tradeType, targets, support, stop }) {
  return `📌 تحليل سهم: ${symbol}
▪️ السعر الحالي: ${price}
▪️ الاتجاه الفني: ${trend}
▪️ نقطة الدخول المثالية: ${entry}
▪️ نوع الصفقة: ${tradeType}
▪️ الأهداف:
   • الهدف الأول: ${targets[0]}
   • الهدف الثاني: ${targets[1]}
   • الهدف الثالث: ${targets[2]}
▪️ مناطق الدعم: ${support.join(" - ")}
▪️ وقف الخسارة: ${stop}
🤖 بواسطة نظام أبو ملاك الذكي`;
}

// Handle incoming Telegram message and send reply
async function handleMessage(message) {
  const username = "@" + message.from.username;
  const chatId = message.chat.id;

  if (!isAuthorized(username)) {
    return await sendTelegramReply(chatId, `🚫 عذرًا ${username}، ليس لديك صلاحية لاستخدام هذا البوت.`);
  }

  // بيانات تحليل وهمية كمثال
  const analysis = generateStockAnalysis({
    symbol: "2380",
    price: "38.50",
    trend: "صاعد",
    entry: "37.60",
    tradeType: "مضاربة فنية",
    targets: ["39.10", "40.00", "41.50"],
    support: ["37.00", "36.30"],
    stop: "كسر 36.00 بإغلاق"
  });

  await sendTelegramReply(chatId, analysis);
}

// Function to send reply message via Telegram API
async function sendTelegramReply(chatId, text) {
  const token = process.env.TELEGRAM_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: text
    });
  } catch (error) {
    console.error("فشل الإرسال لتليجرام:", error.response?.data || error.message);
  }
}

module.exports = {
  handleMessage,
  generateStockAnalysis
};
