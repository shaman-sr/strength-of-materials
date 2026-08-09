/* A calm, modern reference tool.

   Near-white surfaces, soft grey borders, gently rounded corners, one blue
   accent used only for computed values and active state. Sentence case
   everywhere. System sans for text; monospace for numbers and equations so
   digits line up and formulas stay legible.

   Layout is master–detail: pick a relation from a list that stays put, and it
   opens beside the list with inputs and results side by side. Nothing is
   hidden behind scrolling past everything else. */

export const CSS = `
.app {
  --bg:#F7F8FA;
  --surface:#FFFFFF;
  --surface-2:#F1F3F6;
  --field:#FFFFFF;
  --text:#16191F;
  --text-2:#5C6472;
  --text-3:#858D9C;
  --border:#E2E5EA;
  --border-2:#CDD2DA;
  --accent:#1F6FEB;
  --accent-soft:#EAF1FE;
  --accent-text:#1A5FCC;
  --warn:#B45309;
  --warn-soft:#FEF6E7;

  --sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  --col: 1240px;
  --r: 10px;

  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.55;
  min-height: 100%;
  padding-bottom: 64px;
  -webkit-font-smoothing: antialiased;
}

[data-theme="dark"] .app {
  --bg:#0E1116;
  --surface:#161A21;
  --surface-2:#1C222B;
  --field:#11151B;
  --text:#E8EBF0;
  --text-2:#A0A9B8;
  --text-3:#7A8494;
  --border:#262D38;
  --border-2:#333C4A;
  --accent:#4D93FF;
  --accent-soft:#16243B;
  --accent-text:#7DB0FF;
  --warn:#E8A13A;
  --warn-soft:#2A2214;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .app {
    --bg:#0E1116;
    --surface:#161A21;
    --surface-2:#1C222B;
    --field:#11151B;
    --text:#E8EBF0;
    --text-2:#A0A9B8;
    --text-3:#7A8494;
    --border:#262D38;
    --border-2:#333C4A;
    --accent:#4D93FF;
    --accent-soft:#16243B;
    --accent-text:#7DB0FF;
    --warn:#E8A13A;
    --warn-soft:#2A2214;
  }
}

.app * { box-sizing: border-box; }
.app h1,.app h2,.app h3,.app p,.app ol,.app ul,.app dl,.app dd,.app dt { margin: 0; }
/* Wrapped in :where() so this contributes zero specificity. A plain
   ".app button" rule scores higher than ".btn" and would beat every button
   class in the file no matter what order they appear in — which is exactly
   what was stripping the chrome off the buttons and the highlight off the
   selected tab. */
:where(.app button) {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
}

/* Subscripts sit slightly larger than the browser default, which shrinks them
   to the point of guessing, and are nudged down so they read as attached to
   the symbol rather than floating after it. */
.app sub {
  font-size: .72em;
  line-height: 0;
  vertical-align: -.28em;
  letter-spacing: .01em;
}

.app button:focus-visible,
.app input:focus-visible,
.app select:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}

.wrap { max-width: var(--col); margin: 0 auto; padding: 0 24px; }
@media (max-width: 560px) { .wrap { padding: 0 16px; } }

/* ---- header ---------------------------------------------------------- */

.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 26px 0 22px;
}
.header-top { display: flex; align-items: flex-start; gap: 20px; }
.header-text { flex: 1; min-width: 0; }
.header h1 { font-size: 23px; font-weight: 650; letter-spacing: -.02em; line-height: 1.25; }
.header-sub { margin-top: 5px !important; color: var(--text-2); font-size: 15px; max-width: 52ch; }

.theme-btn {
  flex: 0 0 auto;
  font-size: 14px; color: var(--text-2);
  border: 1px solid var(--border); border-radius: 8px;
  padding: 7px 13px; background: var(--surface);
}
.theme-btn:hover { color: var(--text); border-color: var(--border-2); }

/* ---- material panel -------------------------------------------------- */

.material {
  margin-top: 20px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 15px 18px;
}
.material-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.material-label { font-size: 15px; font-weight: 550; flex: 0 0 auto; }

.select-wrap { position: relative; display: inline-flex; align-items: center; }
.select-wrap select {
  appearance: none; -webkit-appearance: none;
  font-family: inherit; font-size: 15px; color: var(--text);
  background: var(--field);
  border: 1px solid var(--border-2); border-radius: 8px;
  padding: 9px 36px 9px 12px;
  cursor: pointer; min-width: 0; max-width: 100%;
}
.select-wrap select:hover { border-color: var(--accent); }
.select-caret {
  position: absolute; right: 12px; pointer-events: none;
  color: var(--text-3); font-size: 11px;
}

.override-chip {
  font-size: 13px; color: var(--warn);
  background: var(--warn-soft); border-radius: 20px; padding: 4px 11px;
}

.constants {
  display: flex; flex-wrap: wrap; gap: 6px 22px;
  margin-top: 13px !important;
  font-size: 14px; color: var(--text-2);
}
.constants b { font-weight: 550; color: var(--text); font-family: var(--mono); font-size: 13.5px; }
.derived-flag { color: var(--accent-text); font-size: 12px; }
.material-note {
  margin-top: 11px !important;
  font-size: 13.5px; line-height: 1.5; color: var(--text-2); max-width: 90ch;
}
.material-empty { margin-top: 11px !important; font-size: 14px; color: var(--text-2); }

/* ---- notices --------------------------------------------------------- */

.notice {
  margin-top: 18px;
  background: var(--warn-soft);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 12px 16px;
  font-size: 14px; line-height: 1.5; color: var(--warn);
}

/* ---- topic tabs ------------------------------------------------------
   These wrap instead of scrolling sideways. Nine topics on one or two rows
   are all readable at once; a sideways scroll hides options behind a gesture
   nobody knows is available. */

.tabs {
  display: flex; flex-wrap: wrap; gap: 4px;
  margin-top: 18px;
}
.tab {
  padding: 8px 14px; border-radius: 8px;
  font-size: 15px; color: var(--text-2); white-space: nowrap;
}
.tab:hover { background: var(--surface-2); color: var(--text); }
.tab-on { background: var(--accent-soft); color: var(--accent-text); font-weight: 550; }
.tab-on:hover { background: var(--accent-soft); color: var(--accent-text); }

/* ---- search ---------------------------------------------------------- */

.search { display: flex; gap: 10px; align-items: center; margin-top: 14px; }
.search input {
  flex: 1; min-width: 0;
  font-family: inherit; font-size: 15px; color: var(--text);
  background: var(--surface); border: 1px solid var(--border-2);
  border-radius: 8px; padding: 10px 14px;
}
.search input::placeholder { color: var(--text-3); }
.search input:focus { border-color: var(--accent); }
.link-btn { font-size: 14px; color: var(--accent-text); padding: 6px 4px; }
.link-btn:hover { text-decoration: underline; }

/* ---- master / detail -------------------------------------------------- */

.browser {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 20px;
  margin-top: 18px;
  align-items: start;
}
@media (max-width: 960px) { .browser { grid-template-columns: 1fr; } }

/* The list stays in view while you work in the panel beside it. */
.list-col { position: sticky; top: 16px; }
@media (max-width: 960px) { .list-col { position: static; } }

.list-head {
  font-size: 13px; font-weight: 600; color: var(--text-3);
  text-transform: uppercase; letter-spacing: .06em;
  padding: 0 4px 8px;
}
.relation-list {
  list-style: none; padding: 6px; margin: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}
@media (max-width: 960px) { .relation-list { max-height: 340px; } }

.relation-item { width: 100%; text-align: left; padding: 9px 11px; border-radius: 7px; }
.relation-item:hover { background: var(--surface-2); }
.relation-item-on { background: var(--accent-soft); }
.relation-item-on:hover { background: var(--accent-soft); }
.relation-item-id {
  font-family: var(--mono); font-size: 11.5px; color: var(--text-3);
}
.relation-item-on .relation-item-id { color: var(--accent-text); }
.relation-item-name {
  display: block; font-size: 14.5px; line-height: 1.35; margin-top: 1px;
}
.relation-item-on .relation-item-name { color: var(--accent-text); font-weight: 550; }
.relation-item-topic { display: block; font-size: 12.5px; color: var(--text-3); margin-top: 2px; }

/* ---- detail panel ----------------------------------------------------- */

.detail {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 22px 24px 24px;
}
@media (max-width: 560px) { .detail { padding: 18px 16px 20px; } }

.detail-id {
  font-family: var(--mono); font-size: 12px;
  color: var(--accent-text); background: var(--accent-soft);
  padding: 3px 8px; border-radius: 5px;
}
.detail h2 { font-size: 20px; font-weight: 650; letter-spacing: -.01em; margin-top: 10px !important; }
.detail-formula {
  margin-top: 10px !important;
  display: inline-block;
  font-family: var(--mono); font-size: 15px; line-height: 1.6;
  color: var(--text);
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 8px; padding: 8px 13px;
  word-break: break-word;
}
.detail-why {
  margin-top: 12px !important;
  font-size: 15px; line-height: 1.55; color: var(--text-2); max-width: 80ch;
}

/* Inputs and results, side by side. The point of the layout: change a value
   and watch the number beside it move, without scrolling between them. */
.calc {
  display: grid;
  grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
  gap: 24px;
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  align-items: start;
}
@media (max-width: 860px) { .calc { grid-template-columns: 1fr; gap: 20px; } }

.block-label {
  font-size: 13px; font-weight: 600; color: var(--text-2);
  margin-bottom: 12px !important;
}

.inputs { display: flex; flex-direction: column; gap: 13px; }

.field-label {
  display: block; font-size: 14px; color: var(--text-2); margin-bottom: 5px;
}
.field-input {
  display: flex; align-items: stretch;
  background: var(--field);
  border: 1px solid var(--border-2); border-radius: 8px;
  overflow: hidden;
}
.field-input:focus-within { border-color: var(--accent); }
.field-input input {
  flex: 1; min-width: 0; border: none; background: transparent;
  padding: 9px 12px;
  font-family: var(--mono); font-size: 15px; color: var(--text);
}
.field-input input:focus { outline: none; }
.field-unit {
  display: flex; align-items: center; padding: 0 11px;
  font-size: 13px; color: var(--text-3);
  background: var(--surface-2); border-left: 1px solid var(--border);
  white-space: nowrap;
}

.field-fixed { background: var(--surface-2); }
.field-source {
  display: flex; align-items: center; gap: 8px; padding: 0 10px;
  background: var(--surface-2); border-left: 1px solid var(--border);
  font-size: 12.5px; color: var(--text-3); white-space: nowrap;
}
.field-edit { font-size: 12.5px; color: var(--accent-text); padding: 0 2px; }
.field-edit:hover { text-decoration: underline; }

.field-changed { border-color: var(--warn); }
.field-restore {
  display: block; margin-top: 5px;
  font-size: 12.5px; color: var(--warn); text-align: left; line-height: 1.4;
}
.field-restore:hover { text-decoration: underline; }

.input-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }

/* ---- results ----------------------------------------------------------
   Value, then the formula, then the same formula with the numbers put in.
   That last line is what lets you check a result instead of trusting it. */

.results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.result {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 9px;
  padding: 14px 16px;
}
.result-name { font-size: 14px; line-height: 1.4; }
.result-title { color: var(--text); font-weight: 550; }
/* Explicit margin rather than a flex gap: the name and symbol must never run
   together as "Extensionδ", and a margin holds even if the layout changes. */
.result-title + .result-sym { margin-left: 7px; }
.result-sym { font-family: var(--mono); font-size: 14px; color: var(--text-3); }
.result-value { display: flex; align-items: baseline; gap: 7px; flex-wrap: wrap; margin-top: 4px; }
.result-number {
  font-family: var(--mono); font-size: 25px; font-weight: 600;
  color: var(--accent-text); letter-spacing: -.02em; line-height: 1.15;
}
.result-unit { font-size: 14px; color: var(--text-2); }

/* The working: symbolic form, then the same form with the numbers in it.
   The "=" is held in its own column so both lines align under each other and
   read as one continuous derivation. */
.result-working {
  margin-top: 11px; padding-top: 10px;
  border-top: 1px dashed var(--border-2);
}
.result-working > div {
  display: grid; grid-template-columns: 14px minmax(0, 1fr); gap: 6px;
  font-family: var(--mono); font-size: 13.5px; line-height: 1.7;
  word-break: break-word;
}
.working-eq { color: var(--text-3); margin-right: 4px; }
.working-symbolic { color: var(--text); }
.working-numeric { color: var(--text-2); margin-top: 2px; }
.result-note { margin-top: 8px !important; font-size: 13px; color: var(--text-2); line-height: 1.45; }

.results-empty {
  font-size: 14.5px; color: var(--text-2);
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 9px; padding: 14px 16px;
}

/* ---- buttons ---------------------------------------------------------- */

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 500; line-height: 1.2;
  padding: 10px 16px; border-radius: 8px;
  border: 1px solid var(--border-2);
  background: var(--surface); color: var(--text);
  white-space: nowrap;
  transition: background-color .12s ease, border-color .12s ease, color .12s ease;
}
.btn:hover { background: var(--surface-2); border-color: var(--accent); color: var(--accent-text); }
.btn:active { transform: translateY(1px); }

.btn-primary {
  background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600;
}
.btn-primary:hover { background: var(--accent-text); border-color: var(--accent-text); color: #fff; }

/* Destructive-adjacent and secondary, so it should not compete for attention. */
.btn-quiet { background: transparent; border-color: transparent; color: var(--text-2); }
.btn-quiet:hover { background: var(--surface-2); border-color: var(--border-2); color: var(--text); }

.saved-confirm { font-size: 14px; color: var(--accent-text); align-self: center; }

/* ---- save box ---------------------------------------------------------
   Naming and saving live beside the inputs, because that is where the values
   are being changed. */

.savebox {
  margin-top: 18px; padding: 15px 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
}
.savebox-editing { border-color: var(--accent); background: var(--accent-soft); }

.savebox-status {
  display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
  font-size: 13.5px; color: var(--text-2);
  margin-bottom: 12px !important;
}
.savebox-status strong { color: var(--text); font-weight: 600; }

.savebox-name {
  width: 100%;
  font-family: inherit; font-size: 15px; color: var(--text);
  background: var(--field); border: 1px solid var(--border-2);
  border-radius: 8px; padding: 10px 12px;
}
.savebox-name:focus { border-color: var(--accent); outline: none; }
.savebox-name::placeholder { color: var(--text-3); }

.savebox-actions {
  display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
  margin-top: 12px;
}

/* ---- derivation ------------------------------------------------------- */

.derivation { margin-top: 22px; border-top: 1px solid var(--border); padding-top: 16px; }
.derivation-toggle {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 550; color: var(--accent-text);
  padding: 4px 0;
}
.derivation-toggle:hover { text-decoration: underline; }
.derivation-toggle span[aria-hidden] { font-size: 10px; }

.steps {
  list-style: none; counter-reset: step; padding: 0;
  margin-top: 16px !important;
  columns: 2; column-gap: 32px;
}
@media (max-width: 860px) { .steps { columns: 1; } }
.steps li {
  counter-increment: step; position: relative;
  padding-left: 36px; padding-bottom: 18px;
  break-inside: avoid;
}
.steps li::before {
  content: counter(step);
  position: absolute; left: 0; top: 1px;
  width: 23px; height: 23px; line-height: 23px; text-align: center;
  border-radius: 50%;
  background: var(--accent-soft); color: var(--accent-text);
  font-size: 12px; font-weight: 600; font-family: var(--mono);
}
.step-text { font-size: 15px; line-height: 1.65; color: var(--text); }
.step-eq {
  margin-top: 9px !important;
  font-family: var(--mono); font-size: 14.5px; line-height: 1.7;
  color: var(--text);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 8px; padding: 11px 14px;
  overflow-x: auto; white-space: pre-wrap; word-break: break-word;
}

/* ---- saved calculations and history ----------------------------------- */

.panels {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  margin-top: 26px;
}
@media (max-width: 860px) { .panels { grid-template-columns: 1fr; } }

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 18px;
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.panel-title { font-size: 16px; font-weight: 600; }
.panel-count { font-size: 14px; color: var(--text-3); font-weight: 400; }
.panel-empty { margin-top: 10px !important; font-size: 14.5px; color: var(--text-2); }

.entries {
  list-style: none; padding: 0; margin: 12px 0 0 !important;
  max-height: 300px; overflow-y: auto;
}
.entry { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; }
.entry:hover { background: var(--surface-2); }
.entry-active { background: var(--accent-soft); }
.entry-active:hover { background: var(--accent-soft); }
.entry-badge {
  margin-left: 8px; font-size: 11.5px; font-weight: 600;
  color: var(--accent-text); text-transform: uppercase; letter-spacing: .05em;
}
.entry-id {
  flex: 0 0 auto; font-family: var(--mono); font-size: 11.5px;
  color: var(--accent-text); background: var(--accent-soft);
  padding: 2px 6px; border-radius: 5px;
}
.entry-main { flex: 1; min-width: 0; text-align: left; }
.entry-name {
  display: block; font-size: 14px; line-height: 1.35;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.entry-main:hover .entry-name { text-decoration: underline; }
.entry-values {
  display: block; margin-top: 1px;
  font-family: var(--mono); font-size: 12px; color: var(--text-3);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.entry-date { flex: 0 0 auto; font-size: 12.5px; color: var(--text-3); white-space: nowrap; }
.entry-delete { flex: 0 0 auto; font-size: 12.5px; color: var(--text-3); padding: 4px 5px; }
.entry-delete:hover { color: var(--warn); }

/* ---- footer ----------------------------------------------------------- */

.footer { margin-top: 30px; padding-top: 18px; border-top: 1px solid var(--border); }
.footer p { font-size: 13.5px; line-height: 1.6; color: var(--text-2); max-width: 100ch; }
.footer p + p { margin-top: 8px !important; }

@media (prefers-reduced-motion: reduce) {
  .app * { transition: none !important; animation: none !important; }
}
`
