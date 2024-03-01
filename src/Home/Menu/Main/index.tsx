import { observer } from 'mobx-react';
import {
  exitOutline,
  personOutline,
  personAddOutline,
  openOutline,
  documentTextOutline,
  lockClosedOutline,
  informationCircleOutline,
  helpBuoyOutline,
  schoolOutline,
  trashBinOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { InfoMessage, MenuAttrToggle, useAlert } from '@flumens';
import {
  IonIcon,
  IonList,
  IonItem,
  IonItemDivider,
  IonButton,
  IonLabel,
} from '@ionic/react';
import CONFIG from 'common/config';
import flumensLogo from 'common/images/flumens.svg';
import appModel from 'common/models/app';
import Main from 'Components/Main';
import logo from './logo.png';

function clearCacheDialog(clearCache: any, alert: any) {
  alert({
    header: 'Clear cache',
    message: ' This will delete cached data, including your uploaded surveys.',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: 'Clear',
        role: 'destructive',
        handler: clearCache,
      },
    ],
  });
}

type Props = {
  logOut: any;
  refreshAccount: any;
  resendVerificationEmail: any;
  isLoggedIn: boolean;
  useTraining: boolean;
  user: any;
  onToggle: any;
  clearCache: any;
};

const Component = ({
  isLoggedIn,
  user,
  logOut,
  refreshAccount,
  resendVerificationEmail,
  useTraining,
  onToggle,
  clearCache,
}: Props) => {
  const alert = useAlert();
  const userName = `${user.firstName} ${user.lastName}`;

  const isNotVerified = user.verified === false; // verified is undefined in old versions
  const userEmail = user.email;

  const onTrainingToggle = (checked: boolean) =>
    onToggle('useTraining', checked);

  const onClearCacheDialog = () => clearCacheDialog(clearCache, alert);

  return (
    <Main>
      <img src={logo} alt="logo" className="mx-auto block h-[140px]" />

      <IonList>
        <IonItemDivider>
          <T>User</T>
        </IonItemDivider>
        <div className="content-group">
          {isLoggedIn && (
            <IonItem detail id="logout-button" onClick={logOut}>
              <IonIcon icon={exitOutline} size="small" slot="start" />
              <T>Logout</T>
              {': '}
              {userName}
            </IonItem>
          )}

          {isLoggedIn && isNotVerified && (
            <InfoMessage className="verification-warning">
              Looks like your <b>{userEmail}</b> email hasn't been verified yet.
              <div>
                <IonButton fill="outline" onClick={refreshAccount}>
                  Refresh
                </IonButton>
                <IonButton fill="clear" onClick={resendVerificationEmail}>
                  Resend Email
                </IonButton>
              </div>
            </InfoMessage>
          )}

          {!isLoggedIn && (
            <IonItem routerLink="/user/login" detail>
              <IonIcon icon={personOutline} size="small" slot="start" />
              <T>Login</T>
            </IonItem>
          )}

          {!isLoggedIn && (
            <IonItem routerLink="/user/register" detail>
              <IonIcon icon={personAddOutline} size="small" slot="start" />
              <T>Register</T>
            </IonItem>
          )}
        </div>

        <IonItemDivider>
          <T>Info</T>
        </IonItemDivider>
        <div className="content-group">
          <IonItem routerLink="/info/about" detail>
            <IonIcon
              icon={informationCircleOutline}
              size="small"
              slot="start"
            />
            <T>About</T>
          </IonItem>
          <IonItem
            href={`${CONFIG.backend.url}/link`}
            target="_blank"
            detail
            detailIcon={openOutline}
          >
            <IonIcon icon={helpBuoyOutline} size="small" slot="start" />
            <T>FAQ</T>
          </IonItem>
          <IonItem
            href={`${CONFIG.backend.url}/link`}
            target="_blank"
            detail
            detailIcon={openOutline}
          >
            <IonIcon icon={documentTextOutline} size="small" slot="start" />
            <T>Terms and Conditions</T>
          </IonItem>

          <IonItem
            href={`${CONFIG.backend.url}/link`}
            target="_blank"
            detail
            detailIcon={openOutline}
          >
            <IonIcon icon={lockClosedOutline} size="small" slot="start" />
            <T>Privacy Policy</T>
          </IonItem>
        </div>

        <IonItemDivider>
          <T>Settings</T>
        </IonItemDivider>

        <div className="content-group">
          <MenuAttrToggle
            icon={schoolOutline}
            label="Training Mode"
            value={useTraining}
            onChange={onTrainingToggle}
          />
          <InfoMessage color="medium">
            Mark any new records as &#39;training&#39; and exclude from all
            reports.
          </InfoMessage>

          <IonItem onClick={onClearCacheDialog}>
            <IonIcon icon={trashBinOutline} size="small" slot="start" />
            <IonLabel>
              <T>Clear cache</T>
            </IonLabel>
          </IonItem>
          <InfoMessage color="medium">
            You can free up storage used by the app.
          </InfoMessage>
        </div>

        <div className="mt-10 text-center">
          <a href="https://flumens.io">
            <img
              className="m-auto block max-h-8 w-full"
              src={flumensLogo}
              alt="logo"
            />
          </a>

          <div className="mb-8 pt-3 text-primary-900 opacity-90">
            <div className="text-sm font-medium">
              Version {CONFIG.version} ({CONFIG.build})
            </div>

            {appModel.attrs.offlineVersion && (
              <div className="my-2 ml-3 inline-flex items-center gap-x-1.5 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
                Offline ready
              </div>
            )}
          </div>
        </div>
      </IonList>
    </Main>
  );
};

export default observer(Component);
