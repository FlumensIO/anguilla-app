require('dotenv').config({ silent: true });
const webpack = require('webpack');
const appConfig = require('@flumens/webpack-config');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const required = [
  'APP_BACKEND_CLIENT_ID',
  'APP_BACKEND_CLIENT_PASS',
  'APP_SENTRY_KEY',
  'APP_MAPBOX_MAP_KEY',
];

const development = {
  APP_BACKEND_URL: '',
  APP_BACKEND_INDICIA_URL: '',
  APP_TITLE: '',
  APP_ABOUT_HTML: '',
  APP_MAP_LATITUDE: '',
  APP_MAP_LONGITUDE: '',
  APP_MAP_ZOOM: '',
};

if (process.env.NODE_ENV === 'production') {
  appConfig.plugins.push(
    new CopyPlugin({ patterns: [{ from: 'other/demo.html', to: '.' }] })
  );

  appConfig.plugins.push(
    new WorkboxPlugin.GenerateSW({
      navigateFallback: '/index.html',
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 15000000,
    })
  );
}

// appConfig.devServer.devMiddleware = {
//   index: true,
//   mimeTypes: { phtml: 'text/html' },
//   publicPath: '/',
//   serverSideRender: true,
//   writeToDisk: true,
// };

appConfig.module.rules.push({
  test: /manifest\.json/,
  type: 'javascript/auto',
  use: {
    loader: 'file-loader',
    options: {
      name: 'manifest.json',
    },
  },
});

appConfig.plugins.unshift(
  new webpack.EnvironmentPlugin(required),
  new webpack.EnvironmentPlugin(development)
);

module.exports = appConfig;
