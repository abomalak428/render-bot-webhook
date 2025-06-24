// Telegram Bot Access Control + Yahoo Finance Integration + Arabic Company Name Recognition
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const yahooFinance = require('yahoo-finance2').default;

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

const allowedUsers = [
  "@Ibrahim_Asiri", // أبو ملاك
  "@a_aseeri"        // أخو أبو ملاك
];

function isAuthorized(user) {
  return allowedUsers.includes(user);
}

// أسماء عربية مع رموزها بالإنجليزية (قائمة جزئية كبداية)
const arabicToEnglishSymbols = {
  "الراجحي": "1120.SR",
  "أرامكو": "2222.SR",
  "اس تي سي": "7010.SR",
  "سابك": "2010.SR",
  "أكوا باور": "2082.SR",
  "المراعي": "2280.SR",
  "دار الأركان": "4300.SR",
  "الإنماء": "1150.SR",
  "جبل عمر": "4250.SR",
  "مجموعة تداول": "1111.SR"
};

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

async function sendTelegramReply(chatId, text) {
  const token = process.env.TELEGRAM_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await axios.post(url, { chat_id: chatId, text });
  } catch (error) {
    console.error("فشل إرسال الرد", error.response?.data || error.message);
  }
}

// تحسين التعرف على اسم السهم من النص (بإزالة كلمة سهم والمسافات)
function extractSymbolFromText(text) {
  const match = text.match(/(?:تحليل|حلل)\s+سهم\s+(.+)/i);
  if (!match) return null;
  const raw = match[1].trim();

  const cleaned = raw.replace(/\s/g, '');

  for (const [arabicName, symbol] of Object.entries(arabicToEnglishSymbols)) {
    if (cleaned.includes(arabicName.replace(/\s/g, ''))) {
      return symbol;
    }
  }

  return raw.toUpperCase(); // محاولة تحويل لرمز مباشر مثل AAPL أو SPY
}

app.post('/', async (req, res) => {
  const message = req.body.message;
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const username = `@${message.from.username}`;
  const text = message.text;

  if (!isAuthorized(username)) {
    return sendTelegramReply(chatId, `🚫 عذرًا ${username}، ليس لديك صلاحية لاستخدام هذا البوت.`);
  }

  const symbol = extractSymbolFromText(text);
  if (!symbol) {
    return sendTelegramReply(chatId, `⚠️ لم أتمكن من فهم الرمز المطلوب. الرجاء كتابة مثل: تحليل سهم AAPL أو تحليل سهم الراجحي`);
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

    const messageText = generateStockAnalysis({
      symbol,
      price,
      trend,
      entry,
      tradeType: trend === "صاعد" ? "شراء" : "بيع",
      targets,
      support: (price * 0.97).toFixed(2),
      stop
    });

    await sendTelegramReply(chatId, messageText);
  } catch (err) {
    console.error(err);
    await sendTelegramReply(chatId, `⚠️ تعذر جلب بيانات السهم تحليل سهم ${symbol}، تأكد من الرمز`);
  }

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`🤖 Bot server running on port ${port}`);
});
