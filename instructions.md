# Personal Finance Tracker Implementation

## Project Overview
Build a personal finance visualization dashboard that:
- Automatically parses bank transaction emails from multiple cards
- Stores data securely in Google Sheets
- Displays interactive charts and filters on a static webpage
- Integrates with existing personal GitHub Pages site (simaadleyba.github.io)
- Works on both desktop and mobile devices
- Supports easy addition of new cards in the future

---

## Card Configurations

### Card A - Akbank
- **Email address:** `HIZMET@bilgi.akbank.com`
- **Sender name:** `AKBANK HABERCİ`
- **Subject pattern:** `Akbank Kart harcamanız`
- **Email content example:**
```
Değerli Akbanklı,
8402 ile biten Akbank Kart'ınla, 1.098,00 TL tutarında BANKA KARTI harcaması yapılmıştır.
Detaylı hesap hareketlerinize ulaşmak için Akbank Mobil'e giriş yapabilirsiniz.
Saygılarımızla, Akbank
```

- **Parsing rules:**
  - Extract card last 4 digits: `8402`
  - Extract amount: `1.098,00 TL` → convert to `1098.00`
  - Extract category: `BANKA KARTI`
  - **Category logic:** If category = `BANKA KARTI`, store as `OTHERS`. Otherwise, use the category name as-is and automatically add it to the available categories list.

- **Gmail label:** `FinanceTracker-CardA`

### Card B
- **Status:** To be added later
- **System requirement:** Must be easy to add new card by simply adding a new configuration object

---

## Phase 1: Email Parsing & Data Storage

### 1.1 Google Sheets Database

**Sheet Name:** `FinanceTracker`

**Columns:**
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Date | Date (YYYY-MM-DD) | Transaction date | 2026-01-15 |
| Amount | Number | Transaction amount | 1098.00 |
| Currency | Text | Currency code | TL |
| Category | Text | Transaction category | OTHERS, Food, Transport, etc. |
| Card | Text | Card identifier | Akbank-8402 |
| Description | Text | Original category from email | BANKA KARTI |
| EmailDate | Timestamp | Email received timestamp | 2026-01-15 10:30:00 |
| EmailID | Text | Gmail message ID (for deduplication) | 18d4f2a1b2c3d4e5 |

### 1.2 Google Apps Script - Email Parser

**Architecture:** Modular and extensible for multiple cards. Categories are automatically discovered from emails - no hardcoded category list needed.

**File Structure:**
```
Apps Script Project: FinanceEmailParser
├── Code.gs (main script with processing logic)
├── CardParsers.gs (card-specific parsing functions)
└── Config.gs (card configuration array)
```

**Config.gs - Card Configuration:**
```javascript
const CARD_CONFIGS = [
  {
    id: 'akbank-8402',
    name: 'Akbank-8402',
    emailFrom: 'HIZMET@bilgi.akbank.com',
    senderName: 'AKBANK HABERCİ',
    subjectPattern: 'Akbank Kart harcamanız',
    gmailLabel: 'FinanceTracker-CardA',
    parserFunction: 'parseAkbankEmail',
    othersCategoryTrigger: 'BANKA KARTI' // This specific category becomes "OTHERS"
  }
  // Card B config will be added here in the future
];
```

**CardParsers.gs - Parsing Functions:**
```javascript
function parseAkbankEmail(emailBody, othersCategoryTrigger) {
  // Regex patterns to extract data from Turkish email format
  // Pattern: "[DIGITS] ile biten Akbank Kart'ınla, [AMOUNT] tutarında [CATEGORY] harcaması"
  
  const cardPattern = /(\d{4}) ile biten/;
  const amountPattern = /([\d.,]+)\s*TL tutarında/;
  const categoryPattern = /tutarında ([^harcaması]+) harcaması/;
  
  // Extract card digits, amount, category
  // Convert Turkish number format: "1.098,00" → 1098.00 (remove dots, replace comma with dot)
  // Apply category logic: if extracted category matches othersCategoryTrigger, return "OTHERS"
  // Otherwise return category as-is (will be automatically added to category list)
  
  // Return object: {amount: number, category: string, cardDigits: string}
}

// Future parser for Card B will be added here
// function parseCardBEmail(emailBody, othersCategoryTrigger) { ... }
```

