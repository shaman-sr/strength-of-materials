# Sample data

Four tensile-test files to try the analyzer with. They are also what the app's
built-in examples load — the app reads these exact files, so what you download
here is what it parses.

The numbers are modelled rather than logged off a real machine. They follow the
usual shape of each material's curve closely enough to exercise every part of
the analysis, and they are noise-free, which makes it obvious when the app is
wrong rather than when the data is.

| File | Specimen | What it shows |
|---|---|---|
| `stainless-steel-304.csv` | 10 mm round bar, 50 mm gauge length | A very ductile metal. Yields early, hardens a long way, stretches past 50% before breaking. |
| `aluminium-6061-t6.csv` | 12.5 mm round bar, 50 mm gauge length | About a third the stiffness of steel and a much shorter curve. Headings carry their units in brackets. |
| `grey-cast-iron.csv` | 10 mm round bar, 50 mm gauge length | Brittle. It snaps at about 0.3% stretch, before the 0.2% offset line can catch the curve, so there is no yield strength to report — the app says so instead of inventing one. |
| `machine-export-raw.csv` | 12.5 mm round bar, 50 mm gauge length | The same aluminium test as a machine might actually export it: a time column, channels named `channel_1` and `channel_2`, one row where the machine was paused and the cells are empty, and a blank line. The app cannot guess the columns here, so it asks. |

## Format

A comma-separated file with a heading row, one column of force in **newtons**
and one of elongation in **millimetres**:

```csv
force,elongation
0,0
1000,0.04
2000,0.08
3000,0.13
```

The heading names are matched loosely. `force`, `load` and `f` all read as
force; `elongation`, `extension`, `displacement`, `dl` and `stroke` all read as
elongation; a unit in the name (`force_N`, `Elongation (mm)`) is ignored. When
nothing matches, the app asks you to pick the two columns yourself.

Rows whose numbers cannot be read are skipped and counted, so a paused machine
or a blank trailing cell does not spoil the run.

## Specimen dimensions are not in the file

A testing machine records force and movement; it does not know how thick your
specimen was. The gauge length and the cross-section are entered in the app, and
they are what turn force into stress and movement into strain. Getting them
wrong scales every result, so check them first if a number looks impossible.
