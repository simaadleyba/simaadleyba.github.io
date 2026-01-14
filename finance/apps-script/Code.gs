// Run this ONCE to process past emails
function processBackfill() {
  const sheetId = CONFIG.id || 'YOUR_SPREADSHEET_ID_HERE'; // Ensure ID is available
  // Fallback if CONFIG.spreadsheetId is not set directly (logic from previous Code.gs might rely on global CONFIG)
  // We'll update Config.gs to be sure, or just rely on the user having set it.
  
  // Note: We need the spreadsheet ID here. 
  // If you are using the CSVUrl approach for the frontend, you still need the ID for the backend script.
  
  const sheet = SpreadsheetApp.openById(CONFIG.spreadsheetId).getSheetByName(CONFIG.sheetName);
  
  CARD_CONFIGS.forEach(config => {
    // Search for threads matching the subject/sender directly, ignoring labels
    // This finds ALL historical emails
    const query = `from:${config.emailFrom} subject:"${config.subjectPattern}"`;
    const threads = GmailApp.search(query, 0, 50); // Process last 50 batches. Increase if needed.
    
    Logger.log(`Found ${threads.length} threads for ${config.name}`);
    
    threads.forEach(thread => {
      const messages = thread.getMessages();
      messages.forEach(message => {
        const emailId = message.getId();
        
        if (isProcessed(sheet, emailId)) {
          Logger.log(`Skipping processed: ${emailId}`);
          return;
        }
        
        // Use the same parsing logic
        const parserName = config.parserFunction;
        let data = null;
        if (typeof this[parserName] === 'function') {
           data = this[parserName](message.getPlainBody(), config.othersCategoryTrigger);
        }
        
        if (data) {
          sheet.appendRow([
            message.getDate(),
            data.amount,
            'TL',
            data.category,
            config.name,
            data.originalCategory,
            new Date(),
            emailId
          ]);
          Logger.log(`Processed: ${data.amount} ${data.category}`);
        }
      });
      // Optionally label them so they aren't processed again by the main trigger if we add the label later
      const label = GmailApp.getUserLabelByName(config.gmailLabel);
      if (label) thread.addLabel(label);
    });
  });
}

function processEmails() {
  const sheetId = CONFIG.spreadsheetId; // Access global CONFIG object
  if (!sheetId) {
    Logger.log('Error: Spreadsheet ID not found in Config.gs');
    return;
  }
  
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(CONFIG.sheetName);
  if (!sheet) {
    Logger.log(`Error: Sheet "${CONFIG.sheetName}" not found`);
    return;
  }
  
  CARD_CONFIGS.forEach(config => {
    // Check if label exists
    const label = GmailApp.getUserLabelByName(config.gmailLabel);
    if (!label) {
      Logger.log(`Label ${config.gmailLabel} not found, skipping`);
      return;
    }
    
    // Get threads from label
    const threads = label.getThreads();
    
    threads.forEach(thread => {
      const messages = thread.getMessages();
      messages.forEach(message => {
        const emailId = message.getId();
        
        // Skip if already processed
        if (isProcessed(sheet, emailId)) {
          return;
        }
        
        // Parse email
        // We look for a global function with the name specified in config.parserFunction
        // In Apps Script, top-level functions are available in the global scope `this`
        const parserName = config.parserFunction;
        let data = null;
        
        try {
          // Use 'this' to access global functions or 'eval' if strictly necessary, 
          // but typically `this[parserName]` works in the V8 runtime if attached to global object.
          // Safer way in Apps Script: just define the functions globally and call them.
          // If strict mode prevents `this`, we can switch-case or map them.
          // For simplicity/robustness, we'll try to find it in the global scope proxy, 
          // but if that fails, we can map it manually or just use eval (safe here as config is internal).
          
          // Let's assume the functions are globally available.
           if (typeof this[parserName] === 'function') {
             data = this[parserName](message.getPlainBody(), config.othersCategoryTrigger);
           } else {
             // Fallback if needed, or error
             Logger.log(`Parser function ${parserName} not found`);
           }
        } catch (e) {
          Logger.log(`Error calling parser ${parserName}: ${e}`);
        }
        
        if (!data) {
          Logger.log(`Failed to parse email ${emailId} or no data returned`);
          return;
        }
        
        // Append to sheet
        // Columns: Date | Amount | Currency | Category | Card | Description | EmailDate | EmailID
        sheet.appendRow([
          message.getDate(),       // Date (Transaction date, approximation)
          data.amount,             // Amount
          'TL',                    // Currency (Hardcoded for now as per requirements)
          data.category,           // Category
          config.name,             // Card Name
          data.originalCategory,   // Description
          new Date(),              // EmailProcessedDate (or message date)
          emailId                  // EmailID
        ]);
        
        // Mark as processed
        const processedLabel = GmailApp.getUserLabelByName(CONFIG.processedLabel);
        if (processedLabel) {
          thread.addLabel(processedLabel);
          // Optional: remove the inbox/card label if desired, but adding 'Processed' is safer
          // thread.removeLabel(label); 
        }
      });
    });
  });
}

function isProcessed(sheet, emailId) {
  // Column H is index 8 (1-based) -> EmailID
  // We'll read the whole column to check.
  // Efficiency: For very large sheets, better to read simple range or use a cache/property service.
  // For personal finance, reading the col is okay.
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false; // Only header exists
  
  const data = sheet.getRange(2, 8, lastRow - 1, 1).getValues(); // Get Column H values
  return data.some(row => row[0] === emailId);
}

// Setup trigger
function createTrigger() {
  // Check if trigger already exists to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  const triggerExists = triggers.some(t => t.getHandlerFunction() === 'processEmails');
  
  if (!triggerExists) {
    ScriptApp.newTrigger('processEmails')
      .timeBased()
      .everyHours(1)
      .create();
    Logger.log('Trigger created.');
  } else {
    Logger.log('Trigger already exists.');
  }
}