**Code.gs - Main Processing Logic:**
```javascript
function processEmails() {
  const sheet = SpreadsheetApp.openById('[SHEET_ID]').getActiveSheet();
  
  CARD_CONFIGS.forEach(config => {
    const label = GmailApp.getUserLabelByName(config.gmailLabel);
    if (!label) {
      Logger.log(`Label ${config.gmailLabel} not found, skipping`);
      return;
    }
    
    const threads = label.getThreads();
    
    threads.forEach(thread => {
      const messages = thread.getMessages();
      messages.forEach(message => {
        const emailId = message.getId();
        
        // Skip if already processed (check EmailID column)
        if (isProcessed(sheet, emailId)) return;
        
        // Parse email using card-specific parser
        const parser = this[config.parserFunction]; // Dynamic function call
        const data = parser(message.getPlainBody(), config.othersCategoryTrigger);
        
        if (!data) {
          Logger.log(`Failed to parse email ${emailId}`);
          return;
        }
        
        // Append row to sheet
        sheet.appendRow([
          message.getDate(),      // Date
          data.amount,            // Amount
          'TL',                   // Currency
          data.category,          // Category (already processed by parser)
          config.name,            // Card
          data.originalCategory,  // Description (original category text)
          message.getDate(),      // EmailDate
          emailId                 // EmailID
        ]);
        
        // Mark as processed
        const processedLabel = GmailApp.getUserLabelByName('FinanceTracker-Processed');
        if (processedLabel) {
          message.getThread().addLabel(processedLabel);
        }
      });
    });
  });
}

function isProcessed(sheet, emailId) {
  const emailIdColumn = 8; // Column H (EmailID)
  const data = sheet.getRange(2, emailIdColumn, sheet.getLastRow() - 1, 1).getValues();
  return data.some(row => row[0] === emailId);
}

// Set up time-based trigger to run hourly
function createTrigger() {
  ScriptApp.newTrigger('processEmails')
    .timeBased()
    .everyHours(1)
    .create();
}
```

**Setup Steps:**
1. Create new Apps Script project
2. Create three files: Code.gs, CardParsers.gs, Config.gs
3. Replace `[SHEET_ID]` with actual Google Sheet ID
4. Create Gmail labels: `FinanceTracker-CardA`, `FinanceTracker-Processed`
5. Create Gmail filter for Card A emails (from: HIZMET@bilgi.akbank.com, subject contains: "Akbank Kart harcamanız") → apply label `FinanceTracker-CardA`
6. Run `createTrigger()` function once to enable automatic hourly processing
7. Authorize the script to access Gmail and Sheets

---

## Phase 2: Web Dashboard

### 2.1 Visual Design

**Design Requirements:**
- **CRITICAL:** Match existing personal site style from `simaadleyba.github.io`
  - Extract and reuse: font-family, color scheme, spacing, component styling
  - Match navigation/header design
  - Use same button/link hover effects
  - Maintain consistent visual language

