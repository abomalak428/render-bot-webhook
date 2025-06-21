const express = require('express');
const bodyParser = require('body-parser');
const { handleMessage } = require('./telegramBot');

const app = express();
app.use(bodyParser.json());

app.post('/', (req, res) => {
  const message = req.body.message;
  const response = handleMessage(message);
  console.log("✅ رسالة جديدة:", response);
  res.send({ reply: response });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 البوت شغال على المنفذ ${PORT}`);
});
