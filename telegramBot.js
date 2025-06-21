// Telegram Bot Access Control

const allowedUsers = [
  "@Abumalak_bot",  // أبو ملاك
  "@a_aseeri"       // أخو أبو ملاك
];

// Function to check if a user is authorized
function isAuthorized(user) {
  return allowedUsers.includes(user);
}

// Example usage:
function handleMessage(message) {
  const username = message.from.username;
  if (!isAuthorized("@" + username)) {
    return "🚫 غير مصرح لك باستخدام هذا البوت.";
  }

  // تابع المعالجة هنا
  return "✅ تم قبول طلبك يا " + username + "!";
}

// تصدير الوظيفة إن احتجت
module.exports = {
  handleMessage
};
