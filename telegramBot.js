const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const yahooFinance = require('yahoo-finance2').default;

const app = express();
const port = process.env.PORT || 10000;
app.use(bodyParser.json());

// المستخدمين المصرح لهم
const allowedUsers = [
  "@Ibrahim_Asiri", // أبو ملاك
  "@a_aseeri"        // أخو أبو ملاك
];

// قائمة تحويل أسماء الشركات العربية إلى رموز السوق
const arabicToEnglishSymbols = {
  "الراجحي": "1120.SR",
  "أرامكو": "2222.SR",
  "اس تي سي": "7010.SR",
  "سابك": "2010.SR",
  "أكوا باور": "2082.SR",
  "المراعي": "2280.SR",
  "دار الأركان": "4300.SR",
  "أهلي": "1180.SR",
  "الإنماء": "1150.SR",
  "جبل عمر": "4250.SR",
  "مجموعة تداول": "1111.SR",
  "الدواء": "4163.SR"
};

// استخراج الرمز من النص
function extractSymbolFromText(text) {
  if (!text) return null;

  const normalized = text
    .normalize('NFKD')
    .replace(/[^\u0621-\u064Aa-zA-Z0-9.\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .toLowerCase();

  const cleaned = normalized
    .replace(/^(تحليل|حلل|سهم|شركة)\s*/g, '')
    .trim();

  if (arabicToEnglishSymbols[cleaned]) return arabicToEnglishSymbols[cleaned];

  for (const [arabicName, symbol] of Object.entries(arabicToEnglishSymbols)) {
    if (arabicName.includes(cleaned) || cleaned.includes(arabicName)) {
      return symbol;
    }
  }

  if (/^[a-z0-9.]{1,10}$/i.test(cleaned)) {
    return cleaned.toUpperCase();
  }

  return null;
}

// توليد رسالة التحليل
function generateStockAnalysis({ symbol, price, trend, entry, tradeType, targets, support, stop }) {
  return `📌 تحليل سهم: ${symbol}
▪️ السعر الحالي: ${price}
▪️ الاتجاه الفني: ${trend}
▪️ نقطة الدخول المتوقعة: ${entry}
▪️ نوع الصفقة: ${tradeType}
🎯 الأهداف: ${targets.join(' - ')}
🛡️ مناطق الدعم: ${support}
⛔ وقف الخسارة: ${stop}
🤖 بواسطة نظام أبو ملاك الذكي.`;
}

// إرسال الرد إلى تيليجرام
async function sendTelegramReply(chatId, text) {
  const token = "1321145851:AAGSkHWX2XdPcKXQiKiuTlqu38ybIDMwTuc";
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: text
    });
  } catch (error) {
    console.error("❌ خطأ أثناء إرسال الرسالة:", error.message);
  }
}

// نقطة الاستقبال الرئيسية
app.post('/', async (req, res) => {
  const message = req.body.message;
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const username = `@${message.from.username}`;
  const text = message.text;

  if (!allowedUsers.includes(username)) {
    await sendTelegramReply(chatId, `🚫 عذرًا ${username}، ليس لديك صلاحية لاستخدام هذا البوت.`);
    return res.sendStatus(200);
  }

  const symbol = extractSymbolFromText(text);
  if (!symbol) {
    await sendTelegramReply(chatId, `⚠️ لم أتمكن من فهم الرمز المطلوب. الرجاء كتابة مثل: تحليل سهم AAPL أو تحليل سهم الراجحي`);
    return res.sendStatus(200);
  }

  try {
    const quote = await yahooFinance.quote(symbol);
    const price = quote.regularMarketPrice;
    const trend = price > quote.fiftyDayAverage ? "صاعد" : "هابط";

    const entry = (price * 0.99).toFixed(2);
    const stop = (price * 0.95).toFixed(2);
    const targets = [
      (price * 1.02).toFixed(2),
      (price * 1.04).toFixed(2),
      (price * 1.06).toFixed(2)
    ];

    const reply = generateStockAnalysis({
      symbol,
      price,
      trend,
      entry,
      tradeType: trend === "صاعد" ? "شراء" : "بيع",
      targets,
      support: (price * 0.97).toFixed(2),
      stop
    });

    await sendTelegramReply(chatId, reply);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ تحليل السهم فشل:", err.message);
    await sendTelegramReply(chatId, `⚠️ تعذر جلب بيانات السهم (${symbol})، تأكد من الرمز.`);
    res.sendStatus(200);
  }
});

// تشغيل السيرفر
app.listen(port, () => {
  console.log(`🤖 Bot server running on port ${port}`);
});
