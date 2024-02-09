import { useMemo } from 'react';
import {
  BlockContext,
  BlockContextProps,
  defaultBlockContext,
} from '@flumens/tailwind/dist/components/Block';
import { isLocating, locateAndSetValue } from 'common/helpers/GPS';
import lists from 'common/models/lists';
import GeometryInput from 'Survey/Components/GeometryInput';
import PageLink from 'Survey/Components/PageLinkWithMapPreview';
import PhotoInput from 'Survey/Components/PhotoInput';
import DateTimeInput from './Components/DateTimeInput';

export default ({ children }: any) => {
  const context: BlockContextProps = useMemo(
    () => ({
      ...defaultBlockContext,
      platform: 'ios',
      DateTimeInput,
      GeometryInput,
      PhotoInput,
      PageLink,
      geolocation: { isLocating, locateAndSetValue },
      lists,
    }),
    []
  );

  return (
    <BlockContext.Provider value={context}>{children}</BlockContext.Provider>
  );
};
