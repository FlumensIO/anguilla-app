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
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { InfoMessage, MenuAttrToggle } from '@flumens';
import {
  IonIcon,
  IonList,
  IonItem,
  IonItemDivider,
  IonButton,
} from '@ionic/react';
import CONFIG from 'common/config';
import flumensLogo from 'common/images/flumens.svg';
import Main from 'Components/Main';
import logo from './logo.png';

type Props = {
  logOut: any;
  refreshAccount: any;
  resendVerificationEmail: any;
  isLoggedIn: boolean;
  useTraining: boolean;
  user: any;
  onToggle: any;
};

const Component = ({
  isLoggedIn,
  user,
  logOut,
  refreshAccount,
  resendVerificationEmail,
  useTraining,
  onToggle,
}: Props) => {
  const userName = `${user.firstName} ${user.lastName}`;

  const isNotVerified = user.verified === false; // verified is undefined in old versions
  const userEmail = user.email;

  const onTrainingToggle = (checked: boolean) =>
    onToggle('useTraining', checked);

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
        </div>

        <div className="mt-10 text-center">
          <a href="https://flumens.io">
            <img
              className="m-auto block max-h-8 w-full"
              src={flumensLogo}
              alt="logo"
            />
          </a>

          <p className="mb-8 pt-3 text-primary-900 opacity-70">
            <span>
              App version: v{CONFIG.version} ({CONFIG.build})
            </span>
          </p>
        </div>
      </IonList>
    </Main>
  );
};

export default observer(Component);
