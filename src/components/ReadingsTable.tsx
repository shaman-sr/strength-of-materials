import { ScrollArea, Table, Text } from '@mantine/core'
import { fmt } from '../lib/format'
import type { Analysis, Specimen } from '../types'

/* The same data as the chart, in numbers. It is here so a value can be read
   off exactly rather than estimated from a pixel, and so the results are
   reachable without seeing colour at all. */

export const ReadingsTable = ({
  analysis,
  specimen,
}: {
  analysis: Analysis
  specimen: Specimen
}) => (
  <ScrollArea.Autosize mah={420} type="auto">
    <Table stickyHeader highlightOnHover withTableBorder striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Elongation (mm)</Table.Th>
          <Table.Th>Force (N)</Table.Th>
          <Table.Th>Strain (%)</Table.Th>
          <Table.Th>Stress (MPa)</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {analysis.points.map((p, i) => (
          <Table.Tr key={i}>
            <Table.Td>{fmt(p.strain * specimen.gaugeLength)}</Table.Td>
            <Table.Td>{fmt(p.stress * analysis.sectionArea)}</Table.Td>
            <Table.Td>{fmt(p.strain * 100, 3)}</Table.Td>
            <Table.Td>{fmt(p.stress)}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
    <Text size="xs" c="dimmed" mt="xs">
      {analysis.points.length} readings. The first two columns are what you supplied; the last two
      are those same numbers divided by the specimen’s size.
    </Text>
  </ScrollArea.Autosize>
)
