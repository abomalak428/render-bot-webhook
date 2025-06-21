const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// ✅ بيانات البوت
const TELEGRAM_TOKEN = 'ضع التوكن الخاص بك هنا';

// ✅ المستخدمين المسموح لهم
const allowedUsers = [
  "@Abumalak_bot",  // أبو ملاك
  "@a_aseeri"       // أخو أبو ملاك
];

// ✅ التحقق من المستخدم
function isAuthorized(user) {
  return allowedUsers.includes(user);
}

// ✅ تنسيق رسالة التحليل
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

// ✅ معالجة الرسائل
function handleMessage(message) {
  const username = message.from.username;
  if (!isAuthorized("@" + username)) {
    return "🚫 غير مصرح لك باستخدام هذا البوت.";
  }

  // مثال على بيانات تحليل وهمية
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

  return analysis;
}

// ✅ إرسال الرد لتليجرام
function sendMessageToTelegram(chatId, text) {
  return axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text: text
  });
}

// ✅ نقطة استقبال الرسائل من تليجرام
app.post('/webhook', async (req, res) => {
  const message = req.body.message;
  if (!message || !message.from || !message.chat) {
    return res.sendStatus(400);
  }

  const reply = handleMessage(message);
  await sendMessageToTelegram(message.chat.id, reply);
  res.sendStatus(200);
});

// ✅ بدء التشغيل
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🤖 Bot is running on port ${PORT}`);
});
