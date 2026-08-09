# Strength of Materials

A single-page reference and calculator for mechanics of materials. Twenty-six
relations across nine topics, each with a derivation from first principles and a
live calculator. Every result shows the formula and then the same formula with
your numbers substituted into it, so an answer can be checked rather than
trusted.

Units are fixed throughout: **N, mm, MPa (N/mm²), N·mm**.

## What it does

- **Pick a material once** and its constants fill in across every relation.
  Those fields become read-only, with a per-field override if you need to
  depart from the preset for one value.
- **Calculators sit beside the relation list**, so you never scroll past one to
  reach another. Inputs on the left, results tiled on the right.
- **Save and name calculations**, then update them in place as you refine the
  numbers. A separate automatic log records what you have worked on.
- Everything persists in `localStorage`, so closing the tab loses nothing.
- Light and dark themes, keyboard focus, and a layout that works to 360 px.

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
| `npm test` | Run the test suite once |
| `npm run test:watch` | Re-run tests on change |
| `npm run lint` | ESLint |

## Deploying to Netlify

`netlify.toml` holds the whole configuration — build command, publish
directory, Node version, caching and security headers — so no settings need to
be entered in the Netlify UI.

**From a Git repository (recommended).** Push this repo to GitHub/GitLab, then
in Netlify choose *Add new site → Import an existing project* and pick it.
Netlify reads `netlify.toml` and needs no further setup. Every push then
deploys, and pull requests get preview URLs.

**From the CLI.**

```bash
npm install -g netlify-cli
netlify login
netlify init      # first time: creates the site and links this directory
netlify deploy --prod
```

**By hand.** Run `npm run build` and drag the `dist/` folder onto
<https://app.netlify.com/drop>. Quickest for a one-off, but nothing is linked,
so the next deploy is another manual drag.

There are no environment variables and no backend. All state is client-side.

## How it is put together

```
src/
  types.ts              Relation, Output, Material, and the stored shapes
  data/
    materials.ts        the material library
    chapters/           one file per topic, A–I, plus the tests
  lib/
    format.ts           number formatting; renders NaN and ∞ as "—"
    resolve.ts          decides whether a field is typed or supplied by material
    storage.ts          the only module that touches localStorage
    glossary.ts         plain-English names for result symbols
  hooks/                persisted state: values, UI, saved cases, history
  components/           presentational; no business logic
  styles/app.css.ts     the whole stylesheet, injected once
```

Two decisions worth knowing about before editing:

**Field values are stored as text, not numbers.** Parsing on the way in would
destroy a half-typed `1e` or a lone `-`, and would turn a deliberately cleared
field into `0` — a real load nobody entered. Parsing happens once, at solve
time, and a blank field becomes `NaN`, which renders as `—`.

**The shear modulus is derived, never stored.** Handbooks quote mild steel at
E = 200 GPa, ν = 0.30 *and* G = 80 GPa, but E/2(1+ν) = 76.9 GPa — those three
cannot all be true. `materials.ts` stores only E and ν and computes G and K, so
the library cannot contradict relation A-02, whose entire subject is that an
isotropic material has just two independent constants.

## Tests

```bash
npm test
```

Covers the project spec's acceptance checks, the material-resolution rules, and
storage failure modes. Two are worth calling out:

- **Substitution lines are verified mechanically.** Every displayed `sub` line
  is translated back into JavaScript and evaluated against the number shown
  beside it. That is the check that catches the app misreporting its own
  working.
- **The spec's expected values for G-01 are wrong** and the test says so.
  It states σ₁ ≈ 115.4 and τ_max ≈ 85.4, but R = √(70² + 50²) = √7400 = 86.023,
  giving σ₁ = 116.02. √7300 = 85.44, so 7400 was read as 7300 somewhere. The
  code is correct; the test asserts the correct values with the arithmetic
  written out.

## Scope

Elastic, isotropic, small-strain theory throughout. Results are nominal values —
apply your own stress concentration, fatigue and code factors before committing
to a size. Published material properties vary between sources; check them
against your own standard.
