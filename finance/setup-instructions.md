# Finance Tracker Setup Guide

This guide will walk you through setting up the Google Apps Script backend and Google Sheets API for your personal finance tracker.

## Prerequisites
- A Google Account
- Valid bank transaction emails in your Gmail
- Basic familiarity with Google Cloud Console (instructions provided)

---

## Part 1: Google Sheet Setup

1. Create a new Google Sheet.
2. Rename the sheet (the tab at the bottom) to `FinanceTracker`.
3. In the first row, add these exact headers:
   `Date`, `Amount`, `Currency`, `Category`, `Card`, `Description`, `EmailDate`, `EmailID`
4. **Share the Sheet**:
   - Click "Share" in the top right.
   - Change "Restricted" to "Anyone with the link".
   - Set permission to **Viewer**.
   - Copy the Sheet ID from the URL: `docs.google.com/spreadsheets/d/[THIS_PART_IS_THE_ID]/edit`
   - Save this ID for later.

---

## Part 2: Google Apps Script (Email Parser)

1. Go to [script.google.com](https://script.google.com/) and create a "New Project".
2. Name it "FinanceEmailParser".
3. You will see a `Code.gs` file.
4. **Copy Code**:
   - Open `finance/apps-script/Code.gs` from this repo. Copy all content and paste it into the script editor's `Code.gs`.
5. **Create Files**:
   - Click `+` next to Files > Script. Name it `CardParsers`. Paste content from `finance/apps-script/CardParsers.gs`.
   - Click `+` next to Files > Script. Name it `Config`. Paste content from `finance/apps-script/Config.gs`.
6. **Update Config**:
   - inside `Config.gs` in the script editor, replace `'YOUR_SPREADSHEET_ID_HERE'` with the ID you copied in Part 1.
7. **Create Gmail Labels**:
   - Go to Gmail.
   - Create a label named `FinanceTracker-CardA`.
   - Create a label named `FinanceTracker-Processed`.
   - Create a filter: From `HIZMET@bilgi.akbank.com` AND Subject `Akbank Kart harcamanız` -> Apply Label `FinanceTracker-CardA`.
8. **Run & Authorize**:
   - In Apps Script, select `createTrigger` from the dropdown at the top.
   - Click "Run".
   - You will see an authorization popup. Review permissions, click "Advanced" -> "Go to FinanceEmailParser (unsafe)" -> Allow.
   - This sets up the script to run every hour.

---

## Part 3: Web Dashboard Setup (The Easy Way)

Instead of using Google Cloud, we will just publish the sheet as a CSV file.

1. **Publish to Web**:
   - Open your Google Sheet.
   - Go to **File > Share > Publish to web**.
   - In the "Link" tab, select "Entire Document" (or just `FinanceTracker` sheet).
   - Change the format from "Web page" to **Comma-separated values (.csv)**.
   - Click **Publish**.
   - **Copy the generated link**.

2. **Configure Frontend**:
   - In your local repo, copy `finance/config.example.js` to `finance/config.js` (if you haven't already).
   - Open `finance/config.js`.
   - Paste the link you copied into the `csvUrl` field.
   - Save the file.

---

## Part 4: Deployment

1. Add a link to `finance/index.html` in your main website navigation (already done by the assistant).
2. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Add finance tracker"
   git push
   ```
   *Note: `config.js` will not be pushed because it is in .gitignore.*
3. Visit `https://simaadleyba.github.io/finance/` to see your dashboard!
