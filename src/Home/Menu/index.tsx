import { FC } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Page, PickByType, useAlert, useLoader, useToast } from '@flumens';
import { IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import appModel, { Attrs } from 'models/app';
import userModel from 'models/user';
import Main from './Main';
import './styles.scss';

function showLogoutConfirmationDialog(callback: any, alert: any) {
  alert({
    header: 'Logout',
    message: (
      <T>
        Are you sure you want to logout?
        <br />
        <br />
        Your pending and uploaded <b>records will not be deleted </b> from this
        device.
      </T>
    ),
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: 'Logout',
        cssClass: 'primary',
        handler: () => callback(),
      },
    ],
  });
}

const onToggle = (
  setting: keyof PickByType<Attrs, boolean>,
  checked: boolean
) => {
  console.log('Settings:Menu:Controller: setting toggled.');
  appModel.attrs[setting] = checked; // eslint-disable-line no-param-reassign
  appModel.save();
};

const Controller: FC = ({ ...restProps }) => {
  const alert = useAlert();
  const loader = useLoader();
  const toast = useToast();

  const { useTraining } = appModel.attrs;

  function logOut() {
    console.log('Info:Menu: logging out.');
    const resetWrap = async () => {
      userModel.logOut();
    };
    showLogoutConfirmationDialog(resetWrap, alert);
  }

  const isLoggedIn = userModel.isLoggedIn();

  const checkActivation = async () => {
    await loader.show('Please wait...');
    try {
      await userModel.checkActivation();
      if (!userModel.attrs.verified) {
        toast.warn('The user has not been activated or is blocked.');
      }
    } catch (err: any) {
      toast.error(err);
    }
    loader.hide();
  };

  const resendVerificationEmail = async () => {
    await loader.show('Please wait...');
    try {
      await userModel.resendVerificationEmail();
      toast.success(
        'A new verification email was successfully sent now. If you did not receive the email, then check your Spam or Junk email folders.'
      );
    } catch (err: any) {
      toast.error(err);
    }
    loader.hide();
  };

  return (
    <Page id="info-menu">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Anguilla App</IonTitle>
        </IonToolbar>
      </IonHeader>

      <Main
        user={userModel.attrs}
        isLoggedIn={isLoggedIn}
        logOut={logOut}
        refreshAccount={checkActivation}
        resendVerificationEmail={resendVerificationEmail}
        useTraining={useTraining}
        onToggle={onToggle}
        {...restProps}
      />
    </Page>
  );
};

export default observer(Controller);
