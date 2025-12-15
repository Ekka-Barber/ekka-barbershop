// Function to properly detect language
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'ar';

  // Check if text contains Arabic characters
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const hasArabic = arabicRegex.test(text);

  // If no Arabic characters at all, it's definitely English
  if (!hasArabic) {
    return 'en';
  }

  // If it has Arabic characters, check the proportion
  const englishText = text.replace(arabicRegex, '').trim();
  const arabicChars = text.match(arabicRegex) || [];
  const totalChars = text.replace(/\s/g, '').length;
  const arabicRatio = arabicChars.length / totalChars;

  // If Arabic characters are less than 10% of total, consider it English
  if (arabicRatio < 0.1) {
    return 'en';
  }

  // Check for English sentence starters that indicate primary English content
  const englishStarters = /^\s*(hi|hello|the|and|but|or|so|because|although|however|therefore|i|we|you|he|she|it|they|this|that|these|those|my|your|his|her|its|our|their|good|great|excellent|best|amazing|wonderful|fantastic|awesome|love|like|really|very|much|many|some|all|any|every|each|both|few|little|big|large|small|long|short|hot|cold|fast|slow|easy|hard|right|wrong|true|false|yes|no|service|professional|barber|haircut|beard|shop|time|always|never|first|second)/i;

  if (englishStarters.test(text.trim())) {
    return 'en';
  }

  // Default to Arabic for Saudi market
  return 'ar';
}

// Test the function
console.log('🧪 Testing improved language detection:');

const testCases = [
  "تجربة ممتازة وخدمة ممتازة 👍", // Arabic
  "Fantastic service as always. Treated like a VIP. Mahmoud was a true professional.", // English
  "Best barbershop in taif", // English
  "Best barbers in Saudi, immaculate beard trim every time 💈", // English
  "Salah the best", // English
  "Khaled Al sayed is very good and excellent and abdelkarim salah thank you so much for the great service", // English with some Arabic names
  "أول تجربة بالمكان والحلاقة كانت ممتازة جداً", // Arabic
  "شغل فنان وشكراً جزيلاً على كل المساعدة", // Arabic
];

testCases.forEach(text => {
  const detected = detectLanguage(text);
  console.log(`${detected.toUpperCase()}: "${text.substring(0, 50)}..."`);
});

console.log('\n✅ Improved language detection ready for database update!');
