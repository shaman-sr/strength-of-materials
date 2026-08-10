import { Group, NumberInput, SegmentedControl, Stack, Text, TextInput } from '@mantine/core'
import { area } from '../lib/analysis'
import { fmt } from '../lib/format'
import type { Specimen } from '../types'

type Props = {
  specimen: Specimen
  onChange: (specimen: Specimen) => void
}

/** A NumberInput's value is `number | string`, since a half-typed field is text.
    Anything not yet a number becomes NaN, which the analysis treats as missing. */
const num = (value: number | string): number => (typeof value === 'number' ? value : NaN)

export const SpecimenForm = ({ specimen, onChange }: Props) => {
  const { section } = specimen

  const sectionArea = area(section)

  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        The testing machine records force and movement; it has no idea how big your specimen was.
        These two measurements are what turn those readings into stress and strain, so an error
        here scales every result.
      </Text>

      <Group grow align="flex-start">
        <TextInput
          label="Material name"
          description="A label for your own reference — it changes no calculation"
          placeholder="Anything: a metal, a polymer, a composite…"
          value={specimen.name}
          onChange={(e) => onChange({ ...specimen, name: e.currentTarget.value })}
        />
        <NumberInput
          label="Original gauge length"
          description="The marked length the stretching is measured over"
          suffix=" mm"
          min={0}
          value={specimen.gaugeLength}
          onChange={(v) => onChange({ ...specimen, gaugeLength: num(v) })}
        />
      </Group>

      <Stack gap={4}>
        <Text size="sm" fw={500}>
          Cross-section
        </Text>
        <Text size="xs" c="dimmed">
          The first two shapes just save you the arithmetic. For a tube, a hexagon, a moulded
          dogbone or anything else, choose the third and type the area straight in.
        </Text>
        <SegmentedControl
          value={section.shape}
          onChange={(shape) =>
            onChange({
              ...specimen,
              section:
                shape === 'circular'
                  ? { shape: 'circular', diameter: 10 }
                  : shape === 'rectangular'
                    ? { shape: 'rectangular', width: 12.5, thickness: 3 }
                    : { shape: 'area', area: sectionArea },
            })
          }
          data={[
            { value: 'circular', label: 'Round' },
            { value: 'rectangular', label: 'Rectangular' },
            { value: 'area', label: 'Any shape' },
          ]}
        />
      </Stack>

      {section.shape === 'area' ? (
        <NumberInput
          label="Cross-sectional area"
          description="Measured or looked up, for whatever shape your specimen is"
          suffix=" mm²"
          min={0}
          value={section.area}
          onChange={(v) => onChange({ ...specimen, section: { shape: 'area', area: num(v) } })}
        />
      ) : section.shape === 'circular' ? (
        <NumberInput
          label="Diameter"
          suffix=" mm"
          min={0}
          value={section.diameter}
          onChange={(v) => onChange({ ...specimen, section: { ...section, diameter: num(v) } })}
        />
      ) : (
        <Group grow align="flex-start">
          <NumberInput
            label="Width"
            suffix=" mm"
            min={0}
            value={section.width}
            onChange={(v) => onChange({ ...specimen, section: { ...section, width: num(v) } })}
          />
          <NumberInput
            label="Thickness"
            suffix=" mm"
            min={0}
            value={section.thickness}
            onChange={(v) => onChange({ ...specimen, section: { ...section, thickness: num(v) } })}
          />
        </Group>
      )}

      <Text size="sm" c="dimmed">
        Cross-sectional area:{' '}
        <Text span fw={500} c="var(--mantine-color-text)">
          {fmt(sectionArea)} mm²
        </Text>
        {section.shape === 'circular'
          ? ' — a quarter of pi times the diameter squared.'
          : section.shape === 'rectangular'
            ? ' — width times thickness.'
            : ' — as you entered it.'}{' '}
        Every force in your file is divided by this to get stress.
      </Text>
    </Stack>
  )
}
