import { Page, Header, Section } from '@flumens';
import config from 'common/config';
import Main from 'Components/Main';

const Component = () => (
  <Page id="about">
    <Header title="About" />
    <Main>
      <Section>
        <div
          dangerouslySetInnerHTML={{ __html: config.appAboutHtml }}
          className="rounded-md bg-white p-3"
        />
      </Section>
    </Main>
  </Page>
);

export default Component;
