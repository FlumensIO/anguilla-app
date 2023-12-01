import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { add, addOutline } from 'ionicons/icons';
import { useRouteMatch, useLocation } from 'react-router';
import {
  Header,
  InfoBackgroundMessage,
  Main,
  Page,
  date as DateHelp,
} from '@flumens';
import {
  IonBadge,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItemDivider,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
} from '@ionic/react';
import Record from 'models/record';
import records, { bySurvey } from 'models/records';
import { useSurveyBlockConfig } from 'Survey/Components/hooks';
import Survey from './Survey';
import VirtualList from './VirtualList';
import './styles.scss';

// https://stackoverflow.com/questions/47112393/getting-the-iphone-x-safe-area-using-javascript
const rawSafeAreaTop =
  getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
const SAFE_AREA_TOP = parseInt(rawSafeAreaTop.replace('px', ''), 10);
const LIST_PADDING = 10 + SAFE_AREA_TOP;
const LIST_ITEM_HEIGHT = 75 + 10; // 10px for padding
const LIST_ITEM_DIVIDER_HEIGHT = 38;

function roundDate(date: number) {
  let roundedDate = date - (date % (24 * 60 * 60 * 1000)); // subtract amount of time since midnight
  roundedDate += new Date().getTimezoneOffset() * 60 * 1000; // add on the timezone offset
  return new Date(roundedDate);
}

const getRecords = (items: Record[]) => {
  const dates: any = [];
  const dateIndices: any = [];

  const groupedSurveys: any = [];
  let counter: any = {};

  const process = (record: Record) => {
    const date = roundDate(
      new Date(record.metadata.createdOn).getTime()
    ).toString();
    if (!dates.includes(date) && date !== 'Invalid Date') {
      dates.push(date);
      dateIndices.push(groupedSurveys.length);
      counter = { date, count: 0 };
      groupedSurveys.push(counter);
    }

    counter.count += 1;
    groupedSurveys.push(record);
  };
  items.forEach(process);

  // eslint-disable-next-line react/no-unstable-nested-components
  const Item = ({ index, ...itemProps }: any) => {
    if (dateIndices.includes(index)) {
      const { date, count } = groupedSurveys[index];
      return (
        <IonItemDivider key={date} style={(itemProps as any).style} mode="ios">
          <IonLabel>{DateHelp.print(date, true)}</IonLabel>
          {count > 1 && <IonLabel slot="end">{count}</IonLabel>}
        </IonItemDivider>
      );
    }

    const sample = groupedSurveys[index];

    return <Survey key={sample.cid} record={sample} {...itemProps} />;
  };

  const itemCount = items.length + dateIndices.length;

  const getItemSize = (index: number) =>
    dateIndices.includes(index) ? LIST_ITEM_DIVIDER_HEIGHT : LIST_ITEM_HEIGHT;

  return (
    <VirtualList
      itemCount={itemCount}
      itemSize={getItemSize}
      Item={Item}
      topPadding={LIST_PADDING}
      bottomPadding={LIST_ITEM_HEIGHT / 2}
    />
  );
};

const Home = () => {
  const match = useRouteMatch();
  const location = useLocation();
  const surveyConfig = useSurveyBlockConfig();

  const newRecordPath = `${match.url}/record`;

  const initSegment = 'pending';
  const [segment, setSegment] = useState(initSegment);

  const setSegmentFromUrl = () => {
    const segmentParam = location.search.split('segment=')[1];
    if (segmentParam) setSegment(segmentParam);
  };
  useEffect(setSegmentFromUrl, [location.search]);

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);

    const basePath = match.url.split('?segment')[0];
    const path = `${basePath}?segment=${newSegment}`;
    window.history.replaceState(null, '', path); // https://stackoverflow.com/questions/57101831/react-router-how-do-i-update-the-url-without-causing-a-navigation-reload
  };

  const getRecordsList = (uploaded?: boolean) => {
    const byUploadStatus = (record: Record) =>
      uploaded ? record.isUploaded() : !record.isUploaded();

    function bySurveyDate(record1: Record, record2: Record) {
      const date1 = new Date(record1.metadata.createdOn);
      const moveToTop = !date1 || date1.toString() === 'Invalid Date';
      if (moveToTop) return -1;

      const date2 = new Date(record2.metadata.createdOn);
      return date2.getTime() - date1.getTime();
    }

    return records
      .filter(bySurvey(surveyConfig.id))
      .filter(byUploadStatus)
      .sort(bySurveyDate);
  };

  const getPendingSurveys = () => {
    const surveys = getRecordsList(false);

    const InfoBackgroundMessageWithLink = InfoBackgroundMessage as any;

    if (!surveys.length) {
      return (
        <InfoBackgroundMessageWithLink
          routerLink={newRecordPath}
          detail={false}
        >
          <div>
            You have no finished surveys. Press <IonIcon icon={addOutline} /> to
            start one.
          </div>
        </InfoBackgroundMessageWithLink>
      );
    }

    return getRecords(surveys);
  };

  const getPendingSurveysCount = () => {
    const pendingSurveys = getRecordsList();

    if (!pendingSurveys.length) {
      return null;
    }

    return (
      <IonBadge color="secondary" slot="end">
        {pendingSurveys.length}
      </IonBadge>
    );
  };

  const getUploadedSurveys = () => {
    const surveys = getRecordsList(true);

    if (!surveys.length) {
      return (
        <InfoBackgroundMessage>
          There are no uploaded surveys on this device.
        </InfoBackgroundMessage>
      );
    }

    return getRecords(surveys);
  };

  const getUploadedSurveysCount = () => {
    const uploadedSurveys = getRecordsList(true);

    if (!uploadedSurveys.length) {
      return null;
    }

    return (
      <IonBadge color="light" slot="end">
        {uploadedSurveys.length}
      </IonBadge>
    );
  };

  const showingPending = segment === 'pending';
  const showingUploaded = segment === 'uploaded';

  return (
    <Page id="survey-home">
      <Header title={surveyConfig.title || `Survey`} />
      <Main>
        <IonSegment onIonChange={onSegmentClick} value={segment}>
          <IonSegmentButton value="pending">
            <IonLabel className="ion-text-wrap">
              Pending
              {getPendingSurveysCount()}
            </IonLabel>
          </IonSegmentButton>

          <IonSegmentButton value="uploaded">
            <IonLabel className="ion-text-wrap">
              Uploaded
              {getUploadedSurveysCount()}
            </IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <IonFab slot="fixed" horizontal="end" vertical="bottom">
          <IonFabButton routerLink={newRecordPath} color="secondary">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {showingPending && <IonList>{getPendingSurveys()}</IonList>}
        {showingUploaded && <IonList>{getUploadedSurveys()}</IonList>}
      </Main>
    </Page>
  );
};

export default observer(Home);
