import { useContext } from 'react';
import { Header, Page, useToast } from '@flumens';
import { NavContext } from '@ionic/react';
import { useUserStatusCheck } from 'common/models/user';
import { useValidateCheck } from 'models/record';
import Main from 'Components/Main';
import BlocksWithRoundedGroups from 'Survey/Components/BlocksWithRoundedGroups';
import { useRecord } from '../hooks';
import HeaderBand from './HeaderBand';
import PrimaryHeaderButton from './PrimaryHeaderButton';

const RecordHome = () => {
  const navigate = useContext(NavContext);
  const toast = useToast();
  const record = useRecord();
  const checkRecordStatus = useValidateCheck(record);
  const checkUserStatus = useUserStatusCheck();

  if (!record) return null;

  const surveyConfig = record.getSurvey();

  const { title } = surveyConfig.attrs;

  const _processSubmission = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkRecordStatus();
    if (!isValid) return;

    record.upload().catch(toast.error);
    navigate.goBack();
  };

  const _processDraft = async () => {
    const isValid = checkRecordStatus();
    if (!isValid) return;

    // eslint-disable-next-line no-param-reassign
    record.metadata.saved = true;
    record.save();

    navigate.goBack();
  };

  const onFinish = async () =>
    !record.metadata.saved ? _processDraft() : _processSubmission();

  const finishButton = record.isUploaded() ? null : (
    <PrimaryHeaderButton record={record} onClick={onFinish} />
  );

  const { training } = record.attrs;

  const subheader = !!training && <HeaderBand>Training Mode</HeaderBand>;

  const disabled = record.isUploaded();

  return (
    <Page id="record-home">
      <Header title={title} rightSlot={finishButton} subheader={subheader} />
      <Main>
        {disabled && (
          <div className="content-group mb-5 rounded-md bg-tertiary-50/30 px-4 py-3 text-tertiary-900">
            This record has been submitted and cannot be edited within this app.
          </div>
        )}

        <BlocksWithRoundedGroups
          surveyBlocks={surveyConfig.attrs.blocks}
          record={record?.attrs}
          recordId={record?.cid}
          isDisabled={disabled}
        />
      </Main>
    </Page>
  );
};

export default RecordHome;
