import { useContext, useEffect } from 'react';
import { useRouteMatch } from 'react-router';
import { NavContext, IonPage } from '@ionic/react';
import surveys, { Survey } from 'common/surveys';
import Record from 'models/record';
import records from 'models/records';

const createNewSurvey = (surveyConfig: Survey) => {
  return new Record({ metadata: { survey: surveyConfig.id } });
};

const StartNewSurvey = () => {
  const context = useContext(NavContext);
  const match = useRouteMatch<{ surveyId: string }>();

  const createSampleWrap = () => {
    const createSample = async () => {
      const byId = (survey: Survey) => survey.id === match.params.surveyId;
      const surveyConfig = surveys.find(byId)!;
      const model = await createNewSurvey(surveyConfig);
      await model.save();
      records.push(model);
      context.navigate(`${match.url}/${model.cid}`, 'none', 'replace');
    };

    createSample();
  };
  useEffect(createSampleWrap, []);

  return <IonPage id="start-new-survey" />;
};

export default StartNewSurvey;