**Desktop Layout (1200px+):**
```
┌─────────────────────────────────────────────────────────────┐
│  [Header - matches personal site navigation]                │
├─────────────────────────────────────────────────────────────┤
│  Finance Tracker                                             │
│                                                              │
│  Filters:                                                    │
│  [Date Range: Start __/__/__ | End __/__/__]                │
│  [Cards: ☑ All  ☐ Akbank-8402  ☐ Card B]                   │
│  [Categories: ☑ All  ☐ OTHERS  ☐ Food  ☐ Transport ...]    │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────┐│
│  │ Total Spent  │ │ Avg/Trans    │ │ Transactions │ │ Top  ││
│  │              │ │              │ │              │ │ Cat  ││
│  │  12.345,00₺  │ │    456,00₺   │ │      27      │ │ Food ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────┘│
│                                                              │
│  ┌─────────────────────────┐  ┌──────────────────────────┐ │
│  │                         │  │                          │ │
│  │   Pie Chart             │  │   Line Chart             │ │
│  │   (Category Breakdown)  │  │   (Spending Over Time)   │ │
│  │                         │  │                          │ │
│  │                         │  │                          │ │
│  └─────────────────────────┘  └──────────────────────────┘ │
│                                                              │
│  [Search: ________________]                                  │
│                                                              │
│  ┌────────────┬──────────┬──────────┬──────────┬─────────┐ │
│  │ Date ▼     │ Amount ▼ │ Category │ Card     │ Details │ │
│  ├────────────┼──────────┼──────────┼──────────┼─────────┤ │
│  │ 2026-01-15 │ 1.098,00₺│ OTHERS   │ Akbank...│ BANKA...│ │
│  │ 2026-01-14 │   234,50₺│ Food     │ Akbank...│ Market  │ │
│  │ ...        │ ...      │ ...      │ ...      │ ...     │ │
│  └────────────┴──────────┴──────────┴──────────┴─────────┘ │
│                                                              │
│  [< Previous] Page 1 of 3 [Next >]                          │
└─────────────────────────────────────────────────────────────┘
```

**Mobile Layout (<768px):**
```
┌────────────────────┐
│ [☰ Menu]           │
├────────────────────┤
│ Finance Tracker    │
│                    │
│ [▼ Filters]        │  ← Collapsible accordion
│                    │
│ ┌────────────────┐ │
│ │ Total Spent    │ │
│ │   12.345,00₺   │ │
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │ Avg/Trans      │ │
│ │      456,00₺   │ │
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │ Transactions   │ │
│ │       27       │ │
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │ Top Category   │ │
│ │      Food      │ │
│ └────────────────┘ │
│                    │
│ ┌────────────────┐ │
│ │                │ │
│ │   Pie Chart    │ │
│ │   (full width) │ │
│ │                │ │
│ └────────────────┘ │
│                    │
│ ┌────────────────┐ │
│ │                │ │
│ │   Line Chart   │ │
│ │   (scrollable) │ │
│ │                │ │
│ └────────────────┘ │
│                    │
│ [Search: ________] │
│                    │
│ ┌────────────────┐ │
│ │ 15 Oca 2026    │ │
│ │ 1.098,00₺      │ │
│ │ OTHERS         │ │
│ │ Akbank-8402    │ │
│ │ BANKA KARTI    │ │
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │ 14 Oca 2026    │ │
│ │ ...            │ │
│ └────────────────┘ │
│                    │
│ [Load More]        │
└────────────────────┘
```

**Features:**
- **Date range picker:** Default to last 30 days
- **Card filter:** Multi-select checkboxes, all selected by default
- **Category filter:** Multi-select checkboxes, dynamically populated from Sheet data, all selected by default
- **Summary cards:** Auto-update on filter change
- **Pie chart:** Category breakdown with percentages
- **Line chart:** Daily/weekly spending trends (group by day or week based on date range)
- **Data table:** 
  - Sortable columns (click header to toggle sort)
  - Search/filter by any field
  - Pagination (20 rows per page on desktop, infinite scroll on mobile)
- **Turkish formatting:**
  - Numbers: `1.098,00₺` (dot as thousands separator, comma as decimal)
  - Dates: `15 Ocak 2026` or `15.01.2026`
- **Responsive breakpoint:** 768px
- **Loading state:** Spinner while fetching data
- **Empty state:** "Bu filtrelere uygun işlem bulunamadı" (No transactions found for these filters)

### 2.2 Technical Stack

