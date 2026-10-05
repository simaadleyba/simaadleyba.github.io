// ==========================================
// GOOGLE APPS SCRIPT - ANALYTICS BACKEND
// ==========================================
//
// This script receives analytics events from the website
// and logs them to the active Google Sheet.
//
// SETUP:
// 1. Open the existing analytics spreadsheet and choose Extensions > Apps Script.
// 2. Replace the script with this file, then save it.
// 3. Choose Deploy > Manage deployments, edit the web app, and select New version.
// 4. Keep "Execute as" set to "Me" and access set to "Anyone", then deploy.
// 5. Put the /exec URL in analytics/config.js; Pages validates it on deployment.
//
// The sheet will automatically get headers on the first event.
// Each row = one event (page view or link click).

function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Add headers if the sheet is empty
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                'Timestamp',
                'Event',
                'Page',
                'Clicked URL',
                'Clicked Text',
                'Referrer',
                'Country',
                'City',
                'Region',
                'IP',
                'Timezone',
                'Language',
                'Screen',
                'Device Type',
                'Browser',
                'OS',
                'Session ID'
            ]);
        }

        // Look up location from IP server-side
        var country = '';
        var city = '';
        var region = '';
        var ip = data.ip || '';

        if (ip) {
            try {
                var geoResponse = UrlFetchApp.fetch('https://ipwho.is/' + encodeURIComponent(ip) + '?fields=success,country,city,region');
                var geo = JSON.parse(geoResponse.getContentText());
                if (geo.success) {
                    country = geo.country || '';
                    city = geo.city || '';
                    region = geo.region || '';
                }
            } catch (geoErr) {
                // Geo lookup failed, continue without location
            }
        }

        sheet.appendRow([
            data.timestamp || '',
            data.event || '',
            data.page || '',
            data.clickedUrl || '',
            data.clickedText || '',
            data.referrer || '',
            country,
            city,
            region,
            ip,
            data.timezone || '',
            data.language || '',
            (data.screenWidth || '') + 'x' + (data.screenHeight || ''),
            data.deviceType || '',
            data.browser || '',
            data.os || '',
            data.sessionId || ''
        ]);

        return ContentService
            .createTextOutput(JSON.stringify({ status: 'ok' }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Handle GET requests (health check)
function doGet(e) {
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
}
