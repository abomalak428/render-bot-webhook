const express = require("express");
const app = express();

app.use(express.json());

app.post("/", (req, res) => {
  console.log("🚀 Webhook received:", req.body);
  res.status(200).send("✅ Webhook received");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Server is running on port ${PORT}`);
});
