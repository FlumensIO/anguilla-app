import { observer } from 'mobx-react';
import { Capacitor } from '@capacitor/core';
import { captureImage, Media, PhotoPicker } from '@flumens';
import { isPlatform } from '@flumens/tailwind/dist/components/utils';
import config from 'common/config';

type Props = { value?: any; onChange: any; isDisabled?: boolean };

const getMimeFromUrl = (url: string) => {
  const extension = url
    .split('?')[0]
    .split('#')[0]
    .split('.')
    .pop()
    ?.toLowerCase();

  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';

  return null;
};

const convertDataUrlToJpeg = (dataUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to initialize image canvas context.'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => reject(new Error('Failed to load data URL image.'));
    img.src = dataUrl;
  });

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

    const indiciaToFlat = async (m: any, imageURL: URL) => {
      const preferredType = getMimeFromUrl(imageURL);
      const hasPngDataUrl = /^data:image\/png(;|,)/i.test(m.attrs.data);

      let data = m.attrs.data;
      if (preferredType === 'image/jpeg' && hasPngDataUrl) {
        data = await convertDataUrlToJpeg(m.attrs.data);
      }

      return {
        data,
        path: m.attrs.path,
        type: preferredType || m.attrs.type,
      };
    };

    const rawModels = await Promise.all<any>(photoURLs.map(getImageModel));
    const imageModels = await Promise.all(
      rawModels.map((model: any, index: number) =>
        indiciaToFlat(model, photoURLs[index])
      )
    );

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
