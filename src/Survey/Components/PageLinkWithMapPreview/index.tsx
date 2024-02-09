import { device } from '@flumens';
import PageLink, {
  Props,
} from '@flumens/tailwind/dist/components/Blocks/PageLinkBlock';
import GeometryLink from './GeometryLink';

const PageLinkWithMapPreview = ({
  onPress,
  blockConfig,
  value,
  platform,
  lists,
  isDisabled,
}: Props) => {
  const link = (
    <PageLink
      onPress={onPress}
      blockConfig={blockConfig}
      value={value}
      platform={platform}
      lists={lists}
      isDisabled={isDisabled}
    />
  );

  if (blockConfig.type === 'geometry_input' && device?.isOnline) {
    const [map] = blockConfig.maps!;
    const initialViewState = map?.view || {};

    return (
      <>
        {link}
        <GeometryLink
          onClick={onPress}
          location={value as any}
          initialViewState={initialViewState}
          style={map.style}
        />
      </>
    );
  }

  return link;
};

export default PageLinkWithMapPreview;
