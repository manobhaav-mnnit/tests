# GSE-10 Static Test Site

Static quiz site designed for GitHub Pages.

## Files

- `index.html` - test selection page
- `test.html` - generic questionnaire page
- `results.html` - generic result page
- `js/tests.js` - test definitions and scoring ranges
- `js/app.js` - rendering, validation and score calculation
- `css/style.css` - styling

## Add another test

Add another entry to `tests` in `js/tests.js`. The same test engine will render it automatically.

## Data

No responses are sent to a server. The result is calculated in the browser and temporarily kept in `sessionStorage` only so the results page can display it. Closing the tab clears it.

## GSE-10 source

Questions and scoring are based on the supplied GSE-10 document. Keep the attribution when reproducing the scale.
