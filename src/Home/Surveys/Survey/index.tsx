/* eslint-disable @getify/proper-arrows/name */
import { observer } from 'mobx-react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/react';
import records, { bySurveyId } from 'common/models/records';
import SurveyT from 'models/survey';
import RecordsBadge from './RecordsBadge';

type Props = {
  survey: SurveyT;
};

// https://stackoverflow.com/a/16348977/4460992
const stringToColour = (str: string) => {
  let hash = 0;
  str.split('').forEach(char => {
    // eslint-disable-next-line no-bitwise
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    // eslint-disable-next-line no-bitwise
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, '0');
  }
  return colour;
};

const surveyBasePath = '/survey';

const Survey = ({ survey }: Props) => {
  const createdDate = survey.attrs.created_at.split('T')[0];

  const recordsCount = records.filter(bySurveyId(survey.id)) || [];

  const getTag = (tag: string) => (
    <span
      key={tag}
      className="mb-2 ml-3 inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200"
    >
      <svg
        className="h-2 w-2"
        style={{ fill: stringToColour(tag) }}
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        <circle cx={3} cy={3} r={3} />
      </svg>
      {tag}
    </span>
  );
  const tags = survey.attrs.tags?.map(getTag);

  return (
    <IonCard
      routerLink={`${surveyBasePath}/${survey.cid}`}
      routerDirection="none"
      mode="ios"
    >
      <IonCardHeader mode="ios">
        <IonCardTitle className="text-xl">{survey.attrs.title}</IonCardTitle>
        <IonCardSubtitle className="max-w-1/2">{createdDate}</IonCardSubtitle>
        <RecordsBadge className="absolute right-3 top-4">
          {recordsCount?.length}
        </RecordsBadge>
      </IonCardHeader>

      {!!survey.attrs.description && (
        <IonCardContent>{survey.attrs.description}</IonCardContent>
      )}

      {tags}
    </IonCard>
  );
};

export default observer(Survey);
