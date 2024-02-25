import { FC } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useAlert, useToast } from '@flumens';
import {
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import Record, { useValidateCheck } from 'models/record';
import { useUserStatusCheck } from 'models/user';
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
  const toast = useToast();
  const deleteSurvey = useSurveyDeletePrompt(record);
  const checkSampleStatus = useValidateCheck(record);
  const checkUserStatus = useUserStatusCheck();

  const survey = record.getSurvey();
  const isDeletedSurvey = !survey;

  const { synchronising } = record.remote;

  const href =
    !synchronising && !isDeletedSurvey
      ? `/survey/${survey.cid}/record/${record.cid}`
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
  };

  return (
    <IonItemSliding
      className="max-w-xl rounded-[var(--theme-border-radius)] bg-[white]"
      style={style}
    >
      <IonItem routerLink={href} detail={false} className="survey-list-item">
        <div className="flex h-full w-full items-center justify-between">
          <div className="ml-4 text-sm">Record</div>
          {isDeletedSurvey && (
            <div className="ml-4 text-sm text-black/50">(Deleted survey)</div>
          )}
          {!isDeletedSurvey && (
            <OnlineStatus
              sample={record}
              onUpload={onUpload}
              isDraftSurvey={survey.isDraft()}
            />
          )}
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
