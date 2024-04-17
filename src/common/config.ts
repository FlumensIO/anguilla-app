import {
  Filesystem,
  Directory as FilesystemDirectory,
} from '@capacitor/filesystem';
import { isPlatform } from '@ionic/core';

const backendUrl =
  process.env.APP_BACKEND_URL || 'https://record.axanationaltrust.com';

const indiciaUrl =
  process.env.APP_BACKEND_INDICIA_URL || 'https://warehouse1.indicia.org.uk';

const appTitle =
  process.env.APP_TITLE || 'Anguilla App';

const appCustomLogo =
  process.env.APP_CUSTOM_LOGO || '';

const appAboutHtml =
  process.env.APP_ABOUT_HTML ||
  `
    <p>
      The Anguilla National Trust (ANT) was founded in 1989 with the mandate 
      to sustain the island’s natural and cultural heritage through active 
      management and education for the benefit of today’s and tomorrow’s 
      generations.
    </p>
    </br>
    <p>
      The ANT has remained true to that mandate and, since its formation, we 
      have been instrumental in the creation of Anguilla’s national parks, 
      conservation areas, and heritage sites and continue to be involved in 
      their day-to-day management.
    </p>
    </br>
    <p>
      We conduct essential research and conservation work, including habitat 
      and species monitoring and we work year-round to raise public 
      awareness about the fragility, complexity, and beauty of the island’s 
      natural and cultural resources.
    </p>
    </br>
    <p>
      Above all, we act as voice for Anguilla’s national heritage. The ANT 
      has been in housed in the Old Customs Building in The Valley since 
      1991.
    </p>`;

const appMapLatitude = Number(process.env.APP_MAP_LATITUDE || 18.23);
const appMapLongitude = Number(process.env.APP_MAP_LONGITUDE || -63.04);
const appMapZoom = Number(process.env.APP_MAP_ZOOM || 10);

const CONFIG = {
  environment: process.env.NODE_ENV as string,
  version: process.env.APP_VERSION as string,
  build: process.env.APP_BUILD as string,
  appTitle,
  appAboutHtml,
  appMapLatitude,
  appMapLongitude,
  appMapZoom,

  sentryDNS: process.env.APP_SENTRY_KEY as string,

  map: {
    mapboxApiKey: process.env.APP_MAPBOX_MAP_KEY as string,
  },

  backend: {
    url: backendUrl,
    clientId: process.env.APP_BACKEND_CLIENT_ID as string,
    clientPass: process.env.APP_BACKEND_CLIENT_PASS as string,

    mediaUrl: `${indiciaUrl}/upload/`,

    indicia: {
      url: indiciaUrl,
    },
  },

  dataPath: '',
};

(async function getMediaDirectory() {
  if (isPlatform('hybrid')) {
    const { uri } = await Filesystem.getUri({
      path: '',
      directory: FilesystemDirectory.Data,
    });
    CONFIG.dataPath = uri;
  }
})();

export default CONFIG;
