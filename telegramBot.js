const allowedUsers = [
  "Abumalak_bot", // أبو ملاك
  "a_aseri",       // أخو أبو ملاك الشخصي
  "Ibrahim_Asiri"  // حساب أبو ملاك الشخصي
];

function isAuthorized(username) {
  return allowedUsers.includes(username);
}

function handleMessage(message) {
  const username = message.from.username;
  const text = message.text;

  if (!isAuthorized(username)) {
    return { text: `🚫 عذرًا ${username}، ليس لديك صلاحية استخدام هذا البوت.` };
  }

  // استخراج اسم السهم من الرسالة إذا كانت "حل سهم ..."
  if (text.toLowerCase().startsWith("حل سهم") || text.toLowerCase().startsWith("تحليل سهم")) {
    const parts = text.split(" ");
    const symbol = parts[2] || "غير معروف";
    return { text: `📈 تحليل السهم ${symbol}: جاري تطوير التحليل الحقيقي...` };
  }

  return { text: `مرحبًا ${username} ✅! تم التحقق من صلاحيتك.` };
}

module.exports = handleMessage;
