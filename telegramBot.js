const axios = require('axios');
const express = require('express');// Telegram Bot With Yahoo Finance Integration - أبو ملاك

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const yahooFinance = require('yahoo-finance2').default;

const app = express();
const port = process.env.PORT || 10000;
app.use(bodyParser.json());

// المستخدمين المسموح لهم باستخدام البوت
const allowedUsers = [
  "@Ibrahim_Asiri", // أبو ملاك
  "@a_aseeri"        // أخو أبو ملاك
];

// التحقق من صلاحية المستخدم
function isAuthorized(user) {
  return allowedUsers.includes(user);
}

// إرسال الرد عبر تيليجرام
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

// توليد نص التحليل الفني
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
🤖 بواسطة نظام أبو ملاك الذكي.`;
}

// المعالجة الرئيسية للرسائل الواردة
app.post('/', async (req, res) => {
  const message = req.body.message;
  if (!message || !message.from || !message.text) return res.sendStatus(400);

  const username = "@" + message.from.username;
  const chatId = message.chat.id;
  const text = message.text.trim();

  if (!isAuthorized(username)) {
    await sendTelegramReply(chatId, `🚫 عذرًا ${username}، ليس لديك صلاحية لاستخدام هذا البوت.`);
    return res.sendStatus(403);
  }

  // استخراج رمز السهم من الرسالة
  const match = text.match(/(?:تحليل|حلل)\s*سهم\s*([\w\d]+)/i);
  if (!match) {
    await sendTelegramReply(chatId, `❗️يرجى كتابة: تحليل سهم [الرمز] أو حلل سهم [الرمز]`);
    return res.sendStatus(200);
  }

  const symbol = match[1].toUpperCase();
  const yahooSymbol = symbol.match(/^\d{4}$/) ? `${symbol}.SR` : symbol;

  try {
    const result = await yahooFinance.quote(yahooSymbol);
    const price = result.regularMarketPrice;

    const response = generateStockAnalysis({
      symbol,
      price: price.toFixed(2),
      trend: "صاعد 🔼", // مؤقتًا
      entry: (price * 0.98).toFixed(2),
      tradeType: "مضاربة فنية",
      targets: [
        (price * 1.03).toFixed(2),
        (price * 1.05).toFixed(2),
        (price * 1.08).toFixed(2)
      ],
      support: [
        (price * 0.95).toFixed(2),
        (price * 0.92).toFixed(2)
      ],
      stop: (price * 0.90).toFixed(2)
    });

    await sendTelegramReply(chatId, response);
  } catch (err) {
    await sendTelegramReply(chatId, `⚠️ تعذر جلب بيانات السهم لتحليل سهم ${symbol}، تأكد من الرمز.`);
  }

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Bot is running on port ${port}`);
});

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
