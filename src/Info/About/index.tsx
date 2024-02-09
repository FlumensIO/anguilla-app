import { Page, Header, Section } from '@flumens';
import Main from 'Components/Main';

const { P } = Section;

const Component = () => (
  <Page id="about">
    <Header title="About" />
    <Main>
      <Section>
        <P>
          The Anguilla National Trust (ANT) was founded in 1989 with the mandate
          to sustain the island’s natural and cultural heritage through active
          management and education for the benefit of today’s and tomorrow’s
          generations.
        </P>

        <P>
          The ANT has remained true to that mandate and, since its formation, we
          have been instrumental in the creation of Anguilla’s national parks,
          conservation areas, and heritage sites and continue to be involved in
          their day-to-day management.
        </P>

        <P>
          We conduct essential research and conservation work, including habitat
          and species monitoring and we work year-round to raise public
          awareness about the fragility, complexity, and beauty of the island’s
          natural and cultural resources.
        </P>

        <P>
          Above all, we act as voice for Anguilla’s national heritage. The ANT
          has been in housed in the Old Customs Building in The Valley since
          1991.
        </P>
      </Section>
    </Main>
  </Page>
);

export default Component;
