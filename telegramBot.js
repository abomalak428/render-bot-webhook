// telegramBot.js

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

function extractSymbolFromText(text) {
  if (!text) return null;

  const normalized = text
    .normalize('NFKD')
    .replace(/[^\u0621-\u064Aa-zA-Z0-9\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .toLowerCase();

  let cleaned = normalized
    .replace(/تحليل سهم|سهم|تحليل|رجاءً|لو سمحت|الرجاء|ممكن|من فضلك/g, '')
    .trim();

  return cleaned;
}

app.post('/', async (req, res) => {
  const body = req.body;

  if (!body.message || !body.message.text) {
    return res.sendStatus(200);
  }

  const chatId = body.message.chat.id;
  const text = body.message.text;
  const symbol = extractSymbolFromText(text);

  if (!symbol) {
    const reply = '⚠️ لم أتمكن من فهم الرمز المطلوب. الرجاء كتابة مثل: تحليل سهم AAPL أو تحليل سهم الراجحي';
    await sendMessage(chatId, reply);
    return res.sendStatus(200);
  }

  try {
    const response = await axios.get(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,price`);
    const data = response.data;

    if (!data.quoteSummary || !data.quoteSummary.result || data.quoteSummary.result.length === 0) {
      throw new Error('No data found for symbol');
    }

    const quote = data.quoteSummary.result[0].price;
    const summary = data.quoteSummary.result[0].summaryDetail;
    const price = quote.regularMarketPrice.raw;
    const high = summary.dayHigh.raw;
    const low = summary.dayLow.raw;
    const fiftyDayAverage = summary.fiftyDayAverage.raw;
    const twoHundredDayAverage = summary.twoHundredDayAverage.raw;

    let trend = 'محايد';
    if (price > fiftyDayAverage && price > twoHundredDayAverage) {
      trend = 'صاعد قوي';
    } else if (price > fiftyDayAverage) {
      trend = 'صاعد متوسط';
    } else if (price < fiftyDayAverage && price < twoHundredDayAverage) {
      trend = 'هابط قوي';
    } else if (price < fiftyDayAverage) {
      trend = 'هابط متوسط';
    }

    let tradeType = 'متابعة فقط';
    if (trend.includes('صاعد')) {
      tradeType = 'شراء';
    } else if (trend.includes('هابط')) {
      tradeType = 'بيع';
    }

    const entry = (price * 0.985).toFixed(2);
    const stop = (price * 0.96).toFixed(2);

    const reply = `📌 تحليل سهم: ${symbol.toUpperCase()}\n▪️ السعر الحالي: ${price}\n▪️ الاتجاه الفني: ${trend}\n▪️ نوع الصفقة: ${tradeType}\n▪️ نقطة الدخول المقترحة: ${entry}\n▪️ وقف الخسارة: ${stop}\n🤖 بواسطة نظام أبو ملاك الذكي.`;

    await sendMessage(chatId, reply);
    res.sendStatus(200);

  } catch (error) {
    console.error('خطأ أثناء جلب البيانات:', error.message);
    await sendMessage(chatId, `⚠️ حدث خطأ أثناء تحليل السهم: ${symbol}`);
    res.sendStatus(200);
  }
});

async function sendMessage(chatId, text) {
  const token = 'ضع_توكن_البوت_هنا';
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: text
    });
  } catch (error) {
    console.error('خطأ أثناء إرسال الرسالة:', error.message);
  }
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Bot server running on port ${PORT}`);
});
