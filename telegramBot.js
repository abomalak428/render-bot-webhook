const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

function extractSymbolFromText(text) {
  if (!text) return null;

  // نحول النص إلى حروف صغيرة ونشيل التشكيل والمسافات الزائدة
  const normalized = text
    .normalize('NFKD')
    .replace(/[^\u0621-\u064Aa-zA-Z0-9\s]/g, '') // نحذف الرموز الخاصة
    .replace(/\s{2,}/g, ' ') // نحذف المسافات المكررة
    .trim()
    .toLowerCase();

  // نحاول استخراج الرمز أو اسم السهم
  const match = normalized.match(/تحليل سهم (\S+)/);
  if (match) {
    return match[1].toUpperCase();
  }

  // إذا كتب المستخدم الرمز مباشرة بدون "تحليل سهم"
  const words = normalized.split(' ');
  if (words.length === 1) return words[0].toUpperCase();

  return null;
}

app.post('/', async (req, res) => {
  const body = req.body;

  if (!body.message || !body.message.text) {
    return res.sendStatus(200);
  }

  const text = body.message.text;
  const chatId = body.message.chat.id;
  const symbol = extractSymbolFromText(text);

  if (!symbol) {
    await sendMessage(chatId, '⚠️ لم أتمكن من فهم الرمز المطلوب. الرجاء كتابة مثل: تحليل سهم AAPL أو تحليل سهم الراجحي');
    return res.sendStatus(200);
  }

  const reply = `
📌 تحليل سهم: ${symbol}
▪️ السعر الحالي: قريباً
▪️ الاتجاه الفني: قيد التحليل
▪️ مناطق الدعم: يتم التحديث
▪️ مناطق المقاومة: يتم التحديث
🤖 بواسطة نظام أبو ملاك الذكي.
  `.trim();

  await sendMessage(chatId, reply);
  res.sendStatus(200);
});

async function sendMessage(chatId, text) {
  const token = 'توكن_البوت_هنا';
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

app.listen(10000, () => {
  console.log('🤖 Bot server running on port 10000');
});
