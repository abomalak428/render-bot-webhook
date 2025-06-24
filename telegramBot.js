const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const yfinance = require('yahoo-finance2').default;

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

const allowedUsers = [
  "@Ibrahim_Asiri", // أبو ملاك
  "@a_aseeri"        // أخو أبو ملاك
];

// إرسال الرد لتليجرام
async function sendTelegramReply(chatId, text) {
  const token = process.env.TELEGRAM_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await axios.post(url, { chat_id: chatId, text });
  } catch (error) {
    console.error("فشل إرسال الرد:", error.response?.data || error.message);
  }
}

// تحليل سهم بناءً على الرمز
async function analyzeStock(symbol) {
  try {
    const quote = await yfinance.quote(symbol);
    const price = quote.regularMarketPrice;
    const trend = quote.marketState === "REGULAR" ? "نشط" : "غير نشط";

    const entry = (price * 0.98).toFixed(2); // دخول تقريبي
    const targets = [
      (price * 1.02).toFixed(2),
      (price * 1.05).toFixed(2),
      (price * 1.08).toFixed(2)
    ];
    const stop = (price * 0.95).toFixed(2);

    return `📌 تحليل سهم: ${symbol.toUpperCase()}
▪️ السعر الحالي: ${price}
▪️ الاتجاه الفني: ${trend}
▪️ نقطة الدخول المثالية: ${entry}
▪️ نوع الصفقة: مضاربة فنية
▪️ الأهداف:
   • الهدف الأول: ${targets[0]}
   • الهدف الثاني: ${targets[1]}
   • الهدف الثالث: ${targets[2]}
▪️ مناطق الدعم: تحت المراقبة الفنية
▪️ وقف الخسارة: ${stop}
🤖 بواسطة نظام أبو ملاك الذكي`;
  } catch (err) {
    return `⚠️ تعذر جلب بيانات السهم ${symbol.toUpperCase()}، تأكد من الرمز`;
  }
}

// عند وصول رسالة لتليجرام
app.post('/', async (req, res) => {
  const message = req.body.message;
  if (!message || !message.from || !message.text) return res.sendStatus(400);

  const username = "@" + message.from.username;
  const chatId = message.chat.id;
  const symbol = message.text.trim().toUpperCase();

  if (!allowedUsers.includes(username)) {
    await sendTelegramReply(chatId, `🚫 عذرًا ${username}، ليس لديك صلاحية لاستخدام هذا البوت.`);
    return res.sendStatus(403);
  }

  const analysis = await analyzeStock(symbol);
  await sendTelegramReply(chatId, analysis);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Bot is running on port ${port}`);
});
