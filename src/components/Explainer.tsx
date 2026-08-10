import { Accordion, Code, List, Stack, Table, Text, Title } from '@mantine/core'

/* Everything a first-time user needs to know, folded away so it never gets in
   the way of someone who already knows it. Plain sentences, no symbols the
   reader has to decode. */

const Formula = ({ children }: { children: React.ReactNode }) => (
  <Code block style={{ fontSize: '0.95rem' }}>
    {children}
  </Code>
)

export const Explainer = () => (
  <Accordion variant="separated" radius="md" multiple>
    <Accordion.Item value="what">
      <Accordion.Control>
        <Text fw={500}>What a tensile test is, and what this app does with it</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          <Text>
            A tensile test pulls a specimen apart in a machine that records two things as it goes:
            the force it is applying, and how much the specimen has stretched. That is all the raw
            data amounts to — a long list of force-and-stretch pairs.
          </Text>
          <Text>
            Those raw numbers cannot be compared between specimens. A thick bar holds more force
            than a thin one made of exactly the same material, and a long bar stretches further.
            So the first thing the app does is divide the size out:
          </Text>
          <Formula>{`stress  =  force ÷ original cross-sectional area
strain  =  elongation ÷ original gauge length`}</Formula>
          <Text>
            Stress is force spread over the area carrying it, in megapascals. Strain is stretch as
            a fraction of the length it was measured over, so 0.01 means the specimen is 1% longer.
            Plot one against the other and you have a stress–strain curve, which describes the
            material rather than the particular bar that was tested.
          </Text>
          <Text>
            Everything after that is reading properties off the curve — which is the rest of this
            page.
          </Text>
          <Text>
            None of this is specific to one material. Dividing force by area and stretch by length
            is the same operation whether the specimen was steel, nylon, carbon-fibre laminate,
            concrete or bone, and the properties come off the curve the same way. What differs
            between materials is the <i>shape</i> of the curve, which is exactly what you are
            looking at the chart to find out.
          </Text>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>

    <Accordion.Item value="curve">
      <Accordion.Control>
        <Text fw={500}>How to read the curve</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          <Text>
            A ductile material — most metals, many polymers — goes through four stages, left to
            right:
          </Text>
          <List spacing="sm" size="sm">
            <List.Item>
              <b>The elastic region</b> — the straight rise at the start, shaded on the chart. Let
              go anywhere in here and the specimen springs back to the length it started at. How
              steep this part is <i>is</i> Young’s modulus.
            </List.Item>
            <List.Item>
              <b>Yield</b> — where the line stops being straight. Past this point some of the
              stretch is permanent: unload it and the specimen stays longer than it was.
            </List.Item>
            <List.Item>
              <b>Work hardening</b> — the long climb after yield. Deforming the metal makes it
              harder to deform further, so it keeps taking more stress even while it is being
              permanently stretched.
            </List.Item>
            <List.Item>
              <b>Necking and fracture</b> — at the peak, deformation stops spreading along the
              specimen and concentrates in one spot, which thins rapidly. Because stress here is
              still calculated against the <i>original</i> area, the curve falls even though the
              material at the neck is being worked harder than ever. Then it breaks.
            </List.Item>
          </List>
          <Text size="sm" c="dimmed">
            A brittle material — cast iron, glass, most ceramics, unreinforced concrete — has
            almost none of this. It goes up the straight part and snaps, so there is no yield point
            to find and nothing to report as one. Materials that are neither, such as a polymer
            that draws and then stiffens again, plot whatever shape they plot; the app reads the
            curve it is given rather than assuming one.
          </Text>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>

    <Accordion.Item value="strength">
      <Accordion.Control>
        <Text fw={500}>Why there is no single number called “strength”</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          <Text>
            “How strong is it?” has at least three answers, and they are used for different things.
          </Text>
          <Table withTableBorder verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>You want to know</Table.Th>
                <Table.Th>The property</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Will the part keep its shape in service?</Table.Td>
                <Table.Td>Yield strength</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>What load will finally break it?</Table.Td>
                <Table.Td>Ultimate tensile strength</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>How much will it flex under load?</Table.Td>
                <Table.Td>Young’s modulus</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Will it bend visibly first, or fail without warning?</Table.Td>
                <Table.Td>Elongation at break</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
          <Text>
            The distinction that catches people out most often is <b>strength against stiffness</b>.
            Stiffness is how much it moves under load; strength is how much load it survives. They
            are independent. A steel spring and a steel beam share a modulus; a fibreglass rod can
            be strong and still whippy.
          </Text>
          <Text size="sm" c="dimmed">
            Note that yield strength is lower than ultimate strength, and it is the lower number
            you design to. Reaching the ultimate strength means the part is already on its way to
            breaking.
          </Text>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>

    <Accordion.Item value="file">
      <Accordion.Control>
        <Text fw={500}>The file to give it</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          <Text>
            A comma-separated file with a heading row, one column of force in <b>newtons</b> and
            one of elongation in <b>millimetres</b>:
          </Text>
          <Formula>{`force,elongation
0,0
1000,0.04
2000,0.08
3000,0.13`}</Formula>
          <Text size="sm">
            Headings are matched loosely: <Code>force</Code>, <Code>load</Code> and <Code>f</Code>{' '}
            all read as force, and <Code>elongation</Code>, <Code>extension</Code>,{' '}
            <Code>displacement</Code>, <Code>dl</Code> and <Code>stroke</Code> all read as
            elongation. A unit in the heading is ignored, so <Code>Force (N)</Code> is fine. Extra
            columns are ignored. When nothing matches, the app asks you which two to use rather
            than guessing.
          </Text>
          <Text size="sm">
            Rows whose numbers cannot be read — a paused machine, a blank trailing cell — are
            skipped and counted, and the count is reported with the results.
          </Text>
          <Text size="sm" c="dimmed">
            Your file is read in the browser. Nothing is uploaded anywhere.
          </Text>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>

    <Accordion.Item value="limits">
      <Accordion.Control>
        <Text fw={500}>What these numbers do not tell you</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          <Text size="sm">
            <b>These are engineering stress and strain.</b> Both are measured against the
            specimen’s original size, even once it has visibly thinned. True stress, measured
            against the shrinking area, keeps rising to the moment of fracture. The two agree
            closely up to yield and part company after it, so the modulus and yield figures are
            unaffected while the ultimate and fracture figures are the conventional engineering
            ones — which is what handbooks quote.
          </Text>
          <Text size="sm">
            <b>One test is one specimen.</b> Material properties scatter, and a single pull tells
            you about the bar that was pulled.
          </Text>
          <Text size="sm">
            <b>This is a static pull at room temperature.</b> It says nothing about fatigue under
            repeated loading, about creep under sustained load, about behaviour when cold, or about
            what a notch or a hole does to the stress around it.
          </Text>
          <Text size="sm">
            Results are nominal. Apply your own stress concentration, fatigue and code factors
            before committing to a size.
          </Text>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  </Accordion>
)

export const ExplainerHeading = () => (
  <Title order={2} size="h4">
    If any of this is unfamiliar
  </Title>
)
