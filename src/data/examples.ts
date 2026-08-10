/* The bundled example tests.

   Each one is the real file from `sample_data/`, pulled in as text at build
   time. There is deliberately no second copy of the numbers here: the file the
   user can download is byte for byte the file the app parses, so the example
   also serves as the documentation of the format. */

import stainlessCsv from '../../sample_data/stainless-steel-304.csv?raw'
import aluminiumCsv from '../../sample_data/aluminium-6061-t6.csv?raw'
import castIronCsv from '../../sample_data/grey-cast-iron.csv?raw'
import rawExportCsv from '../../sample_data/machine-export-raw.csv?raw'
import type { Specimen } from '../types'

export type Example = {
  id: string
  label: string
  /** What this one is for — shown beside the button. */
  summary: string
  fileName: string
  csv: string
  specimen: Specimen
}

export const EXAMPLES: Example[] = [
  {
    id: 'stainless',
    label: 'Stainless steel 304',
    summary: 'A very ductile metal: it yields early and then stretches to more than half again its length.',
    fileName: 'stainless-steel-304.csv',
    csv: stainlessCsv,
    specimen: { name: 'Stainless steel 304', gaugeLength: 50, section: { shape: 'circular', diameter: 10 } },
  },
  {
    id: 'aluminium',
    label: 'Aluminium 6061-T6',
    summary: 'Stiff for its weight but much less stiff than steel, and it breaks after far less stretch.',
    fileName: 'aluminium-6061-t6.csv',
    csv: aluminiumCsv,
    specimen: {
      name: 'Aluminium 6061-T6',
      gaugeLength: 50,
      section: { shape: 'circular', diameter: 12.5 },
    },
  },
  {
    id: 'cast-iron',
    label: 'Grey cast iron',
    summary: 'Brittle: it snaps almost without deforming, so there is no yield strength to report.',
    fileName: 'grey-cast-iron.csv',
    csv: castIronCsv,
    specimen: { name: 'Grey cast iron', gaugeLength: 50, section: { shape: 'circular', diameter: 10 } },
  },
  {
    id: 'raw-export',
    label: 'Unlabelled machine export',
    summary: 'Columns called “channel_1” and “channel_2”, plus a paused row. Shows what happens when the app cannot tell which column is which.',
    fileName: 'machine-export-raw.csv',
    csv: rawExportCsv,
    specimen: {
      name: 'Aluminium 6061-T6',
      gaugeLength: 50,
      section: { shape: 'circular', diameter: 12.5 },
    },
  },
]
