import { Alert, Stack, Text } from '@mantine/core'
import { fmt } from '../lib/format'
import type { Analysis } from '../types'

const behaviourText = (a: Analysis): string =>
  a.behaviour === 'ductile'
    ? `The specimen stretched ${fmt(a.elongationAtBreak, 3)}% before it broke, so it is behaving ductilely: it deformed a long way, and visibly, before failing.`
    : `The specimen broke after stretching only ${fmt(a.elongationAtBreak, 3)}%, so it is behaving brittlely: it failed with little warning and little deformation.`

const strengthText = (a: Analysis): string => {
  const parts = [`It carried ${fmt(a.ultimate.stress)} MPa at its strongest`]
  if (a.yieldPoint) {
    parts.push(
      `but began deforming permanently at ${fmt(a.yieldPoint.stress)} MPa — that lower figure is the one to design against`,
    )
  }
  return `${parts.join(', ')}.`
}

export const Summary = ({ analysis }: { analysis: Analysis }) => (
  <Stack gap="sm">
    <Text>
      {behaviourText(analysis)} {strengthText(analysis)}
    </Text>
    {analysis.warnings.map((warning) => (
      <Alert key={warning} color="yellow" variant="light" title="Worth knowing">
        {warning}
      </Alert>
    ))}
  </Stack>
)
