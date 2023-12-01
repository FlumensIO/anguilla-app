import { useEffect, useState } from 'react';
import { MapRef, ViewState } from 'react-map-gl';
import {
  mapMetresToZoom,
  isValidLocation,
  MapContainer,
  mapFlyToLocation,
  Location,
  mapEventToLocation,
} from '@flumens';
import config from 'common/config';

const getInitialView = (
  location: Location,
  parentLocation?: Location
): Partial<ViewState> => {
  if (isValidLocation(location))
    return {
      zoom: mapMetresToZoom(location.accuracy) || 15,
      latitude: location.latitude,
      longitude: location.longitude,
    };

  if (isValidLocation(parentLocation))
    return {
      zoom: mapMetresToZoom(parentLocation!.accuracy) || 13,
      latitude: parentLocation!.latitude,
      longitude: parentLocation!.longitude,
    };

  if (location.geocoded) {
    return {
      zoom: 10,
      longitude: location.geocoded.center[0],
      latitude: location.geocoded.center[1],
    };
  }

  return {};
};

type Props = { location: Location; onChange: any };

const GeometryInput = ({ location, onChange }: Props) => {
  const [mapRef, setMapRef] = useState<MapRef>();
  const flyToLocation = () => {
    mapFlyToLocation(mapRef, isValidLocation(location) ? location : undefined);
  };
  useEffect(flyToLocation, [
    mapRef,
    location?.latitude,
    location?.longitude,
    location?.geocoded,
  ]);

  const onMapClick = (e: any) => onChange(mapEventToLocation(e));

  return (
    <MapContainer
      onReady={setMapRef}
      onClick={onMapClick}
      accessToken={config.map.mapboxApiKey}
      maxPitch={0}
      initialViewState={getInitialView(location)}
      mapStyle="mapbox://styles/mapbox/satellite-streets-v11"
    >
      {/* <MapContainer.Control.Geolocate
        isLocating={isLocating}
        onClick={onGPSClick}
      /> */}

      <MapContainer.Marker {...location} />
    </MapContainer>
  );
};

export default GeometryInput;
