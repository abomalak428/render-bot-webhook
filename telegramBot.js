const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// دالة استخراج الرمز من النص
function extractSymbolFromText(text) {
  if (!text) return null;

  const stockMap = {
    "الراجحي": "1120",
    "الدواء": "4163",
    "مجموعة تداول": "1111",
    "أرامكو": "2222",
    "سابك": "2010",
    "المواساة": "4002",
    "كهرباء": "5110"
  };

  const normalized = text
    .normalize('NFKD')
    .replace(/[^ء-يa-zA-Z0-9\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .toLowerCase();

  for (const name in stockMap) {
    if (normalized.includes(name.toLowerCase())) {
      return stockMap[name];
    }
  }

  const match = normalized.match(/\b([a-zA-Z]{1,5}|\d{3,5})\b/);
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

  const reply = `📌 تحليل سهم: ${symbol}\n🤖 بواسطة نظام أبو ملاك الذكي.`;

  await sendMessage(chatId, reply);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Bot server running on port ${PORT}`);
});