**Libraries:**
- **Chart.js 4.x** - for pie and line charts
- **Vanilla JavaScript (ES6+)** - no framework needed unless personal site uses one
- **Google Sheets API v4** - client-side, read-only access

**File Structure:**
```
/finance/
├── index.html          (main page structure)
├── styles.css          (styling - can be merged into site CSS)
├── script.js           (data fetching, filtering, chart rendering)
├── config.js           (API key and Sheet ID - gitignored)
└── config.example.js   (template without real credentials)
```

**config.example.js:**
```javascript
const CONFIG = {
  sheetsApiKey: 'YOUR_GOOGLE_SHEETS_API_KEY_HERE',
  spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE',
  sheetName: 'FinanceTracker'
};
```

### 2.3 Google Sheets API Setup

**Steps:**
1. Go to Google Cloud Console (console.cloud.google.com)
2. Create new project: "FinanceTracker"
3. Enable "Google Sheets API"
4. Go to Credentials → Create Credentials → API Key
5. Restrict the API key:
   - **API restrictions:** Google Sheets API only
   - **Website restrictions:** `https://simaadleyba.github.io/*`
6. Make Google Sheet publicly readable:
   - Open Sheet → Share → Change to "Anyone with the link" → Viewer access

**Data Flow:**
```
Google Sheets (public read-only)
    ↓
Sheets API (with restricted key)
    ↓
script.js fetches and parses data
    ↓
Filter data based on user selections
    ↓
Render charts and table
```

**script.js Structure:**
```javascript
// Main functions:
// - fetchTransactions(): Get data from Google Sheets API
// - parseSheetData(rawData): Convert sheet rows to objects
// - filterTransactions(data, filters): Apply date/card/category filters
// - calculateSummary(data): Compute total, average, count, top category
// - renderPieChart(data): Category breakdown chart
// - renderLineChart(data): Spending over time chart
// - renderTable(data): Sortable, searchable data table
// - setupFilters(): Event listeners for all filter controls
// - updateDashboard(): Orchestrate all updates when filters change

// Turkish number formatting helper:
// formatTurkishNumber(1098.00) → "1.098,00₺"

// Date formatting helper:
// formatTurkishDate("2026-01-15") → "15 Ocak 2026"
```

---

## Phase 3: Deployment & Security

### 3.1 GitHub Repository Structure
```
simaadleyba.github.io/
├── finance/
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   ├── .gitignore             (contains: config.js)
│   └── config.example.js      (template for other users)
├── [other site files]
└── README.md
```

**finance/.gitignore:**
```
config.js
```

**Security Measures:**
- ✅ `config.js` never committed (in .gitignore)
- ✅ API key restricted to your domain only
- ✅ Sheet is read-only (no edit permissions)
- ✅ No authentication tokens in frontend code
- ⚠️ Sheet data visible to anyone with Sheet ID (acceptable per user requirement)

**Setup Steps:**
1. Copy `config.example.js` to `config.js` (locally only)
2. Add your API key and Sheet ID to `config.js`
3. Ensure `config.js` is in `.gitignore`
4. Add link to finance page in main site navigation
5. Commit and push (excluding config.js)
6. Deploy to GitHub Pages

### 3.2 Testing Checklist

**Functionality:**
- [ ] Apps Script successfully parses Akbank emails
- [ ] Data appears correctly in Google Sheet
- [ ] Webpage loads without errors
- [ ] Data fetches from Sheet via API
- [ ] All filters work correctly
- [ ] Summary cards calculate accurately
- [ ] Pie chart displays category breakdown
- [ ] Line chart shows spending trends
- [ ] Table sorting works (all columns)
- [ ] Table search filters results
- [ ] Pagination works on desktop
- [ ] Turkish number formatting correct (1.098,00₺)
- [ ] Turkish date formatting correct (15 Ocak 2026)
- [ ] "BANKA KARTI" appears as "OTHERS" category

