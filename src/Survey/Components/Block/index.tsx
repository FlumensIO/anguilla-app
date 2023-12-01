import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import {
  MenuAttrItem,
  TextareaInput,
  TextInput,
  DateTimeInput,
  RadioInput,
  PhotoPicker,
  captureImage,
  useToast,
  Media,
  isValidLocation,
  prettyPrintLocation,
  InfoBackgroundMessage,
} from '@flumens';
import getNewUUID from '@flumens/ionic/dist/utils/uuid';
import {
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  isPlatform,
  NavContext,
} from '@ionic/react';
import { Block as BlockT, Choice } from 'common/Survey.d';
import config from 'common/config';
import { INPUTS_WITH_VALUES } from 'common/surveys';
import { getBlocksFromURL, useRecord } from '../hooks';
import GeometryInput from './GeometryInput';
import './styles.scss';
import { createDeepObject, getDeepObject, getDeepObjectKey } from './utils';

const getBlockValue = (valueObject: any, block: BlockT) => {
  const value = valueObject?.[block.id];
  if (block.type === 'geometry_input') {
    if (isValidLocation(value)) return prettyPrintLocation(value);
    return '';
  }

  if (block.type === 'choice_input') {
    if ('choices' in block) {
      const byDataName = (c: Choice) => c.data_name === value;
      const choice = block.choices.find(byDataName);
      if (choice) return choice.title;
    }

    return '';
  }

  return value;
};

type Props = { block: BlockT };

