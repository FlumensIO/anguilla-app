import { Route } from 'react-router';
import { getBlockRoutes } from '@flumens/tailwind/dist/components/Block/utils';
import { IonPage, IonRouterOutlet } from '@ionic/react';
import Home from './Home';
import BlockPage from './Page';
import RecordHome from './Record';
import { useSurveyConfig } from './hooks';

const Renderer = () => {
  const surveyConfig = useSurveyConfig();
  const basePath = '/survey/:surveyCID/record/:recordId/blocks';
  const blockRoutes = getBlockRoutes(basePath, surveyConfig.attrs as any).map(
    (path: string) => (
      <Route key={path} path={path} component={BlockPage} exact />
    )
  );

  return (
    <IonPage>
      <IonRouterOutlet id="surveys">
        <Route
          key="/survey/:surveyCID"
          path="/survey/:surveyCID"
          component={Home}
          exact
        />
        <Route
          key="/survey/:surveyCID/record/:recordId"
          path="/survey/:surveyCID/record/:recordId"
          component={RecordHome}
          exact
        />
        {blockRoutes}
      </IonRouterOutlet>
    </IonPage>
  );
};

export default Renderer;
