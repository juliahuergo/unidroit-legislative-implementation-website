# UNIDROIT Soft-Law Implementation Database

A pilot database cataloguing the legislative implementation of UNIDROIT's
soft-law instruments by countries around the world.

Live site: https://unidroit-implementation.vercel.app/

Mirror (GitHub Pages): https://juliahuergo.github.io/unidroit-legislative-implementation-website/

## Updating the data (for editors)

1. Edit the Google Spreadsheet: https://docs.google.com/spreadsheets/d/1xbav3keP8A6UWtpj9vCshVaVPzP_DoE3_qWZaX3yZfA/edit?usp=sharing
2. That is all. The website refreshes itself automatically once a day
   (around 07:00 Rome time).

Where possible, also fill in the `perma_link` column in `legislative_texts`
with a [Perma.cc](https://perma.cc) permanent snapshot of the source document.
Original `link` URLs can break over time (link rot); the Perma snapshot
preserves the document, and each card offers it as an archived-copy fallback.

To publish a change immediately instead of waiting for the daily refresh:
go to the repository's "Actions" tab, open "Refresh data from Google Sheet",
and press "Run workflow".

## How the system works, end to end

The system has three parts: the spreadsheet (where the data lives), an
automated pipeline (which converts the spreadsheet into a data file), and a
static website (which displays it). No server runs anywhere; once deployed,
nothing needs to be maintained or restarted.

### 1. The spreadsheet

The Google Spreadsheet contains three tabs, mirroring the three-table data
model:

- `legislative_texts` - one row per national legislative act (includes a
  `perma_link` column holding a Perma.cc snapshot of the source, as a
  link-rot-proof fallback to the original `link`)
- `unidroit_principles` - one row per UNIDROIT principle / article
- `merged` - the junction table: one row per connection between a text and a
  principle / article

The spreadsheet is shared as "anyone with the link can view", which is what
allows the pipeline to read it without credentials.

### 2. The daily refresh (`.github/workflows/refresh-data.yml`)

Every day at 05:00 UTC (and on demand via the "Run workflow" button), GitHub
Actions starts a temporary Linux machine in GitHub's cloud and runs
`unidroit/src/load_datasets.py`. The script:

1. Downloads each spreadsheet tab as CSV, using Google's CSV-export URL
   (`.../gviz/tq?tqx=out:csv&sheet=<tab name>`). pandas reads these URLs
   directly, so no manual download is involved.
2. Joins the three tables (`merged` + texts on `text_id`, then + principles
   on `principle_id`) into one row per text-principle connection.
3. Writes the result to `unidroit/public/result.json`.

The workflow then commits `result.json` back to the repository, but only if
its content actually changed (`git diff --cached --quiet ||` skips the commit
when the file is identical). If the spreadsheet was not edited, the workflow
ends without any commit and nothing else happens.

### 3. Deployment: every push to `main` republishes the site

Two hosts deploy independently from the same repository whenever `main`
receives a push, whether from a person or from the refresh workflow:

- **Vercel** is connected to the repository through its GitHub integration
  (project setting "Root Directory" = `unidroit`). It runs `npm run build`
  and serves the result at https://unidroit-implementation.vercel.app/.
- **GitHub Pages** is deployed by `.github/workflows/deploy-pages.yml`:
  checkout, install Node, `npm ci`, `npm run build`, publish `unidroit/dist`.

Pages serves the site under the subpath `/unidroit-legislative-implementation-website/`,
while Vercel serves from the domain root. `unidroit/vite.config.js` handles
this: the Pages workflow sets the environment variable `GHPAGES`, which
switches Vite's `base` option; the app fetches its data via
`import.meta.env.BASE_URL` so the same code works on both hosts (and in local
development).

### 4. The website itself

The site is a React + Vite + Tailwind single-page application
(`unidroit/src/App.jsx`). On load it fetches `result.json` once; all
searching, filtering and sorting happen in the visitor's browser. Because the
deployed site is only static files plus one JSON file, hosting is free and
there is no backend to break.

### The complete chain

```
Librarian edits spreadsheet
        |
        v  (daily, 05:00 UTC, or manual trigger)
GitHub Action: load_datasets.py reads sheet -> rebuilds result.json
        |
        v  (only if the data changed)
Commit pushed to main by github-actions[bot]
        |
        +--> Vercel rebuilds and redeploys
        +--> GitHub Pages workflow rebuilds and redeploys
        |
        v
Visitors see the updated database (about a minute later)
```

## Local development

```
cd unidroit
npm install
npm run dev        # development server at http://localhost:5173
```

To regenerate the data file locally: `python unidroit/src/load_datasets.py`
from the repository root (requires Python and pandas).

## Maintenance notes

- The refresh schedule relies on GitHub's rule that scheduled workflows in
  public repositories are disabled after about 60 days without repository
  activity. Data edits create commits and keep it alive; after a long pause,
  re-enable the workflow with one click in the Actions tab.
- The spreadsheet must remain shared as "anyone with the link can view";
  revoking that breaks the daily refresh (the workflow run will fail, but the
  live site keeps serving the last published data).
- Renaming a spreadsheet tab breaks the pipeline: the tab names are
  referenced in `load_datasets.py`.