const Block = ({ block }: Props) => {
  const navigate = useContext(NavContext);
  const match = useRouteMatch();

  const currentPath = match.url.includes('blocks')
    ? match.url
    : `${match.url}/blocks`;

  const blockIds = getBlocksFromURL(match.url);
  const toast = useToast();

  const record = useRecord();
  if (!record) return null;

  let valueObject = getDeepObject(
    record.attrs,
    getDeepObjectKey(blockIds, block)
  );

  async function onAddNew(shouldUseCamera: boolean) {
    type URL = string;
    try {
      const photoURLs = await captureImage(
        shouldUseCamera ? { camera: true } : { multiple: true }
      );
      if (!photoURLs.length) return;

      const getImageModel = async (imageURL: URL) =>
        Media.getImageModel(
          isPlatform('hybrid') ? Capacitor.convertFileSrc(imageURL) : imageURL,
          config.dataPath,
          true
        );
      const indiciaToFlat = (m: any) => ({
        cid: getNewUUID(),
        ...m.toJSON().attrs,
      });
      const imageModels = await (
        await Promise.all<any>(photoURLs.map(getImageModel))
      ).map(indiciaToFlat);

      if (!valueObject[block.id]) {
        valueObject[block.id] = [];
      }

      valueObject[block.id].push(...imageModels);
    } catch (e: any) {
      toast.error(e);
    }
  }

  const isDisabled = record.isUploaded();

  const isWithinPage = blockIds.includes(block.id);
  const isRepeated = block.type === 'group' && block.repeated;
  const usesPageContainer = block.container === 'page';

  const presentLink = usesPageContainer && !isWithinPage && !isRepeated;
  if (presentLink) {
    const showValue = INPUTS_WITH_VALUES.includes(block.type);

    const value = showValue ? getBlockValue(valueObject, block) : null;

    const normalizedBlockId = encodeURIComponent(block.id);
    const routerLink = !isDisabled
      ? `${currentPath}/${normalizedBlockId}`
      : undefined;

    return (
      <MenuAttrItem
        key={block.id}
        detail={!isDisabled}
        routerLink={routerLink}
        label={block.title}
        value={value}
      />
    );
  }

  if (usesPageContainer && isRepeated) {
    const getRepeatPath = (index: number) =>
      `${currentPath}/${encodeURIComponent(block.id)}(${index})`;

    const addRepeatable = () => {
      let object = getDeepObject(
        record.attrs,
        getDeepObjectKey(blockIds, block)
      );

      if (!object) {
        object = createDeepObject(
          record.attrs,
          getDeepObjectKey(blockIds, block)
        );
      }

      object.push({});
      navigate.navigate(getRepeatPath(object.length - 1));
    };

    const getRepeatLink = (_: any, index: number) => {
      const routerLink = !isDisabled ? getRepeatPath(index) : undefined;

      return (
        <MenuAttrItem
          key={index}
          detail={!isDisabled}
          routerLink={routerLink}
          label={`${index}`}
        />
      );
    };

    const hasRepeatables = !!valueObject?.length;
    const repeatables = hasRepeatables ? (
      <>
        <h3 className="self-start p-3">{block.title}</h3>
        <IonList>
          <div className="rounded">{valueObject?.map(getRepeatLink)}</div>
        </IonList>
      </>
    ) : (
      <InfoBackgroundMessage className="!my-4">
        You have no entries.
      </InfoBackgroundMessage>
    );

    return (
      <div className="mt-10 flex flex-col items-center">
        <IonButton
          onClick={addRepeatable}
          className="max-w-fit"
          color="secondary"
        >
          Add
        </IonButton>
        {repeatables}
      </div>
    );
  }

  const setValueObject = (newValue: any) => {
    if (!valueObject)
      valueObject = createDeepObject(
        record.attrs,
        getDeepObjectKey(blockIds, block)
      );
    valueObject[block.id] = newValue;
  };

  if (block.type === 'date_time_input') {
    return (
      <DateTimeInput
        value={valueObject?.[block.id]}
        onChange={setValueObject}
        label="Date"
        autoFocus={false}
        usePrettyDates
        presentation="date"
      />
    );
  }

  if (block.type === 'choice_input' && 'choices' in block && block.choices) {
    const getOption = ({ data_name, title }: Choice) => ({
      value: data_name,
      label: title,
    });

    const setValueObjectWithNavBack = (newValue: any) => {
      setValueObject(newValue);

      const shouldNavigateBack =
        isWithinPage && block.type === 'choice_input' && !block.multiple;
      if (shouldNavigateBack) {
        navigate.goBack();
      }
    };

    return (
      <IonItem key={block.id}>
        {!usesPageContainer && <IonLabel>{block.title}</IonLabel>}
        <RadioInput
          value={valueObject?.[block.id]}
          onChange={setValueObjectWithNavBack}
          options={block.choices.map(getOption)}
        />
      </IonItem>
    );
  }

  if (block.type === 'number_input') {
    return (
      <IonItem key={block.id} className="[--inner-padding-end:0]">
        <TextInput
          label={usesPageContainer ? '' : block.title}
          value={valueObject?.[block.id]}
          onChange={setValueObject}
          type="number"
          autofocus={false}
          className="!m-0 text-right [&>label>div>input]:!text-[0.9em] [&>label>div>input]:!text-black/70"
        />
      </IonItem>
    );
  }

  if (block.type === 'text_input') {
    if (block.appearance === 'multiline') {
      return (
        <IonItem key={block.id}>
          {!usesPageContainer && <IonLabel>{block.title}</IonLabel>}
          <TextareaInput
            value={valueObject?.[block.id]}
            onChange={setValueObject}
          />
        </IonItem>
      );
    }

    return (
      <IonItem key={block.id} className="[--inner-padding-end:0]">
        <TextInput
          label={usesPageContainer ? '' : block.title}
          value={valueObject?.[block.id]}
          onChange={setValueObject}
          autofocus={false}
          className="!m-0 text-right [&>label>div>input]:!text-[0.9em] [&>label>div>input]:!text-black/70"
        />
      </IonItem>
    );
  }

  if (block.type === 'geometry_input') {
    const location = valueObject?.[block.id] || {};

    const onMapClick = (newLocation: Location) => setValueObject(newLocation);
    return (
      <GeometryInput key={block.id} location={location} onChange={onMapClick} />
    );
  }

  if (block.type === 'photo_input') {
    // eslint-disable-next-line @getify/proper-arrows/name
    const indiciaMedia = (valueObject?.[block.id] || []).map((m: any) => ({
      attrs: { ...m },
      getURL: () => m.data,
      cid: m.cid,
      metadata: {},
      destroy: () => {
        const byCid = (mToDelete: any) => mToDelete.cid === m.cid;
        const index = valueObject?.[block.id].findIndex(byCid);
        valueObject?.[block.id].splice(index, 1);
      },
    }));
    const model = { media: indiciaMedia, save: () => {} };

    // TODO: move away from Indicia models for the component
    return <PhotoPicker key={block.id} model={model} onAddNew={onAddNew} />;
  }

  return null;
};

export default observer(Block);
