import { FC } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { IonSpinner, IonChip, IonButton } from '@ionic/react';
import Sample from 'models/record';
import './styles.scss';

interface Props {
  sample: Sample;
  onUpload: (e?: any) => void;
  uploadIsPrimary?: boolean;
  isDraftSurvey?: boolean;
}

const UsersSurveys: FC<Props> = ({
  onUpload,
  sample,
  uploadIsPrimary,
  isDraftSurvey,
}) => {
  const { saved } = sample.metadata;
  const { synchronising } = sample.remote;
  const isDisabled = sample.isUploaded();

  if (!saved) {
    return (
      <IonChip
        color={isDraftSurvey ? 'secondary' : 'dark'}
        className="survey-status ion-text-wrap"
      >
        <T>Draft</T>
      </IonChip>
    );
  }

  if (synchronising) return <IonSpinner className="survey-status" />;

  if (isDisabled) return null;

  return (
    <IonButton
      className="survey-status survey-status-upload"
      onClick={onUpload}
      fill={uploadIsPrimary ? undefined : 'outline'}
    >
      <T>Upload</T>
    </IonButton>
  );
};

export default observer(UsersSurveys);
