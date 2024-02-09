import { Block as BlockT } from '@flumens/tailwind/dist/Survey';
import Block from '@flumens/tailwind/dist/components/Block';
import { IonList } from '@ionic/react';

type Props = {
  surveyBlocks: BlockT[];
  record: any;
  recordId: any;
  isDisabled: any;
};

const BlocksWithRoundedGroups = ({ surveyBlocks, ...props }: Props) => {
  const blocks: any = [];
  let blockGroup: null | any[] = null;

  const processBlockElement = (block: BlockT, index: number) => {
    const blockItem = <Block key={block.id} block={block} {...props} />;

    if (index === 0 && block.type !== 'group') {
      blockGroup = [blockItem];
      return;
    }

    if (block.type === 'group' && blockGroup) {
      blocks.push(
        <IonList key={block.id + index} className="content-group">
          {blockGroup}
        </IonList>
      );
      blockGroup = null;
      blocks.push(blockItem);
      return;
    }

    if (!blockGroup) blockGroup = [];
    blockGroup.push(blockItem);

    if (surveyBlocks.length === index + 1 && block.type !== 'group') {
      blocks.push(
        <IonList key={block.id + index} className="content-group">
          {blockGroup}
        </IonList>
      );
    }
  };

  surveyBlocks.forEach(processBlockElement);
  return blocks;
};

export default BlocksWithRoundedGroups;
