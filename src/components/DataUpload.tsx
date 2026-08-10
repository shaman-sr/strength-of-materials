import { useState } from 'react'
import { Alert, Anchor, Button, Card, Group, Select, SimpleGrid, Stack, Text } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { EXAMPLES, type Example } from '../data/examples'
import { downloadText } from '../lib/download'
import { parseCsv, toReadings, type Row } from '../lib/parseCsv'
import type { Reading, Specimen } from '../types'

type Props = {
  onReadings: (readings: Reading[], source: string) => void
  onSpecimen: (specimen: Specimen) => void
  /** What is currently loaded, for the line under the drop area. */
  source: string | null
  count: number
}

/** Set when the file parsed but we could not tell which column is which. */
type Pending = { fileName: string; headers: string[]; rows: Row[] }

/** Anything with a comma in it, however the browser labels it. Machine exports
    are often served as plain text or as an Excel type. */
const ACCEPT = {
  'text/csv': ['.csv'],
  'text/plain': ['.csv', '.txt'],
  'application/vnd.ms-excel': ['.csv'],
}

export const DataUpload = ({ onReadings, onSpecimen, source, count }: Props) => {
  const [pending, setPending] = useState<Pending | null>(null)
  const [forceColumn, setForceColumn] = useState<string | null>(null)
  const [elongationColumn, setElongationColumn] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setPending(null)
    setForceColumn(null)
    setElongationColumn(null)
    setError(null)
  }

  /** The one path into the app for a file's contents, whether it was dropped or
      came from an example. An example that needs its columns picked therefore
      asks for them exactly as a dropped file would. */
  const load = (text: string, fileName: string) => {
    reset()
    const outcome = parseCsv(text)
    if (outcome.status === 'error') {
      setError(outcome.message)
      return
    }
    if (outcome.status === 'needs-columns') {
      setPending({ fileName, headers: outcome.headers, rows: outcome.rows })
      return
    }
    onReadings(outcome.readings, fileName)
  }

  const handleDrop = async (files: File[]) => {
    const file = files[0]
    if (file) load(await file.text(), file.name)
  }

  const loadExample = (example: Example) => {
    onSpecimen(example.specimen)
    load(example.csv, example.fileName)
  }

  const confirmColumns = () => {
    if (!pending || !forceColumn || !elongationColumn) return
    onReadings(toReadings(pending.rows, forceColumn, elongationColumn), pending.fileName)
    reset()
  }

  return (
    <Stack gap="md">
      <Dropzone onDrop={handleDrop} accept={ACCEPT} multiple={false} maxSize={20 * 1024 ** 2}>
        <Stack align="center" gap={4} mih={110} justify="center" style={{ pointerEvents: 'none' }}>
          <Text fw={500}>Drop your test data here, or click to choose a file</Text>
          <Text size="sm" c="dimmed" ta="center" maw={520}>
            A comma-separated file with a heading row, one column of force in newtons and one of
            elongation in millimetres.
          </Text>
        </Stack>
      </Dropzone>

      <Text size="sm" c={source ? undefined : 'dimmed'}>
        {source ? `Loaded: ${source} — ${count} readings.` : 'Nothing loaded yet.'}
      </Text>

      {error && (
        <Alert color="red" title="That file could not be read">
          {error}
        </Alert>
      )}

      {pending && (
        <Alert color="blue" title="Which columns should be used?">
          <Stack gap="sm">
            <Text size="sm">
              The headings in {pending.fileName} do not say which column is which, so nothing is
              being guessed. Pick the two that matter and the rest are ignored.
            </Text>
            <SimpleGrid cols={{ base: 1, xs: 2 }}>
              <Select
                label="Force, in newtons"
                placeholder="Choose a column"
                data={pending.headers}
                value={forceColumn}
                onChange={setForceColumn}
              />
              <Select
                label="Elongation, in millimetres"
                placeholder="Choose a column"
                data={pending.headers}
                value={elongationColumn}
                onChange={setElongationColumn}
              />
            </SimpleGrid>
            <Group>
              <Button
                onClick={confirmColumns}
                disabled={!forceColumn || !elongationColumn || forceColumn === elongationColumn}
              >
                Use these columns
              </Button>
              <Button variant="subtle" onClick={reset}>
                Cancel
              </Button>
            </Group>
          </Stack>
        </Alert>
      )}

      <Stack gap="xs">
        <Text size="sm" fw={500}>
          Or try one of these
        </Text>
        <Text size="sm" c="dimmed">
          Four examples, chosen because they behave differently from one another — not because the
          app is limited to them. Each loads its specimen dimensions too. Download any of them to
          see exactly what a file should look like.
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {EXAMPLES.map((example) => (
            <Card key={example.id} withBorder padding="sm" radius="md">
              <Stack gap="xs" justify="space-between" h="100%">
                <Stack gap={2}>
                  <Text fw={500} size="sm">
                    {example.label}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {example.summary}
                  </Text>
                </Stack>
                <Group gap="xs">
                  <Button size="compact-sm" variant="light" onClick={() => loadExample(example)}>
                    Load
                  </Button>
                  <Anchor
                    component="button"
                    type="button"
                    size="xs"
                    onClick={() => downloadText(example.fileName, example.csv)}
                  >
                    Download the file
                  </Anchor>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  )
}
