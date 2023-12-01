import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useAlert, useToast } from '@flumens';
import {
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  NavContext,
} from '@ionic/react';
import Record, { useValidateCheck } from 'models/record';
import { useUserStatusCheck } from 'models/user';
import { useSurveyBlockConfig } from 'Survey/Components/hooks';
import OnlineStatus from './components/OnlineStatus';
import './styles.scss';

function useSurveyDeletePrompt(record: Record) {
  const alert = useAlert();

  const promptSurveyDelete = () => {
    let body =
      "This record hasn't been uploaded to the database yet. " +
      'Are you sure you want to remove it from your device?';

    const isSynced = record.metadata.syncedOn;
    if (isSynced) {
      body =
        'Are you sure you want to remove this record from your device?' +
        '</br><i><b>Note:</b> it will remain in the database.</i>';
    }
    alert({
      header: 'Delete',
      message: body,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => record.destroy(),
        },
      ],
    });
  };

  return promptSurveyDelete;
}

type Props = {
  record: Record;
  style?: any;
};

const Survey: FC<Props> = ({ record, style }) => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();
  const deleteSurvey = useSurveyDeletePrompt(record);
  const checkSampleStatus = useValidateCheck(record);
  const checkUserStatus = useUserStatusCheck();

  const survey = useSurveyBlockConfig();

  const { synchronising } = record.remote;

  const href = !synchronising
    ? `/survey/${survey.id}/record/${record.cid}`
    : undefined;

  const deleteSurveyWrap = () => deleteSurvey();

  const onUpload = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    record.upload().catch(toast.error);
    navigate(`/home/surveys`, 'root');
  };

  return (
    <IonItemSliding
      className="max-w-[600px] rounded-[var(--theme-border-radius)] bg-[white]"
      style={style}
    >
      <IonItem routerLink={href} detail={false} className="survey-list-item">
        <div className="flex h-full w-full items-center justify-between">
          <div className="ml-4 text-sm">Record</div>
          <OnlineStatus sample={record} onUpload={onUpload} />
        </div>
      </IonItem>

      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={deleteSurveyWrap}>
          <T>Delete</T>
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default observer(Survey);
