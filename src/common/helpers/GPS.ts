import { Geolocation } from '@capacitor/geolocation';
import { isValidLocation, Location } from '@flumens';
import { GeometryInput } from '@flumens/tailwind/dist/Survey';

type ClientId = string;

const clients: ClientId[] = [];

export const isLocating = (clientId: ClientId) => clients.includes(clientId);

type Callback = (err: any, location?: Location) => any;

export const stopLocate = (clientId: ClientId) => {
  const index = clients.indexOf(clientId);
  if (index > -1) clients.splice(index, 1);
};

export const locate = async (clientId: ClientId, callback: Callback) => {
  if (isLocating(clientId)) return;

  clients.push(clientId);

  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 60000,
    });

    const location: Location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude!,
      altitudeAccuracy: position.coords.altitudeAccuracy!,
    };

    const isStillLocating = isLocating(clientId);
    if (!isStillLocating) return;

    callback(null, location);
  } catch (error) {
    callback(error);
  }

  stopLocate(clientId);
};

export const locateAndSetValue = (
  id: string,
  onChange: any,
  block: GeometryInput
) => {
  const setBlockLocation = (_err: unknown, location?: Location) =>
    isValidLocation(location) && onChange(location);

  locate(id + block.id, setBlockLocation);
};
