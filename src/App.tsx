import { observer } from 'mobx-react';
import { Route, Redirect } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import Home from './Home';
import Survey from './Survey/router';
import User from './User/router';

const HomeRedirect = () => {
  return <Redirect to="home" />;
};

const App = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet id="main">
        <Route exact path="/" component={HomeRedirect} />
        <Route path="/home" component={Home} />
        {User}
        <Route path="/survey/:surveyId" component={Survey} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default observer(App);
