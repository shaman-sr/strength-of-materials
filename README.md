# Material Test Analyzer

Give it the force and elongation readings from a tensile test, tell it the
specimen's dimensions, and it works out how stiff, how strong and how ductile
the material is — then draws the stress–strain curve those numbers came from.

There is no single number called "strength". The app reports five properties
separately, because they answer different questions.

**Any material, any specimen.** Nothing is tuned to steel or to metals — the
same arithmetic turns force into stress and stretch into strain whatever was
pulled. Round and rectangular cross-sections are offered to save you the
arithmetic; for a tube, a hexagon, a moulded dogbone or anything else, enter the
cross-sectional area directly.

## What it does

1. **Reads your test file.** A comma-separated export with a heading row, one
   column of force and one of elongation. It recognises the usual column names
   (`force`, `load`, `elongation`, `extension`, `displacement`) with or without
   a unit in the heading; when it cannot tell, it asks you to pick the two
   columns rather than guessing.
2. **Normalises away the specimen's size**, so results can be compared between
   specimens:

   | | |
   |---|---|
   | Engineering stress | force ÷ original cross-sectional area |
   | Engineering strain | elongation ÷ original gauge length |

3. **Extracts the properties:**

   | Property | How it is found |
   |---|---|
   | Young's modulus | Least-squares straight line through the readings between 5% and 40% of the ultimate stress. The lower bound skips the toe region, where the grips are still bedding in; the upper stops well short of yield. |
   | Yield strength | The 0.2% offset method: a line of the elastic slope shifted 0.002 to the right, taken where the curve crosses it. Reported as unavailable when there is no crossing, which is what a brittle specimen does. |
   | Ultimate tensile strength | The highest stress reached. |
   | Fracture stress | The stress at the last reading. |
   | Elongation at break | The strain at the last reading, as a percentage. Above 5% the material is called ductile. |

4. **Draws the curve** with yield, ultimate and fracture marked on it and the
   elastic region shaded.

Anything that weakens a result — skipped rows, too few readings, a poor
straight-line fit — is reported as a note beside the numbers rather than being
hidden or treated as a failure.

## Units

Fixed throughout: **force in newtons, length in millimetres**. Stress therefore
comes out in N/mm², which is a megapascal. Young's modulus is shown in
gigapascals because that is how it is usually quoted.

If your machine exports kilonewtons or inches, convert before uploading.

## The file it expects

```csv
force,elongation
0,0
1000,0.04
2000,0.08
3000,0.13
4000,0.25
```

Rows whose force or elongation cannot be read as a number are skipped and
counted, so a blank trailing cell or a `paused` marker does not spoil the run.

## Sample data

`sample_data/` holds four files to try it with, each also loadable from inside
the app with its specimen dimensions filled in. They are the same files the app
parses — imported as text at build time, not copied — so downloading one shows
exactly what the app expects.

| File | Shows |
|---|---|
| `stainless-steel-304.csv` | A very ductile metal: 193 GPa, yield 313 MPa, ultimate 620 MPa, 55% elongation. |
| `aluminium-6061-t6.csv` | About a third the stiffness of steel: 69 GPa, ultimate 310 MPa, 15% elongation. Headings carry their units. |
| `grey-cast-iron.csv` | Brittle. Snaps at 0.3% stretch, so there is no yield strength and the app says so rather than inventing one. |
| `machine-export-raw.csv` | A realistic raw export: a time column, channels named `channel_1` and `channel_2`, a paused row with empty cells, a blank line. The app cannot guess the columns, so it asks. |

`sample_data/README.md` describes them in full. The numbers are modelled rather
than logged off a machine — noise-free, which makes it obvious when the app is
wrong rather than when the data is.

## Running locally

```bash
npm install
npm run dev
```

| Script | Does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check then produce `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Deploying to Netlify

`netlify.toml` holds the whole configuration — build command, publish
directory, Node version, caching and security headers — so no settings need to
be entered in the Netlify UI. Push the repo and choose *Add new site → Import an
existing project*, or run `netlify deploy --prod` from the CLI. There are no
environment variables and no backend; the file you upload never leaves your
browser.

## How it is put together

Almost all of the interface comes from libraries, so there is very little code
to maintain:

| Job | Library |
|---|---|
| File drop, inputs, cards, layout, light and dark themes | [Mantine](https://mantine.dev) |
| The chart | [Recharts](https://recharts.org) |
| Reading the file | [Papa Parse](https://www.papaparse.com) |

What is left is the part no library can supply:

```
sample_data/            the four example files, and a note on each
src/
  types.ts              Specimen, Reading, Point, Analysis
  lib/
    analysis.ts         area, stress and strain, modulus fit, offset yield
    parseCsv.ts         column detection over Papa Parse
    format.ts           number formatting; renders NaN and ∞ as "—"
    download.ts         hands a string to the browser as a file
  data/examples.ts      imports sample_data/*.csv as text, with each specimen
  components/           thin wrappers over Mantine and Recharts
    Explainer.tsx       the folded-away explanation of the whole subject
  App.tsx               holds the specimen and the readings; nothing persists
```

`src/lib/analysis.ts` is pure functions with no React in it, so the arithmetic
can be read and checked on its own.

## Scope

Engineering stress and strain, against the specimen's *original* area and
length — not true stress and strain, which correct for the section thinning as
it stretches. The two agree closely up to yield and diverge after it, so the
modulus and yield figures are unaffected while the ultimate and fracture
figures are the conventional engineering ones.

Results are nominal. Apply your own stress concentration, fatigue and code
factors before committing to a size.
