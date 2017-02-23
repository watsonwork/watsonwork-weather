// Functions that use the Weather.com REST API to return a geolocation,
// current weather conditions and a weather forecast

import { get } from 'request';
import debug from 'debug';

// Setup debug log
const log = debug('watsonwork-weather-geocode');

// Return the geographic coordinates of a US city
export const geolocation = (city, wuser, wpassword, cb) => {
  log('Retrieving geolocation of %s', city);
  get('https://twcservice.mybluemix.net/api/weather/v3/location/search', {
    json: true,
    qs: {
      query: city.trim(),
      countryCode: 'US',
      language: 'en-US',
      locationType: 'city'
    },
    auth: {
      user: wuser,
      pass: wpassword
    }
  }, (err, val) => {
    if(err) {
      // Error communicating with the geolocation service
      log('Error calling geolocation service %o', err);
      cb(err);
      return;
    }

    log('Geolocation response code %d body %o', val.statusCode, val.body);
    if(val.statusCode != 200) {
      // Geolocation service error
      cb({
        statusCode: val.statusCode,
        message: 'Couln\'t retrieve city information'
      });
      return;
    }
    if(!(val.body.location &&
      val.body.location.city && val.body.location.city[0] &&
      val.body.location.postalCode && val.body.location.postalCode[0])) {
      // City not found
      cb(null, {});
      return;
    }

    cb(null, {
      city: val.body.location.city[0],
      postalCode: val.body.location.postalCode[0],
      adminDistrictCode: val.body.location.adminDistrictCode[0],
      latitude: val.body.location.latitude[0],
      longitude: val.body.location.longitude[0]
    });
  });
};

