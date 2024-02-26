import { useEffect } from 'react';
import { observer } from 'mobx-react';
import { Route, Redirect } from 'react-router-dom';
import { useToast } from '@flumens';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import CONFIG from 'common/config';
import appModel from 'common/models/app';
import BlockContext from 'Survey/BlockContext';
import Home from './Home';
import Info from './Info/router';
import Survey from './Survey/router';
import User from './User/router';

const HomeRedirect = () => {
  return <Redirect to="home" />;
};

const useOfflineMessage = () => {
  const toast = useToast();

  const showOfflineReadyMessage = () => {
    const showMessage = (r: ServiceWorkerRegistration): void => {
      if (r.active?.state !== 'activating') return;

      toast({
        message: `The app v${CONFIG.version} (${CONFIG.build}) is ready for offline use.`,
      });

      appModel.attrs.offlineVersion = CONFIG.build;
    };
    navigator.serviceWorker.ready.then(showMessage);
  };
  useEffect(showOfflineReadyMessage, []);
};

const App = () => {
  useOfflineMessage();

  return (
    <IonApp>
      <IonReactRouter>
        <BlockContext>
          <IonRouterOutlet id="main">
            <Route exact path="/" component={HomeRedirect} />
            <Route path="/home" component={Home} />
            {User}
            {Info}
            <Route path="/survey/:surveyCID" component={Survey} />
          </IonRouterOutlet>
        </BlockContext>
      </IonReactRouter>
    </IonApp>
  );
};

export default observer(App);
