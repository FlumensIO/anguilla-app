/* eslint @typescript-eslint/no-use-before-define: 0 */
import { Geolocation } from '@capacitor/geolocation';
import { isValidLocation, Location } from '@flumens';
import { GeometryInput } from '@flumens/tailwind/dist/Survey';
import { Geolocation as GeolocationT } from '@flumens/tailwind/dist/components/Block';

type ClientId = string;
type Callback = (err: any, location?: Location) => any;

const clients: ClientId[] = [];

const locate = async (clientId: ClientId, callback: Callback) => {
  if (geolocation.isLocating(clientId)) return;

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

    const isStillLocating = geolocation.isLocating(clientId);
    if (!isStillLocating) return;

    callback(null, location);
  } catch (error) {
    callback(error);
  }

  geolocation.stopLocate(clientId);
};

const geolocation: GeolocationT = {
  isLocating(clientId: ClientId) {
    return clients.includes(clientId);
  },

  locateAndSetValue(id: string, onChange: any, block: GeometryInput) {
    const setBlockLocation = (_err: unknown, location?: Location) =>
      isValidLocation(location) && onChange(location);

    locate(id + block.id, setBlockLocation);
  },

  stopLocate(clientId: ClientId) {
    const index = clients.indexOf(clientId);
    if (index > -1) clients.splice(index, 1);
  },
};

export default geolocation;
