const CONFIG = {
  // Replace with your actual Google Sheet ID
  spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE', 
  sheetName: 'FinanceTracker',
  processedLabel: 'FinanceTracker-Processed'
};

const CARD_CONFIGS = [
  {
    id: 'akbank-8402',
    name: 'Akbank-8402',
    emailFrom: 'HIZMET@bilgi.akbank.com', // Sender email
    senderName: 'AKBANK HABERCİ',       // Optional check
    subjectPattern: 'Akbank Kart harcamanız',
    gmailLabel: 'FinanceTracker-CardA',
    parserFunction: 'parseAkbankEmail',
    othersCategoryTrigger: 'BANKA KARTI' // This specific category becomes "OTHERS"
  }
  // Add future cards here
];
