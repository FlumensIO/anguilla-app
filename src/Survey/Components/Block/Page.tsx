import { Main, Header, Page } from '@flumens';
import { IonList } from '@ionic/react';
import { Block as BlockT } from 'common/Survey.d';
import Block from '.';
import { useSurveyBlockConfig } from '../hooks';

const SurveyPage = () => {
  const blockConfig = useSurveyBlockConfig() as BlockT;
  const isNestedBlocks = blockConfig.type === 'group' && blockConfig.blocks;

  const getBlockElement = (block: BlockT) => (
    <Block key={block.id} block={block} />
  );
  const blocks = isNestedBlocks ? (
    <IonList>
      <div className="rounded">{blockConfig.blocks.map(getBlockElement)}</div>
    </IonList>
  ) : (
    <Block block={blockConfig} />
  );

  return (
    <Page id={`block-${blockConfig.id}`}>
      <Header title={blockConfig.title} />
      <Main>{blocks}</Main>
    </Page>
  );
};

export default SurveyPage;
