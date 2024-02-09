import { initStoredSamples } from '@flumens';
import Record from './record';
import { modelStore } from './store';

type Collection = Record[] & {
  ready: Promise<any>;
  resetDefaults: any;
};

// eslint-disable-next-line @getify/proper-arrows/name
export const bySurveyId = (id: number | string) => (record: Record) =>
  `${record.metadata.survey_id}` === `${id}`;

const records: Collection = initStoredSamples(modelStore, Record);

export default records;
