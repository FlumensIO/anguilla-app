import { useRouteMatch } from 'react-router';
import { Header, Page } from '@flumens';
import { Block as BlockT } from '@flumens/tailwind/dist/Survey';
import Block from '@flumens/tailwind/dist/components/Block';
import { getBlockConfigFromPath } from '@flumens/tailwind/dist/components/Block/utils';
import Main from 'Components/Main';
import BlocksWithRoundedGroups from './Components/BlocksWithRoundedGroups';
import { useRecord, useSurveyConfig } from './hooks';

const SurveyPage = () => {
  const surveyConfig = useSurveyConfig();
  const match = useRouteMatch<{ surveyCID: string }>();
  const record = useRecord();

  const blockConfig = getBlockConfigFromPath(
    surveyConfig.attrs.blocks,
    match.url,
    match.params
  ) as BlockT;
  const isNestedBlocks = blockConfig.type === 'group' && blockConfig.blocks;

  const blocks = isNestedBlocks ? (
    <BlocksWithRoundedGroups
      surveyBlocks={blockConfig.blocks}
      record={record?.attrs}
      recordId={record?.cid}
      isDisabled={record?.isUploaded()}
    />
  ) : (
    <Block
      block={blockConfig}
      isWithinPage
      record={record?.attrs}
      recordId={record?.cid}
      isDisabled={record?.isUploaded()}
    />
  );

  const isGeometry = blockConfig.type === 'geometry_input';

  return (
    <Page id={`block-${blockConfig.id}`}>
      <Header title={blockConfig.title} />
      <Main skipPadding={isGeometry}>{blocks}</Main>
    </Page>
  );
};

export default SurveyPage;
