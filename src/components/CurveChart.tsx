import { Box, Paper, Text } from '@mantine/core'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fmt } from '../lib/format'
import type { Analysis, Point } from '../types'

/* Strain is plotted as a percentage. The underlying ratio is what the physics
   uses, but 24% reads better on an axis than 0.24. */
const pct = (p: Point) => p.strain * 100

const axisStyle = { fill: 'var(--viz-axis)', fontSize: 12 }

const ChartTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) => {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <Paper withBorder shadow="sm" p="xs" radius="sm">
      <Text size="xs">Strain {fmt(pct(point), 3)}%</Text>
      <Text size="xs">Stress {fmt(point.stress)} MPa</Text>
    </Paper>
  )
}

/** A dot on the curve with its name beside it, ringed in the surface colour so
    it stays visible where it sits on top of the line. */
const Marked = ({ point, label, color }: { point: Point; label: string; color: string }) => (
  <ReferenceDot
    x={pct(point)}
    y={point.stress}
    r={5}
    fill={color}
    stroke="var(--viz-surface)"
    strokeWidth={2}
    label={{ value: label, position: 'top', fill: color, fontSize: 12, offset: 10 }}
  />
)

export const CurveChart = ({ analysis }: { analysis: Analysis }) => {
  const { points, yieldPoint, ultimate, fracture } = analysis

  return (
    <Box className="viz">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={points} margin={{ top: 24, right: 24, bottom: 24, left: 8 }}>
          <CartesianGrid stroke="var(--viz-grid)" strokeDasharray="3 3" />

          {/* Everything left of yield is elastic: let go here and the specimen
              springs back. Shading it says that without a paragraph. */}
          {yieldPoint && (
            <ReferenceArea
              x1={0}
              x2={pct(yieldPoint)}
              fill="var(--viz-yield)"
              fillOpacity={0.08}
              strokeOpacity={0}
            />
          )}

          <XAxis
            type="number"
            dataKey={(p: Point) => pct(p)}
            domain={[0, 'dataMax']}
            tick={axisStyle}
            stroke="var(--viz-grid)"
            tickFormatter={(v: number) => fmt(v, 3)}
            label={{ value: 'Strain (%)', position: 'insideBottom', offset: -14, ...axisStyle }}
          />
          <YAxis
            tick={axisStyle}
            stroke="var(--viz-grid)"
            tickFormatter={(v: number) => fmt(v, 3)}
            label={{
              value: 'Stress (MPa)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
              ...axisStyle,
            }}
          />
          <Tooltip content={<ChartTooltip />} />

          <Line
            type="linear"
            dataKey="stress"
            stroke="var(--viz-curve)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />

          {yieldPoint && <Marked point={yieldPoint} label="Yield" color="var(--viz-yield)" />}
          <Marked point={ultimate} label="Ultimate" color="var(--viz-ultimate)" />
          <Marked point={fracture} label="Fracture" color="var(--viz-fracture)" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}
