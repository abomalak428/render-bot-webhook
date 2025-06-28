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
  "أرامكو السعودية": "2222.SR",
  "فيبكو": "2180.SR",
  "الماجد للعود": "4165.SR",
  "أسلاك": "1301.SR",
  "أماك": "1322.SR",
  "ينساب": "2290.SR",
  "المصافي": "2030.SR",
  "سابك": "2010.SR",
  "نماء للكيماويات": "2210.SR",
  "زجاج": "2150.SR"
  // أضف ما تشاء هنا
};

// ✅ تحديث الدالة لتدعم الاسم أو الرقم
function extractSymbol(text) {
  if (!text) return null;
  const cleaned = text.replace(/[\n\r]/g, '').trim();

  // تطابق بالاسم
  for (const [arabic, symbol] of Object.entries(arabicToEnglishSymbols)) {
    if (cleaned.includes(arabic)) {
      return { name: arabic, symbol };
    }
  }

  // تطابق برمز رقمي مثل 2222
  const numericMatch = cleaned.match(/\b(\d{4})\b/);
  if (numericMatch) {
    const code = numericMatch[1];
    const foundEntry = Object.entries(arabicToEnglishSymbols).find(([name, sym]) => sym.startsWith(code));
    if (foundEntry) {
      const [name, symbol] = foundEntry;
      return { name, symbol };
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
    await sendMessage(chatId, `⚠️ لم أتمكن من فهم الرمز المطلوب. الرجاء كتابة مثل: تحليل سهم أرامكو أو 2222`);
    return res.sendStatus(200);
  }

  const { name, symbol } = match;

  const reply = `📌 تحليل سهم: ${name}
▪️ الرمز: ${symbol}
▪️ الاتجاه الفني: سيتم تحديده لاحقًا
▪️ نوع الصفقة: شراء / بيع
▪️ نقطة الدخول المتوقعة: تحت الدراسة
🎯 الأهداف: ثلاث مستويات
🛡️ مناطق الدعم: قيد التحديث
⛔ وقف الخسارة: سيتم تحديده
🤖 بواسطة نظام أبو ملاك الذكي.`;

  await sendMessage(chatId, reply);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🤖 Bot server running on port ${PORT}`));
