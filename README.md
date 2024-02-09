# Anguilla recording app

This codebase includes a Progressive Web Application (PWA) that combines offline functionality, secure OAuth2 user authentication, and data uploads to the Indicia warehouse. The application is designed to be user-friendly, offering seamless access and interaction even without an internet connection.

## Building

For developers, the app's configuration is centralized in the `src/common/config.ts` file.

To build this codebase, ensure you have Node 16 or higher installed on your development environment. Before initiating the build process, you must set the following environment variables: `APP_BACKEND_CLIENT_ID`, `APP_BACKEND_CLIENT_PASS` (from Drupal 8+ simple_oauth module), `APP_SENTRY_KEY`, and `APP_MAPBOX_MAP_KEY`. These variables are essential for connecting to the app's Drupal services, error monitoring through Sentry, and integrating map functionality via Mapbox, respectively.

### Development

1. Run `npm i`
2. Run `npm start`

### Production

1. Run `npm i`
2. Run `APP_BUILD=123 npm run build:production`
3. Serve the resulting build. The app is compiled into a number of files within the `./build` folder which can be hosted on a site.

> Note: This is essentially a bunch of static files, so no specific runtime is required but currently, there are two requirements:
>
> 1. It is designed to run at the root path of a domain name. So you can place this anywhere on the server as long as it is served from the root path - assigning a subdomain should work well for this.
> 2. It needs a fallback route rule. The app is entered through a static index.html file at the root path, but its navigation will change the URL path, so refreshing the page will result in a 404. To fix this, any path should fallback to the index.html. Probably every server/proxy has some sort of option for this, e.g apache, nginx.
