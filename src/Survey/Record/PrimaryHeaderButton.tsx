import { observer } from 'mobx-react';
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

  const isValid = !record.validateRemote();

  return (
    <IonButton
      onClick={onClick}
      color={isValid ? 'secondary' : 'medium'}
      className="![--padding-end:20px] ![--padding-start:20px] ![--border-radius:var(--theme-border-radius)]"
      fill="solid"
    >
      {record.metadata.saved ? <T>Upload</T> : <T>Finish</T>}
    </IonButton>
  );
};

export default observer(PrimaryHeaderButton);
