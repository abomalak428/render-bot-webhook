const express = require('express');
const bodyParser = require('body-parser');
const { handleMessage } = require('./telegramBot');

const app = express();
app.use(bodyParser.json());

app.post('/', (req, res) => {
  console.log("✅ تم استقبال POST من تليجرام:", req.body); // 🔍 مهم لرصد الطلبات

  const message = req.body.message;
  const response = handleMessage(message);

  console.log("✅ رد البوت:", response); // 🔍 لتتبع الرد
  res.send({ reply: response });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 البوت شغّال على المنفذ ${PORT}`);
});
