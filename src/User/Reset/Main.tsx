import { FC } from 'react';
import { Formik, Form } from 'formik';
import { personOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { AnySchema } from 'yup';
import { InputWithValidation } from '@flumens';
import { IonButton, IonList } from '@ionic/react';
import Main from 'Components/Main';

type Props = {
  onSubmit: any;
  schema: AnySchema;
};

const ResetMain: FC<Props> = ({ onSubmit, schema }) => {
  const resetForm = (props: any) => (
    <Form>
      <IonList lines="full">
        <div className="content-group">
          <InputWithValidation
            name="email"
            placeholder="Email"
            icon={personOutline}
            type="email"
            autocomplete="off"
            {...props}
          />
        </div>
      </IonList>

      {/** https://github.com/formium/formik/issues/1418 */}
      <input type="submit" style={{ display: 'none' }} />
      <IonButton
        color={props.isValid ? 'secondary' : 'medium'}
        type="submit"
        expand="block"
      >
        <T>Reset</T>
      </IonButton>
    </Form>
  );

  return (
    <Main>
      <h2>
        <T>Enter your email address to request a password reset.</T>
      </h2>

      <Formik
        validationSchema={schema}
        onSubmit={onSubmit}
        initialValues={{ email: '' }}
        validateOnMount
      >
        {resetForm}
      </Formik>
    </Main>
  );
};

export default ResetMain;
