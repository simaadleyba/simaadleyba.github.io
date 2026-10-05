# Site analytics

The public pages load `config.js` before `tracker.js`. The tracker sends page views and link clicks to a Google Apps Script web app, which appends rows to the existing analytics spreadsheet.

The web app URL is public because visitors' browsers must send events to it. It is stored in `config.js`; no GitHub Actions secret is needed. The GitHub Pages workflow checks the URL before uploading the site, so a missing or malformed endpoint cannot silently disable tracking again.

## Updating the backend

1. In the analytics spreadsheet, open **Extensions → Apps Script**. Replace the script with `apps-script.js` and save it.
2. Open **Deploy → Manage deployments**. Edit the existing web app and select **New version**. Keep **Execute as: Me** and **Who has access: Anyone**. Reusing the deployment keeps the same `/exec` URL.
3. If the web app URL changes, update `config.js` and redeploy the site.

## Checking tracking

1. Check that the Pages workflow's **Validate analytics endpoint** step succeeds and that `https://simaadleyba.com/analytics/config.js` contains the current `/exec` URL.
2. Open the live homepage and `/networkscience/`. Each should add a `pageview` row to the spreadsheet. A link click should add a `click` row.
3. Country, city, and region require the updated Apps Script deployment. The old sheet rows are not changed.

The local preview does not write analytics rows.
