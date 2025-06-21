// Telegram Bot Access Control
const allowedUsers = [
  "Abumalak_bot",   // بوت أبو ملاك
  "a_aseri",         // أخو أبو ملاك
  "Ibrahim_Asiri",   // حساب أبو ملاك الشخصي
];

// Function to check if a user is authorized
function isAuthorized(username) {
  return allowedUsers.includes(username);
}

// تحليل تلقائي حسب الرسالة
function extractStockSymbol(text) {
  const match = text.match(/(?:تحليل|حل)?\s*سهم\s*([A-Za-z0-9]+)/i) || text.match(/^([A-Za-z0-9]{3,5})$/);
  return match ? match[1].toUpperCase() : null;
}

// Handle incoming message
function handleMessage(message) {
  const username = message.from.username;
  const text = message.text?.trim();

  if (!isAuthorized(username)) {
    return {
      text: `🚫 عذرًا ${username}، ليس لديك صلاحية استخدام هذا البوت.`,
    };
  }

  const symbol = extractStockSymbol(text);
  if (symbol) {
    return {
      text: `📊 تم استلام طلب تحليل السهم: ${symbol}.\nجاري جلب البيانات...`,
    };
  }

  return {
    text: `مرحبًا ${username}! ✅ تم التحقق من صلاحيتك.\nاكتب لي "تحليل سهم AAPL" أو رقم السهم مثل 2380.`,
  };
}

module.exports = handleMessage;
