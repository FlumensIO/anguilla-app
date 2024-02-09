import GPS from 'mock-geolocation';
import track from './track.json';

const testing = {};

testing.GPS = {
  mock: GPS.use,

  /**
   * GPS.update({ latitude: 1, longitude: -1, accuracy: 12 })
   *
   * @param options
   * @returns {*}
   */
  update(location) {
    if (location instanceof Array) {
      this.interval = setInterval(() => {
        if (!location.length) {
          this.stop();
          return;
        }

        const [longitude, latitude] = location.shift();
        console.log({ latitude, longitude, accuracy: 1 });
        this.update({ latitude, longitude, accuracy: 1 });
      }, 2000);
      return;
    }

    GPS.change(location);
  },

  simulate() {
    this.mock();
    this.update(track.features[0].geometry.coordinates[0]);
  },

  stop() {
    if (this.interval || this.interval === 0) {
      clearInterval(this.interval);
    }
  },
};

window.testing = testing;
