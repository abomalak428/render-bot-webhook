function extractSymbolFromText(text) {
  const lowered = text.toLowerCase().trim();

  // إزالة كلمات مثل "تحليل سهم" وغيره
  let cleaned = lowered
    .replace(/تحليل سهم|حلل سهم|سهم|شركة/g, '')
    .trim();

  // لو كان من الرموز المعروفة بالعربي
  if (arabicToEnglishSymbols[cleaned]) {
    return arabicToEnglishSymbols[cleaned];
  }

  // تطابق جزئي مع الأسماء العربية
  for (const [arabicName, symbol] of Object.entries(arabicToEnglishSymbols)) {
    if (arabicName.includes(cleaned) || cleaned.includes(arabicName)) {
      return symbol;
    }
  }

  // التطابق بالرموز الإنجليزية أو أرقام فقط مثل 2380
  const alphanumRegex = /^[a-z0-9.]{2,10}$/i;
  if (alphanumRegex.test(cleaned)) {
    return cleaned.toUpperCase();
  }

  // لو ما تعرف على شيء
  return null;
}
