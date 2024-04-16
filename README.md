# Anguilla recording app

This codebase includes a Progressive Web Application (PWA) that combines offline functionality, secure OAuth2 user authentication, and data uploads to the Indicia warehouse. The application is designed to be user-friendly, offering seamless access and interaction even without an internet connection. It uses a Drupal and Indicia installation with the (IForm Layout Builder)[https://github.com/Indicia-Team/drupal-module-iform-layout-builder] module to support building customisable forms which can be dynamically synchronised into the app.

## Drupal configuration

The app requires a Drupal installation configured with Indicia online recording modules, including:
* (iform)[https://github.com/Indicia-Team/drupal-8-module-iform]
* (IForm Layout Builder)[https://github.com/Indicia-Team/drupal-module-iform-layout-builder]
* (Indicia API)[https://github.com/Indicia-Team/drupal-8-module-indicia-api].

Enable the core Rest module, then install the following modules using Composer and enable them:
* (Simple OAuth (OAuth2) & OpenID Connect)[https://www.drupal.org/project/simple_oauth]
* (Rest UI)[https://www.drupal.org/project/restui].
* (User registration password)[https://www.drupal.org/user_registrationpassword)]

Plus the following custom modules:
  * User registration password REST - from your modules/custom folder:
    ```bash
    git clone https://github.com/FlumensIO/user_registrationpassword_rest
    ```
    then install using the Drupal UI.

The Simple OAuth (OAuth2) & OpenID Connect module needs (this patch)[https://raw.githubusercontent.com/FlumensIO/simple_oauth_patches/main/simple_oauth.patch] to enable login via email address.

Now install the module using the Drupal UI. Go to Configuration > People > Simple OAuth to access the configuration page. If you do not already have a public/private key pair set up for JWT access to the warehouse for this website, then click the Generate Keys button to generate a public/private key pair; you can specify your private files directory to generate the key pair in (e.g. sites/default/files/private), then save the configuration.

Copy the contents of the generated public key to the warehouse's website configuration and ensure the URL is correct, including the protocol.

On the Clients tab, edit the default consumer provided and set the label to the name of the app, specify a client ID (which could be similar to the label in lowercase, with underscores instead of spaces), create a password and enter it in the New Secret field, tick the options "Is Confidential?" and "Is this consumer 3rd party" then save the consumer. Ensure that you keep the secret you used safe as you will need it later.

On the server that hosts Drupal, you will need to enable CORS in the server configuration so that the app is able to access it. For example, add CORS config to sites/default/services.yml by replacing the `cors.config` section as follows. If the file missing then first copy from default.services.yml.
```yaml
cors.config:
    enabled: true
    # Specify allowed headers, like 'x-allowed-header'.
    allowedHeaders: ['authorization', 'x-api-key', 'content-type']
    # Specify allowed request methods, specify ['*'] to allow all possible ones.
    allowedMethods: ['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE']
    # Configure requests allowed from specific origins.
    allowedOrigins: ['*']
    # Sets the Access-Control-Expose-Headers header.
    exposedHeaders: false
    # Sets the Access-Control-Max-Age header.
    maxAge: false
    # Sets the Access-Control-Allow-Credentials header.
    supportsCredentials: false
```

On the warehouse that you are using, ensure that the rest_api module is installed, with the jwtUser authentication method and the allow_cors settings set to TRUE.

To configure the Rest endpoints, go to admin/config/services/rest in Drupal then:
* Enable the Indicia form layout endpoint. Allow GET with accepted format json. Set the oauth2 authentication provider and save it.
* Apply the same settings to Indicia form layout list.
* Enable the User registration password endpoint. Allow methods POST, set the accepted format to json. Set the oauth2 authentication provider and save it.
* Enable the Indicia form layout endpoint. Allow GET with accepted format json. Set the oauth2 authentication provider and save it.

Enable `Access POST on User registration with password resource` to `Anonymous User` in `admin/people/permissions`.
Enable `Cancel own user account` to `Authenticated User` in `admin/people/permissions`.

## Building

For developers, the app's configuration is centralized in the `src/common/config.ts` file.

To build this codebase, ensure you have Node 16 or higher installed on your development environment (tested on npm 10.2.3 and node 18.19.0). Before initiating the build process, you must set the following environment variables:
* `APP_TITLE`
* `APP_ABOUT_HTML` - About page HTML text
* `APP_CUSTOM_LOGO` - name of a custom logo PNG file for the app. The file must be placed in src/Home/Menu/Main before building.
* `APP_MAP_LATITUDE` - latitude of the default map position
* `APP_MAP_LONGITUDE` - longitude of the default map position
* `APP_MAP_ZOOM` - default zoom level for the map
* `APP_BACKEND_URL` - URL of the Drupal site
* `APP_BACKEND_INDICIA_URL` - URL of the Indicia warehouse.
* `APP_BACKEND_CLIENT_ID` (from Drupal 8+ simple_oauth module, Clients tab on the module config page, using the client ID you provided when setting the client up),
* `APP_BACKEND_CLIENT_PASS` (from Drupal 8+ simple_oauth module, Clients tab on the module config page, using the secret you provided when setting the client up),
* `APP_SENTRY_KEY`,
* `APP_MAPBOX_MAP_KEY`.

These variables are essential for connecting to the app's Drupal services, error monitoring through Sentry, and integrating map functionality via Mapbox, respectively. You can specify them by saving a .env file in the root folder of the code, containing the following content and replacing the values as appropriate:
```
export APP_TITLE=My recording app
export APP_CUSTOM_LOGO=my_logo.png
export APP_ABOUT_HTML=<p>An introduction to my app.</p><p>Further information in a second paragraph.</p>
export APP_MAP_LATITUDE=50.827
export APP_MAP_LONGITUDE=2.045
export APP_MAP_ZOOM=11
export APP_BACKEND_URL=https://mydrupalsite.org
export APP_BACKEND_INDICIA_URL=https://mywarehouse.org
export APP_BACKEND_CLIENT_ID=my_client_id
export APP_BACKEND_CLIENT_PASS=my_secret
export APP_SENTRY_KEY=my_sentry_key
export APP_MAPBOX_MAP_KEY=my_mapbox_key
```

To obtain a Sentry key, register and create a project on Sentry.io then the key is available on the project settings page > SDK Setup > Client Keys (DSN).

### Development

1. Run `npm i`
2. Run `npm start`

### Production

1. Run `npm i`
2. Run `APP_BUILD=123 npm run build:production`
3. Serve the resulting build. The app is compiled into a number of files within the `./build` folder which can be hosted on a site.

> Note: This is essentially a bunch of static files, so no specific runtime is required but currently, there are three requirements:
>
> 1. It is designed to run at the root path of a domain name. So you can place this anywhere on the server as long as it is served from the root path - assigning a subdomain should work well for this.
> 2. It needs a fallback route rule. The app is entered through a static index.html file at the root path, but its navigation will change the URL path, so refreshing the page will result in a 404. To fix this, any path should fallback to the index.html. Probably every server/proxy has some sort of option for this, e.g apache, nginx.
> 3. The app must be served using https as it uses features unavailable using http.
