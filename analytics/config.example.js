// Analytics Configuration
// =======================
// 1. Copy this file and rename it to config.js
// 2. Replace the endpoint URL with your deployed Google Apps Script web app URL
// 3. Make sure config.js is in .gitignore (it already is)
//
// To get the endpoint URL:
//   - Open Google Sheets > Extensions > Apps Script
//   - Paste the code from analytics/apps-script.js
//   - Deploy > New deployment > Web app
//   - Set "Execute as: Me" and "Who has access: Anyone"
//   - Copy the web app URL

var ANALYTICS_CONFIG = {
    endpoint: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
};
