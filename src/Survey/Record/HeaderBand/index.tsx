import {
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  isPlatform,
} from '@ionic/react';
import './styles.scss';

type Props = {
  children?: string;
};

const HeaderBand = ({ children }: Props) => {
  const isAndroid = isPlatform('android');

  return (
    <IonToolbar className="header-band h-5 [--min-height:20px]" color="medium">
      {isAndroid && (
        <IonButtons slot="start">
          <IonBackButton text="back" defaultHref="">
            {/* Placeholder only */}
          </IonBackButton>
        </IonButtons>
      )}

      <IonTitle className="h-5 text-sm font-medium">
        <span>{children}</span>
      </IonTitle>

      {isAndroid && <IonButtons>{/* Placeholder only */}</IonButtons>}
    </IonToolbar>
  );
};

export default HeaderBand;
