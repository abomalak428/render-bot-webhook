// Telegram Bot Access Control

const allowedUsers = [
  "Abumalak_bot",     // اسم البوت
  "a_aseeri",          // مستخدم قديم
  "Ibrahim_Asiri"      // المستخدم الجديد
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

  // تكتب هنا الرد المخصص حسب طلب المستخدم أو تنبيه
  return `✅ تم قبول طلبك يا @${username}`;
}

module.exports = {
  handleMessage
};
