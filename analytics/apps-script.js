// ==========================================
// GOOGLE APPS SCRIPT - ANALYTICS BACKEND
// ==========================================
//
// This script receives analytics events from the website
// and logs them to the active Google Sheet.
//
// SETUP:
// 1. Create a new Google Sheet (this will store your analytics data)
// 2. Go to Extensions > Apps Script
// 3. Delete any existing code and paste this entire file
// 4. Click Deploy > New deployment
// 5. Choose "Web app" as the type
// 6. Set "Execute as" to "Me"
// 7. Set "Who has access" to "Anyone"
// 8. Click Deploy and authorize when prompted
// 9. Copy the web app URL
// 10. Paste the URL into analytics/config.js as the endpoint value
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
                var geoResponse = UrlFetchApp.fetch('http://ip-api.com/json/' + ip + '?fields=country,city,regionName');
                var geo = JSON.parse(geoResponse.getContentText());
                country = geo.country || '';
                city = geo.city || '';
                region = geo.regionName || '';
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
