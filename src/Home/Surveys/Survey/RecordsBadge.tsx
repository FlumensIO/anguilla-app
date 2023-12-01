import clsx from 'clsx';
import { IonLabel, IonBadge } from '@ionic/react';

type Props = { children?: number; className?: string };

const RecordsBadge = ({ children = 0, className }: Props) => {
  return (
    <div className={clsx('flex items-center', className)}>
      <IonLabel>Records</IonLabel>
      <IonBadge className="ml-2 h-fit">{children}</IonBadge>
    </div>
  );
};

export default RecordsBadge;
