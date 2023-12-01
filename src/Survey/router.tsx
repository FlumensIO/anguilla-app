import { Route } from 'react-router';
import { IonPage, IonRouterOutlet } from '@ionic/react';
import { Block } from 'common/Survey.d';
import { Survey } from 'common/surveys';
import BlockPage from './Components/Block/Page';
import { useSurveyBlockConfig } from './Components/hooks';
import Home from './Home';
import RecordHome from './Record';
import StartNewRecord from './StartNewRecord';

const exists = (obj: any) => !!obj;

const getBlockRoute =
  (basePath: string) =>
  // eslint-disable-next-line @getify/proper-arrows/name
  (block: Block) => {
    const normalizedBlockId = encodeURIComponent(block.id);
    let path = `${basePath}/${normalizedBlockId}`;
    const routes: any = [];

    if (block.container === 'page') {
      if (block.type === 'group' && block.repeated) {
        path = `${basePath}/${normalizedBlockId}\\(:${normalizedBlockId}\\)`;
      }

      routes.push(<Route key={path} path={path} component={BlockPage} exact />);
    }

    if (block.type === 'group' && block.blocks) {
      const nestedRoutes = block.blocks
        .flatMap(getBlockRoute(path))
        .filter(exists);
      routes.push(...nestedRoutes);
    }

    return routes;
  };

const getBlockRoutes = (surveyConfig: Survey) => {
  const basePath = '/survey/:surveyId/record/:recordId/blocks';
  const blockRoutes = surveyConfig?.blocks
    .flatMap(getBlockRoute(basePath))
    .filter(exists);

  return blockRoutes;
};

const Renderer = () => {
  const surveyConfig = useSurveyBlockConfig();
  const blockRoutes = getBlockRoutes(surveyConfig as any);

  return (
    <IonPage>
      <IonRouterOutlet id="surveys">
        <Route
          key="/survey/:surveyId"
          path="/survey/:surveyId"
          component={Home}
          exact
        />
        <Route
          key="/survey/:surveyId/record"
          path="/survey/:surveyId/record"
          component={StartNewRecord}
          exact
        />
        <Route
          key="/survey/:surveyId/record/:recordId"
          path="/survey/:surveyId/record/:recordId"
          component={RecordHome}
          exact
        />
        {blockRoutes}
      </IonRouterOutlet>
    </IonPage>
  );
};

export default Renderer;
