import { useMemo, useState } from 'react'
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Tabs,
  Title,
  Text,
  useMantineColorScheme,
} from '@mantine/core'
import { CurveChart } from './components/CurveChart'
import { DataUpload } from './components/DataUpload'
import { Explainer, ExplainerHeading } from './components/Explainer'
import { PropertyCards } from './components/PropertyCards'
import { ReadingsTable } from './components/ReadingsTable'
import { Summary } from './components/Summary'
import { SpecimenForm } from './components/SpecimenForm'
import { analyze } from './lib/analysis'
import type { Reading, Specimen } from './types'

const BLANK: Specimen = {
  name: '',
  gaugeLength: 50,
  section: { shape: 'circular', diameter: 10 },
}

const ThemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  return (
    <ActionIcon
      variant="default"
      size="lg"
      onClick={toggleColorScheme}
      aria-label="Switch between the light and dark theme"
    >
      {colorScheme === 'dark' ? '☀' : '☾'}
    </ActionIcon>
  )
}

/** A numbered panel, so the order to do things in is visible rather than
    implied by scrolling. */
const Step = ({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) => (
  <Paper withBorder radius="md" p="lg">
    <Stack gap="lg">
      <Group gap="sm">
        <Badge size="lg" circle variant="light">
          {number}
        </Badge>
        <Title order={2} size="h4">
          {title}
        </Title>
      </Group>
      {children}
    </Stack>
  </Paper>
)

export default function App() {
  const [specimen, setSpecimen] = useState<Specimen>(BLANK)
  const [readings, setReadings] = useState<Reading[]>([])
  const [source, setSource] = useState<string | null>(null)

  const analysis = useMemo(() => analyze(readings, specimen), [readings, specimen])

  const clear = () => {
    setSpecimen(BLANK)
    setReadings([])
    setSource(null)
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4}>
            <Title order={1}>Material test analyzer</Title>
            <Text c="dimmed" maw={660}>
              Give it the force and elongation readings from a tensile test and it works out how
              stiff, how strong and how ductile the material is — then draws the stress–strain
              curve those numbers came from.
            </Text>
            <Text size="sm" c="dimmed" maw={660}>
              <b>Any material, any specimen.</b> Nothing here is tuned to steel or to metals: the
              same arithmetic turns force into stress and stretch into strain whatever was pulled,
              so a polymer, a composite, a ceramic or a piece of timber goes in exactly the same
              way. All the app needs from you is the specimen’s cross-sectional area and the gauge
              length the stretch was measured over.
            </Text>
          </Stack>
          <ThemeToggle />
        </Group>

        <Stack gap="sm">
          <ExplainerHeading />
          <Explainer />
        </Stack>

        <Step number={1} title="Describe the specimen">
          <SpecimenForm specimen={specimen} onChange={setSpecimen} />
        </Step>

        <Step number={2} title="Load the measurements">
          <DataUpload
            onReadings={(next, name) => {
              setReadings(next)
              setSource(name)
            }}
            onSpecimen={setSpecimen}
            source={source}
            count={readings.length}
          />
        </Step>

        {analysis ? (
          <Step number={3} title="Read the results">
            <Stack gap="xl">
              <PropertyCards analysis={analysis} />

              <Tabs defaultValue="curve" variant="outline">
                <Tabs.List>
                  <Tabs.Tab value="curve">The curve</Tabs.Tab>
                  <Tabs.Tab value="readings">Every reading</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="curve" pt="md">
                  <Stack gap="md">
                    <Text size="sm" c="dimmed">
                      Force divided by the original area, against stretch divided by the original
                      length. The shaded part at the left is the elastic region, where the specimen
                      would spring back if the load were removed. Hover anywhere on the curve to
                      read off a value.
                    </Text>
                    <CurveChart analysis={analysis} />
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="readings" pt="md">
                  <ReadingsTable analysis={analysis} specimen={specimen} />
                </Tabs.Panel>
              </Tabs>

              <Summary analysis={analysis} />

              <Group>
                <Button variant="default" onClick={clear}>
                  Start again
                </Button>
              </Group>
            </Stack>
          </Step>
        ) : (
          readings.length > 0 && (
            <Alert color="yellow" title="Not enough to work with yet">
              Check that the gauge length and the cross-section are filled in above, and that the
              file holds at least two readable rows.
            </Alert>
          )
        )}
      </Stack>
    </Container>
  )
}
