import { useContext } from 'react';
import { useRouteMatch } from 'react-router';
import BaseBlock, { BlockContext } from '@flumens/tailwind/dist/components/Block';
import { onChange, getValue, getBlocksFromPath } from '@flumens/tailwind/dist/components/Block/utils';
import type { Props as BlockProps } from '@flumens/tailwind/dist/components/Block';

const Block = ({
  record,
  block: blockConfig,
  isDisabled,
  isWithinPage,
  recordId,
}: BlockProps) => {
  const match = useRouteMatch();
  const { TextInput, geolocation, platform } = useContext(BlockContext);

  if (blockConfig.type !== 'text_input') {
    return (
      <BaseBlock
        block={blockConfig}
        record={record}
        isDisabled={isDisabled}
        isWithinPage={isWithinPage}
        recordId={recordId}
      />
    );
  }

  if (blockConfig.hidden) {
    return null;
  }

  const isPageContainer = blockConfig.container === 'page';
  if (isPageContainer && !isWithinPage) {
    return (
      <BaseBlock
        block={blockConfig}
        record={record}
        isDisabled={isDisabled}
        isWithinPage={isWithinPage}
        recordId={recordId}
      />
    );
  }

  if (!match?.url) {
    return (
      <BaseBlock
        block={blockConfig}
        record={record}
        isDisabled={isDisabled}
        isWithinPage={isWithinPage}
        recordId={recordId}
      />
    );
  }

  const blockIds = getBlocksFromPath(match.url);
  const value = getValue(record, blockIds, blockConfig);

  const updateValue = (newValue: any, eventName = 'change') =>
    onChange(newValue, eventName as any, {
      record,
      blockIds,
      blockConfig,
      geolocation,
    });

  const TextInputComponent = TextInput as any;

  return (
    <TextInputComponent
      value={value}
      label={isPageContainer ? '' : blockConfig.title}
      onChange={updateValue}
      appearance={blockConfig.appearance}
      required={blockConfig.validations?.required}
      isDisabled={isDisabled}
      description={blockConfig.description}
      placeholder={blockConfig.placeholder}
      platform={platform}
      inputType={(blockConfig as any).input_type}
    />
  );
};

export default Block;
