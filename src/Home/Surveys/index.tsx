/* eslint-disable @getify/proper-arrows/name */

/* eslint-disable no-param-reassign */
import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { chevronDownOutline } from 'ionicons/icons';
import {
  Page,
  device,
  useToast,
  useLoader,
  InfoBackgroundMessage,
} from '@flumens';
import {
  IonToolbar,
  IonHeader,
  IonList,
  IonTitle,
  IonRefresherContent,
  IonRefresher,
  NavContext,
  IonButton,
  IonButtons,
} from '@ionic/react';
import Survey from 'models/survey';
import surveys, { syncSurveys, getLatestSurveys } from 'models/surveys';
import userModel from 'models/user';
import Main from 'Components/Main';
import SurveyItem from './Survey';

const byCreateTime = (s1: Survey, s2: Survey) =>
  new Date(s2.attrs.created_at).getTime() -
  new Date(s1.attrs.created_at).getTime();

const SurveysController = () => {
  const toast = useToast();
  const loader = useLoader();
  const navigate = useContext(NavContext);

  const getSurveyListItem = (survey: Survey) => (
    <SurveyItem key={survey.cid} survey={survey} />
  );

  const syncSurveysOnPull = (e: any) => {
    e?.detail?.complete?.(); // spinner is shown elsewhere

    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    if (!userModel.isLoggedIn()) {
      navigate.navigate('/user/login');
      return;
    }

    (async () => {
      loader.show('Syncing surveys...');
      try {
        await syncSurveys();
        toast.success('Your list of surveys has been updated.');
      } catch (error: any) {
        toast.error(error);
      }
      loader.hide();
    })();
  };

  const fetchSurveysFirstTime = () => {
    if (surveys.length || surveys.isFetching || !userModel.isLoggedIn()) return;

    (async () => {
      loader.show('Syncing surveys...');
      try {
        await syncSurveys();
        toast.success('Your list of surveys is ready.');
      } catch (error: any) {
        toast.error(error);
      }
      loader.hide();
    })();
  };
  useEffect(fetchSurveysFirstTime, [userModel.attrs.email]);

  const getSurveyItems = () => {
    if (!surveys.length)
      return (
        <InfoBackgroundMessage>
          You currently don't have any surveys. Pull down the list to refresh
          it.
        </InfoBackgroundMessage>
      );

    return (
      <IonList>
        {getLatestSurveys().sort(byCreateTime).map(getSurveyListItem)}
      </IonList>
    );
  };

  return (
    <Page id="home">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Surveys</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={syncSurveysOnPull}>Refresh</IonButton>
          </IonButtons>
        </IonToolbar>

        {!device.isOnline && (
          <IonToolbar color="medium" className="h-5 [--min-height:20px]">
            <IonTitle className="h-5 text-sm font-medium">Offline</IonTitle>
          </IonToolbar>
        )}
      </IonHeader>

      <Main>
        <IonRefresher
          slot="fixed"
          onIonRefresh={syncSurveysOnPull}
          className="z-10"
        >
          <IonRefresherContent pullingIcon={chevronDownOutline} />
        </IonRefresher>
        {getSurveyItems()}
      </Main>
    </Page>
  );
};

export default observer(SurveysController);
