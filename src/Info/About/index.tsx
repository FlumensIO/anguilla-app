import { Page, Header, Section } from '@flumens';
import Main from 'Components/Main';
import config from 'common/config';

const { P } = Section;

const Component = () => (
  <Page id="about">
    <Header title="About" />
    <Main>
      <Section>
      <div dangerouslySetInnerHTML={{__html: config.appAboutHtml}}></div>
      </Section>
    </Main>
  </Page>
);

export default Component;
