import { useState, useEffect } from 'react';
import { autorun } from 'mobx';
import { useRouteMatch } from 'react-router';
import Survey, { Block } from 'common/Survey.d';
import Record from 'common/models/record';
import records from 'common/models/records';
import surveys from 'common/surveys';

export const useRecord = () => {
  const [record, setRecord] = useState<Record>();
  const match = useRouteMatch<{ recordId: string }>();

  const autoSetRecord = () => {
    const autoSetRecordWrap = () => {
      const byId = (rec: Record) => rec.cid === match.params.recordId;
      const foundRecord = records.find(byId);
      setRecord(foundRecord);
    };
    autorun(autoSetRecordWrap);
  };
  useEffect(autoSetRecord, [records.length]);

  return record;
};

export const getBlocksFromURL = (url: string) => {
  return (url.split('blocks/')[1]?.split('/') || []).map(decodeURIComponent);
};

export const useSurveyBlockConfig = () => {
  const match = useRouteMatch<{ surveyId: string; block1Id?: string }>();

  const byId = (survey: Survey) => survey.id === match.params.surveyId;
  const surveyConfig = surveys.find(byId)!;

  const invertedParams = Object.fromEntries(
    // eslint-disable-next-line @getify/proper-arrows/name
    Object.entries(match.params).map(([key, value]) => [value, key])
  );
  const getBlockIdIfRepeated = (id: string) => {
    const normalizedId = id.includes('(') ? id.split('(')[0] : id;
    return invertedParams[normalizedId] || normalizedId;
  };

  const blockIds = getBlocksFromURL(match.url).map(getBlockIdIfRepeated);
  if (blockIds?.length) {
    const getBlockConfig = (blockConfigs: Block[], index: number): Block => {
      const blockId = blockIds[index];
      const byBlockId = (block: Block) => block.id === blockId;
      const blockConfig: any = blockConfigs.find(byBlockId)!;
      if (!blockConfig?.blocks || index + 1 >= blockIds.length)
        return blockConfig;

      return getBlockConfig((blockConfig as any)?.blocks as any, index + 1);
    };

    return getBlockConfig(surveyConfig.blocks, 0);
  }

  return surveyConfig;
};