**Responsive Design:**
- [ ] Desktop: 1920px, 1440px, 1280px
- [ ] Tablet: 768px
- [ ] Mobile: 414px, 375px
- [ ] Charts resize properly
- [ ] Filters collapse on mobile
- [ ] Table switches to card view on mobile
- [ ] Touch interactions work on mobile

**Browser Compatibility:**
- [ ] Chrome (desktop + mobile)
- [ ] Firefox
- [ ] Safari (desktop + iOS)
- [ ] Edge

**Security:**
- [ ] API key not visible in browser DevTools Network tab
- [ ] `config.js` not in GitHub repository
- [ ] Sheet accessible only via API or public link
- [ ] No console errors related to CORS or authentication

---

## Phase 4: Adding Card B (Future Extension)

**To add Card B, only these steps needed:**

1. **Update Config.gs:**
```javascript
CARD_CONFIGS.push({
  id: 'card-b-xxxx',
  name: 'CardB-XXXX',
  emailFrom: '[CARD_B_EMAIL_ADDRESS]',
  senderName: '[CARD_B_SENDER_NAME]',
  subjectPattern: '[CARD_B_SUBJECT_PATTERN]',
  gmailLabel: 'FinanceTracker-CardB',
  parserFunction: 'parseCardBEmail',
  othersCategoryTrigger: '[CARD_B_OTHERS_TRIGGER]' // or null if not needed
});
```

2. **Add parser to CardParsers.gs:**
```javascript
function parseCardBEmail(emailBody, othersCategoryTrigger) {
  // Parse Card B's specific email format
  // Extract: card digits, amount, category
  // Apply category logic
  // Return: {amount, category, cardDigits, originalCategory}
}
```

3. **Create Gmail infrastructure:**
   - Create label: `FinanceTracker-CardB`
   - Create Gmail filter for Card B emails → apply label

4. **Test:** Forward/send Card B email, verify it appears in Sheet

**No changes needed to:**
- Main processing logic (Code.gs)
- Web dashboard (automatically picks up new card from Sheet data)
- Charts (dynamically populate card and category filters)

---

## User-Provided Information Needed

**For Implementation:**
- [ ] Google Sheet ID (from Sheet URL)
- [ ] Google Sheets API Key (after Cloud Console setup)
- [ ] Personal site CSS file URL or styles (to extract fonts/colors)

**For Setup:**
- [ ] Confirm Gmail filters created for Card A
- [ ] Confirm Gmail labels created: `FinanceTracker-CardA`, `FinanceTracker-Processed`
- [ ] Confirm Sheet is publicly readable (Share → Anyone with link → Viewer)

---

## Deliverables

The implementation should provide:

1. **Apps Script files** (ready to copy-paste):
   - Code.gs
   - CardParsers.gs
   - Config.gs

2. **Frontend files** (ready to deploy):
   - index.html
   - styles.css (matching personal site design)
   - script.js
   - config.example.js

3. **Documentation:**
   - setup-instructions.md (step-by-step setup guide)
   - README.md (project overview)

4. **Features implemented:**
   - Automatic email parsing with hourly trigger
   - Dynamic category discovery (no hardcoded category list)
   - Responsive design (desktop + mobile)
   - Turkish number and date formatting
   - Interactive filtering and charts
   - Extensible architecture for adding new cards

---

## Technical Notes

- **Turkish number format:** Use dot (.) as thousands separator, comma (,) as decimal separator
- **Currency:** Always TL (Turkish Lira) with ₺ symbol
- **Date format:** `YYYY-MM-DD` in Sheet, display as `DD.MM.YYYY` or `DD Month YYYY` (Turkish month names)
- **Category handling:** Dynamic - categories automatically added from email data, no predefined list
- **Deduplication:** Use Gmail message ID to prevent duplicate entries
- **Error handling:** Log failures, don't stop processing other emails
- **Performance:** Pagination for large datasets, lazy load charts
- **Accessibility:** Keyboard navigation, ARIA labels, color contrast WCAG AA compliant

---

## End of Specification