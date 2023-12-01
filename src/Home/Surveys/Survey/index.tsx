import { observer } from 'mobx-react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/react';
import savedRecords, { bySurvey } from 'common/models/records';
import { Survey as SurveyT } from 'common/surveys';
import RecordsBadge from './RecordsBadge';

type Props = {
  survey: SurveyT;
};

const surveyBasePath = '/survey';

const Survey = ({ survey }: Props) => {
  const createdDate = survey.created_at.split('T')[0];

  const recordsCount = savedRecords.filter(bySurvey(survey.id)) || [];

  return (
    <IonCard routerLink={`${surveyBasePath}/${survey.id}`}>
      <IonCardHeader mode="ios">
        <IonCardTitle className="text-xl">{survey.title}</IonCardTitle>
        <IonCardSubtitle className="max-w-1/2">{createdDate}</IonCardSubtitle>
        <RecordsBadge className="absolute right-3 top-4">
          {recordsCount?.length}
        </RecordsBadge>
      </IonCardHeader>

      <IonCardContent>{survey.description}</IonCardContent>
    </IonCard>
  );
};

export default observer(Survey);
