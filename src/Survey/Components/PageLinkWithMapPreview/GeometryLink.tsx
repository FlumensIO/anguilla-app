/* eslint-disable import/no-extraneous-dependencies */
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { MapRef, ViewState } from 'react-map-gl';
import { isValidLocation, Location, MapContainer } from '@flumens';
import CONFIG from 'common/config';

const disableMapInteractions = {
  onClick: () => null,
  dragPan: false,
  onDblClick: () => undefined,
  doubleClickZoom: false,
  dragRotate: false,
  scrollZoom: false,
  keyboard: false,
};

type Props = {
  location: Location;
  initialViewState: Partial<ViewState>;
  style: string;
  onClick: () => void;
};

const GeometryLink = ({
  location,
  onClick,
  initialViewState,
  style,
}: Props) => {
  const [mapRef, setMapRef] = useState<MapRef>();

  const flyToLocation = () => {
    if (!isValidLocation(location)) return;
    mapRef?.jumpTo({
      zoom: 17,
      center: [location!.longitude, location!.latitude],
    });
  };
  useEffect(flyToLocation, [mapRef, location]);

  return (
    <div className="map-wrapper h-20 w-full" onClick={onClick}>
      <MapContainer
        onReady={setMapRef}
        accessToken={CONFIG.map.mapboxApiKey}
        attributionControl={false}
        initialViewState={initialViewState}
        mapStyle={style}
        id="verification-map"
        {...disableMapInteractions}
      >
        <MapContainer.Marker {...location} />
      </MapContainer>
    </div>
  );
};

export default observer(GeometryLink);
