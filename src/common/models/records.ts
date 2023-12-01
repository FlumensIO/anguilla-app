import { initStoredSamples } from '@flumens';
import Record from './record';
import { modelStore } from './store';

type Collection = Record[] & {
  ready: Promise<any>;
  resetDefaults: any;
};

// eslint-disable-next-line @getify/proper-arrows/name
export const bySurvey = (id: number | string) => (record: Record) =>
  `${record.metadata.survey}` === `${id}`;

const savedRecords: Collection = initStoredSamples(modelStore, Record);

export default savedRecords;
