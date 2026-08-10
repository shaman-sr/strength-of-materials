import { ActionIcon, Card, Popover, SimpleGrid, Stack, Text } from '@mantine/core'
import { fmt } from '../lib/format'
import type { Analysis } from '../types'

type Property = {
  name: string
  /** Null means the app could not determine it; the card then shows an em dash. */
  value: number | null
  unit: string
  /** The one-line version, always visible. */
  note: string
  /** What it means and why it matters, behind the question mark. */
  meaning: string
  /** How this app arrived at the number. */
  method: string
}

const properties = (a: Analysis): Property[] => [
  {
    name: 'Young’s modulus',
    value: a.modulus ? a.modulus.value / 1000 : null,
    unit: 'GPa',
    note: 'Stiffness — how steeply the curve rises before anything permanent happens.',
    meaning:
      'How hard the material resists being stretched at all. A stiff material moves very little under load and springs straight back. This is stiffness, not strength: steel is about three times as stiff as aluminium whatever their strengths happen to be, and a stiff material can still be weak.',
    method:
      'A straight line fitted by least squares through the readings between 5% and 40% of the ultimate stress. The lower bound skips the start of the test, where the grips are still taking up slack; the upper bound stops well short of yield.',
  },
  {
    name: 'Yield strength',
    value: a.yieldPoint ? a.yieldPoint.stress : null,
    unit: 'MPa',
    note: 'Where permanent deformation begins. This is the figure to design against.',
    meaning:
      'Below this stress the material springs back when you unload it. Above it, some of the deformation stays. For anything that has to keep its shape, this is the number that matters — not the ultimate strength, which the part reaches only on its way to breaking.',
    method:
      'The 0.2% offset method: take a line of the same slope as the elastic region, shift it 0.002 strain to the right, and read off where the measured curve crosses it. Real curves bend gradually rather than turning a corner, so this construction is the agreed way to name a single point.',
  },
  {
    name: 'Ultimate tensile strength',
    value: a.ultimate.stress,
    unit: 'MPa',
    note: 'The highest stress the specimen carried.',
    meaning:
      'The peak of the curve, and what most people mean when they ask how strong something is. After this point a ductile specimen starts necking — thinning at one spot — and the force it can carry falls even as it keeps stretching.',
    method: 'The largest stress among the readings.',
  },
  {
    name: 'Fracture stress',
    value: a.fracture.stress,
    unit: 'MPa',
    note: 'The stress at the last reading, where the specimen broke.',
    meaning:
      'What the specimen was carrying at the moment it parted. For a ductile material this is lower than the ultimate strength, because the section had already necked down; the load fell while the real stress in the thinned section was still climbing.',
    method: 'The stress at the final reading in the file.',
  },
  {
    name: 'Elongation at break',
    value: a.elongationAtBreak,
    unit: '%',
    note: 'How far it stretched in total. A measure of ductility, not of strength.',
    meaning:
      'How much warning you get. A material that stretches a long way before failing bends and sags visibly first; a brittle one goes without notice. Above about 5% we call it ductile.',
    method: 'The strain at the final reading, written as a percentage.',
  },
]

const Explain = ({ property }: { property: Property }) => (
  <Popover width={320} position="bottom-end" withArrow shadow="md">
    <Popover.Target>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        radius="xl"
        aria-label={`What ${property.name} means`}
      >
        ?
      </ActionIcon>
    </Popover.Target>
    <Popover.Dropdown>
      <Stack gap="xs">
        <Text size="sm">{property.meaning}</Text>
        <Text size="xs" c="dimmed">
          How it was found: {property.method}
        </Text>
      </Stack>
    </Popover.Dropdown>
  </Popover>
)

export const PropertyCards = ({ analysis }: { analysis: Analysis }) => (
  <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="md">
    {properties(analysis).map((p) => (
      <Card key={p.name} withBorder padding="md" radius="md">
        <Stack gap={4} h="100%">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <Text size="sm" c="dimmed">
              {p.name}
            </Text>
            <Explain property={p} />
          </div>
          <Text size="1.6rem" fw={600} lh={1.2}>
            {fmt(p.value)}
            {p.value !== null && (
              <Text span size="sm" c="dimmed" fw={400}>
                {' '}
                {p.unit}
              </Text>
            )}
          </Text>
          <Text size="xs" c="dimmed">
            {p.value === null ? 'Not available for this test — see the note below the chart.' : p.note}
          </Text>
        </Stack>
      </Card>
    ))}
  </SimpleGrid>
)
