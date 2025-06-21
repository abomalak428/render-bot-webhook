// Telegram Bot Access Control

const allowedUsers = [
  "Abumalak_bot",  // أبو ملاك
  "a_aseeri"        // أخو أبو ملاك
];

// Function to check if a user is authorized
function isAuthorized(username) {
  return allowedUsers.includes(username);
}

// Handle incoming message
function handleMessage(message) {
  const username = message.from.username;

  if (!isAuthorized(username)) {
    return "🚫 غير مصرح لك باستخدام هذا البوت.";
  }

  // تابع المعالجة هنا مثل طلب تحليل أو فرصة
  return `✅ تم قبول طلبك يا @${username}`;
}

module.exports = {
  handleMessage
};
