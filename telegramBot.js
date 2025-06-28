// telegramBot.js
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config(); // لتحميل المتغيرات من .env

const app = express();
app.use(bodyParser.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

const arabicToEnglishSymbols = {
  "المصافي": "2030.SR",
  "أرامكو السعودية": "2222.SR",
  "بترو رابغ": "2380.SR",
  "الحفر العربية": "2381.SR",
  "أديس": "2382.SR",
  "البحري": "4030.SR",
  "الدريس": "4200.SR",
  "تكوين": "1201.SR",
  "مبكو": "1202.SR",
  "بي سي آي": "1210.SR",
  "معادن": "1211.SR",
  "أسلاك": "1301.SR",
  "اليمامة للحديد": "1304.SR",
  "أنابيب السعودية": "1320.SR",
  "أنابيب الشرق": "1321.SR",
  "أماك": "1322.SR",
  "يو سي آي سي": "1323.SR",
  "كيمانول": "2001.SR",
  "سابك": "2010.SR",
  "سابك للمغذيات الزراعية": "2020.SR",
  "التصنيع": "2060.SR",
  "جبسكو": "2090.SR",
  "زجاج": "2150.SR",
  "اللجين": "2170.SR",
  "فيبكو": "2180.SR",
  "أنابيب": "2200.SR",
  "نماء للكيماويات": "2210.SR",
  "معدنية": "2220.SR",
  "لوبريف": "2223.SR",
  "الزامل للصناعة": "2240.SR",
  "المجموعة السعودية": "2250.SR",
  "ينساب": "2290.SR",
  "صناعة الورق": "2300.SR",
  // ... أكمل البقية حسب قائمتك
  "الماجد للعود": "4165.SR"
};

function extractSymbol(text) {
  if (!text) return null;
  const cleaned = text.replace(/[\n\r]/g, '').trim();
  for (const [arabic, symbol] of Object.entries(arabicToEnglishSymbols)) {
    if (cleaned.includes(arabic)) {
      return { name: arabic, symbol };
    }
  }
  return null;
}

async function sendMessage(chatId, text) {
  try {
    await axios.post(TELEGRAM_API, {
      chat_id: chatId,
      text,
    });
  } catch (error) {
    console.error("📛 فشل إرسال الرسالة:", error.message);
  }
}

app.post('/', async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const match = extractSymbol(message.text);

  if (!match) {
    await sendMessage(chatId, `⚠️ لم أتمكن من فهم الرمز المطلوب. الرجاء كتابة مثل: تحليل سهم أرامكو أو سهم 2222`);
    return res.sendStatus(200);
  }

  const { name, symbol } = match;
  const reply = `📌 تحليل سهم: ${name}\n▪️ الرمز: ${symbol}\n▪️ الاتجاه الفني: يتم تحديده لاحقًا\n▪️ نوع الصفقة: شراء / بيع\n▪️ نقطة الدخول المتوقعة: تحت الدراسة\n🎯 الأهداف: ثلاث مستويات\n🛡️ مناطق الدعم: قيد التحديث\n⛔ وقف الخسارة: سيتم تحديده\n🤖 بواسطة نظام أبو ملاك الذكي.`;

  await sendMessage(chatId, reply);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🤖 Bot server running on port ${PORT}`));
