const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// دالة استخراج الرمز من النص
function extractSymbolFromText(text) {
  if (!text) return null;

  // تحويل النص إلى حروف صغيرة وتشكيل الشكل وحذف العلامات الزائدة
  const normalized = text
    .normalize('NFKD')
    .replace(/[^\u0621-\u064Aa-zA-Z0-9\s]/g, '') // حذف الرموز الخاصة
    .replace(/\s{2,}/g, ' ') // دمج المسافات المكررة
    .trim()
    .toLowerCase();

  // حذف كلمات زائدة
  let cleaned = normalized
    .replace(/سهم|شركة|ارجو|لو سمحت|تحليل|الرمز|من فضلك|الله يرضى عليك|عطني|ابغى|أريد|لو تكرمت|كم هدفه|هات لي|كم السعر|كم وقف الخسارة|ابي تحليل|وش رايك في|توقعك|ايش رايك/g, '')
    .trim();

  // استخراج الرمز
  const match = cleaned.match(/\b([a-zA-Z]{1,5}|\d{3,5})\b/);
  return match ? match[1].toUpperCase() : null;
}

// دالة إرسال رسالة إلى تليجرام
async function sendMessage(chatId, text) {
  const token = '1321145851:AAGSkHWX2XdPcKXQiKiuTlqu38ybIDMwTuc';
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: text,
    });
  } catch (error) {
    console.error('خطأ أثناء إرسال الرسالة:', error.message);
  }
}

// استقبال الطلبات من التليجرام
app.post('/', async (req, res) => {
  const message = req.body.message;

  if (!message || !message.text) {
    return res.sendStatus(400);
  }

  const chatId = message.chat.id;
  const text = message.text;

  const symbol = extractSymbolFromText(text);

  if (!symbol) {
    await sendMessage(chatId, `⚠️ لم أتمكن من فهم الرمز المطلوب. الرجاء كتابة مثل: تحليل سهم AAPL أو تحليل سهم الراجحي`);
    return res.sendStatus(200);
  }

  const reply = `📌 تحليل سهم: ${symbol}\n▪️ الاتجاه الفني: قد يتغير\n▪️ مناطق الدعم: يتم التحديث\n▪️ مناطق المقاومة: يتم التحديث\n🤖 بواسطة نظام أبو ملاك الذكي.`;

  await sendMessage(chatId, reply);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Bot server running on port ${PORT}`);
});
