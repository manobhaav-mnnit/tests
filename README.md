# Manobhaav Interactive Tests

Static GitHub Pages frontend for Manobhaav's interactive questionnaires.

## Features

- Multiple tests from one reusable frontend.
- GSE-10 included.
- Instant client-side scoring.
- Participant name.
- Responsive Manobhaav editorial styling.
- Optional Google Sheets submission.
- One Google Sheet backend for all tests.
- Automatic separate Sheet tab per test.
- Master "All Responses" tab.
- No database or server required for the frontend.

## Deployment

Upload:

- `index.html`
- `test.html`
- `results.html`
- `css/style.css`
- `js/app.js`
- `js/tests.js`

to the root of a GitHub Pages repository.

Then configure `SHEETS_ENDPOINT` in `js/app.js` with the deployed
Google Apps Script `/exec` URL.

See `SHEETS_SETUP.txt` for the complete backend setup.
