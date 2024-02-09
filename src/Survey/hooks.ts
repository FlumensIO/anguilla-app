import { useState, useEffect } from 'react';
import { autorun } from 'mobx';
import { useRouteMatch } from 'react-router';
import Record from 'common/models/record';
import records from 'common/models/records';
import Survey from 'models/survey';
import surveys from 'models/surveys';

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

export const useSurveyConfig = () => {
  const match = useRouteMatch<{ surveyCID: string }>();
  const byCID = (survey: Survey) => survey.cid === match.params.surveyCID;
  return surveys.find(byCID)!;
};
