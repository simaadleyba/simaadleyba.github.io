/**
 * Parser for Akbank Credit/Debit Card Emails
 * 
 * @param {string} emailBody - Plain text body of the email
 * @param {string} othersCategoryTrigger - Category name that should trigger "OTHERS"
 * @return {object|null} - {amount, category, cardDigits, originalCategory} or null if failed
 */
function parseAkbankEmail(emailBody, othersCategoryTrigger) {
  // Regex patterns tailored to the example provided:
  // "8402 ile biten Akbank Kart'ınla, 1.098,00 TL tutarında BANKA KARTI harcaması yapılmıştır."
  
  // 1. Extract Card Last 4 Digits
  const cardPattern = /(\d{4}) ile biten/;
  const cardMatch = emailBody.match(cardPattern);
  if (!cardMatch) return null;
  const cardDigits = cardMatch[1];
  
  // 2. Extract Amount
  // Matches "1.098,00 TL", "234,50 TL"
  const amountPattern = /([\d.,]+)\s*TL\s*tutarında/i;
  const amountMatch = emailBody.match(amountPattern);
  if (!amountMatch) return null;
  
  let amountStr = amountMatch[1];
  // Convert "1.098,00" -> 1098.00
  // Remove dots (thousands), replace comma with dot (decimal)
  amountStr = amountStr.replace(/\./g, '').replace(',', '.');
  const amount = parseFloat(amountStr);
  
  // 3. Extract Category
  // Pattern: "tutarında [CATEGORY] harcaması"
  // Needs to be flexible enough to capture multi-word categories
  const categoryPattern = /tutarında\s+(.+?)\s+harcaması/i;
  const categoryMatch = emailBody.match(categoryPattern);
  let originalCategory = "Unknown";
  let finalCategory = "Others";
  
  if (categoryMatch) {
    originalCategory = categoryMatch[1].trim();
    
    // Logic: If it matches the trigger (e.g., "BANKA KARTI"), map to "OTHERS"
    // Otherwise, use the category name itself (capitalized for consistency)
    if (othersCategoryTrigger && originalCategory.toUpperCase() === othersCategoryTrigger.toUpperCase()) {
      finalCategory = "Others"; // or "Banka Kartı" if you prefer keeping it explicit, but spec says "OTHERS"
    } else {
      // Capitalize first letter of each word
      finalCategory = toTitleCase(originalCategory);
    }
  }
  
  return {
    amount: amount,
    category: finalCategory,
    cardDigits: cardDigits,
    originalCategory: originalCategory
  };
}

// Helper for title casing
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

// Placeholder for future Card B
function parseCardBEmail(emailBody, othersCategoryTrigger) {
  // Implement logic here later
  return null;
}
