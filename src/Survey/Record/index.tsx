import Header from '@flumens/ionic/dist/components/Header';
import Main from '@flumens/ionic/dist/components/Main';
import Page from '@flumens/ionic/dist/components/Page';
import { IonList } from '@ionic/react';
import Survey, { Block as BlockT } from 'common/Survey.d';
import Block from '../Components/Block';
import { useSurveyBlockConfig, useRecord } from '../Components/hooks';
import PrimaryHeaderButton from './PrimaryHeaderButton';

const RecordHome = () => {
  const surveyConfig = useSurveyBlockConfig();
  const record = useRecord();
  if (!record) return null;

  const { title } = surveyConfig as Survey;

  const onFinish = () => {
    console.log('Finished', record);
  };

  const finishButton = (
    <PrimaryHeaderButton record={record} onClick={onFinish} />
  );

  const surveyBlocks = (surveyConfig as Survey).blocks;

  const blocks: any = [];
  let roundedGroup: null | any[] = null;
  const processBlockElement = (block: BlockT, index: number) => {
    const blockItem = <Block key={block.id} block={block} />;

    if (index === 0 && block.type !== 'group') {
      roundedGroup = [blockItem];
      return;
    }

    if (block.type === 'group' && roundedGroup) {
      blocks.push(
        <IonList key={block.id + index}>
          <div className="rounded">{roundedGroup}</div>
        </IonList>
      );
      roundedGroup = null;
      blocks.push(blockItem);
      return;
    }

    if (!roundedGroup) roundedGroup = [];
    roundedGroup.push(blockItem);

    if (surveyBlocks.length === index + 1 && block.type !== 'group') {
      blocks.push(
        <IonList key={block.id + index}>
          <div className="rounded">{roundedGroup}</div>
        </IonList>
      );
    }
  };

  surveyBlocks.forEach(processBlockElement);

  return (
    <Page id="record-home">
      <Header title={title} rightSlot={finishButton} />
      <Main>{blocks}</Main>
    </Page>
  );
};

export default RecordHome;
