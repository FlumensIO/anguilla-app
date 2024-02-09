import { observer } from 'mobx-react';
import { Capacitor } from '@capacitor/core';
import { captureImage, Media, PhotoPicker } from '@flumens';
import { isPlatform } from '@flumens/tailwind/dist/components/utils';
import config from 'common/config';

type Props = { value?: any; onChange: any; isDisabled?: boolean };

const PhotoInput = ({ value, onChange, isDisabled }: Props) => {
  const photosObject = value || {};
  const addCID = ([cid, m]: any) => ({ ...m, cid });
  const photos = Object.entries(photosObject).map(addCID);

  const onAdd = async (shouldUseCamera: boolean) => {
    type URL = string;
    const photoURLs = await captureImage(
      shouldUseCamera ? { camera: true } : { multiple: true }
    );
    if (!photoURLs.length) return;

    const getImageModel = async (imageURL: URL) =>
      Media.getImageModel(
        isPlatform('ios') || isPlatform('android')
          ? Capacitor.convertFileSrc(imageURL)
          : imageURL,
        config.dataPath,
        true
      );

    const indiciaToFlat = (m: any) => ({
      data: m.attrs.data,
      path: m.attrs.path,
    });

    const imageModels = await (
      await Promise.all<any>(photoURLs.map(getImageModel))
    ).map(indiciaToFlat);

    onChange(imageModels, 'add');
  };

  const onRemove = (media: any) => onChange(media.cid, 'remove');

  return (
    <PhotoPicker
      value={photos}
      onAdd={onAdd}
      onRemove={onRemove}
      isDisabled={isDisabled}
      className="photo-input-block block"
    />
  );
};

export default observer(PhotoInput);
