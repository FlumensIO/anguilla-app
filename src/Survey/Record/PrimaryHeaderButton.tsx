import { Trans as T } from 'react-i18next';
import { IonButton } from '@ionic/react';
import Record from 'models/record';

interface Props {
  record: Record;
  onClick: any;
}

const PrimaryHeaderButton = ({ record, onClick }: Props) => {
  const isDisabled = record.isUploaded();
  if (isDisabled) return null;

  const isValid = false;
  // const isValid = !record.validateRemote();

  return (
    <IonButton
      onClick={onClick}
      color={isValid ? 'primary' : 'medium'}
      // ion-button.primary-header-button {
      //   --padding-end: 20px;
      //   --padding-start: 20px;
      //   --background: var(--ion-color-primary);
      //   --border-radius: var(--theme-border-radius) !important;
      // }

      fill="solid"
    >
      {record.metadata.saved ? <T>Upload</T> : <T>Finish</T>}
    </IonButton>
  );
};

export default PrimaryHeaderButton;
