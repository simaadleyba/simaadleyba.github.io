// ==========================================
// LIGHTWEIGHT LINK & PAGE ANALYTICS TRACKER
// ==========================================
// Tracks page views and link clicks, sends data to a
// Google Apps Script endpoint that logs to Google Sheets.
//
// Captured data: timestamp, page, event type, clicked URL/text,
// referrer, timezone, language, screen size, device type, browser, OS.
//
// Requires: analytics/config.js loaded before this script.

(function () {
    'use strict';

    // --- Guard: config must be loaded ---
    if (typeof ANALYTICS_CONFIG === 'undefined' || !ANALYTICS_CONFIG.endpoint) {
        return;
    }

    var endpoint = ANALYTICS_CONFIG.endpoint;

    // Session ID groups events from the same page visit
    var sessionId = Math.random().toString(36).substr(2, 9);

    // --- Device / Browser / OS detection ---

    function getDeviceType() {
        var ua = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
        if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
        return 'desktop';
    }

    function getBrowser() {
        var ua = navigator.userAgent;
        if (ua.indexOf('Firefox/') > -1) return 'Firefox';
        if (ua.indexOf('Edg/') > -1) return 'Edge';
        if (ua.indexOf('OPR/') > -1 || ua.indexOf('Opera/') > -1) return 'Opera';
        if (ua.indexOf('Chrome/') > -1) return 'Chrome';
        if (ua.indexOf('Safari/') > -1) return 'Safari';
        return 'Other';
    }

    function getOS() {
        var ua = navigator.userAgent;
        if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
        if (ua.indexOf('Android') > -1) return 'Android';
        if (ua.indexOf('Windows') > -1) return 'Windows';
        if (ua.indexOf('Mac OS') > -1) return 'macOS';
        if (ua.indexOf('Linux') > -1) return 'Linux';
        return 'Other';
    }

    // --- Build base payload ---

    function basePayload() {
        return {
            sessionId: sessionId,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            referrer: document.referrer || '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
            language: navigator.language || '',
            screenWidth: screen.width,
            screenHeight: screen.height,
            deviceType: getDeviceType(),
            browser: getBrowser(),
            os: getOS()
        };
    }

    // --- Send event (fire-and-forget) ---

    function send(data) {
        var payload = JSON.stringify(data);

        try {
            if (navigator.sendBeacon) {
                var blob = new Blob([payload], { type: 'text/plain' });
                navigator.sendBeacon(endpoint, blob);
            } else {
                fetch(endpoint, {
                    method: 'POST',
                    mode: 'no-cors',
                    keepalive: true,
                    headers: { 'Content-Type': 'text/plain' },
                    body: payload
                }).catch(function () { });
            }
        } catch (e) {
            // Silently fail - analytics should never break the site
        }
    }

    // --- Track page view on load ---

    var payload = basePayload();
    payload.event = 'pageview';
    send(payload);

    // --- Track all link clicks ---

    document.addEventListener('click', function (e) {
        var link = e.target.closest('a');
        if (!link) return;

        var data = basePayload();
        data.event = 'click';
        data.clickedUrl = link.href || '';
        data.clickedText = (link.textContent || '').trim().substring(0, 100);
        send(data);
    });

})();
