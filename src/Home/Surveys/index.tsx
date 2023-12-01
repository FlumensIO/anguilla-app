import { observer } from 'mobx-react';
import { Page, Main } from '@flumens';
import { IonToolbar, IonHeader, IonList, IonTitle } from '@ionic/react';
import surveys, { Survey as SurveyT } from 'common/surveys';
import Survey from './Survey';

const SurveysController = () => {
  const getSurveyListItem = (survey: SurveyT) => (
    <Survey key={survey.id} survey={survey} />
  );

  return (
    <Page id="home">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Surveys</IonTitle>
        </IonToolbar>
      </IonHeader>

      <Main>
        <IonList>{surveys.map(getSurveyListItem)}</IonList>
      </Main>
    </Page>
  );
};

export default observer(SurveysController);
