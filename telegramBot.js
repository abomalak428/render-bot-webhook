function extractSymbolFromText(text) {
  if (!text) return null;

  // تنظيف عميق للنص من أي رموز غير مرئية
  const normalized = text
    .normalize('NFKD') // تحويل الأحرف الشاذة
    .replace(/[^\u0621-\u064Aa-z0-9. ]/gi, '') // حذف أي رموز خاصة
    .replace(/\s{2,}/g, ' ') // دمج المسافات المكررة
    .trim()
    .toLowerCase();

  // حذف كلمات زائدة
  let cleaned = normalized
    .replace(/تحليل سهم|حلل سهم|سهم|شركة/g, '')
    .trim();

  // تطابق مباشر
  if (arabicToEnglishSymbols[cleaned]) {
    return arabicToEnglishSymbols[cleaned];
  }

  // تطابق جزئي
  for (const [arabicName, symbol] of Object.entries(arabicToEnglishSymbols)) {
    if (arabicName.includes(cleaned) || cleaned.includes(arabicName)) {
      return symbol;
    }
  }

  // تطابق مع رموز إنجليزية أو أرقام
  const alphanumRegex = /^[a-z0-9.]{2,10}$/i;
  if (alphanumRegex.test(cleaned)) {
    return cleaned.toUpperCase();
  }

  return null;
}
