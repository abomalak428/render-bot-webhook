// Telegram Bot Access Control
const allowedUsers = [
  "Abumalak_bot",    // أبو ملاك
  "a_aseeri",         // أخو أبو ملاك
  "Ibrahim_Asiri"     // حساب أبو ملاك الشخصي
];

// Function to check if a user is authorized
function isAuthorized(username) {
  return allowedUsers.includes(username);
}

// Handle incoming message
function handleMessage(message) {
  const username = message.from.username;

  if (!isAuthorized(username)) {
    return { text: `🚫 عذرًا ${username}، ليس لديك صلاحية استخدام هذا البوت.` };
  }

  // هنا نضع الرد الحقيقي من البوت
  return { text: `مرحبًا ${username}! ✅ تم التحقق من صلاحيتك.` };
}

module.exports = handleMessage;
