// Functions that use the Weather.com REST API to return current weather
// conditions and a weather forecast

import { get } from 'request';
import { geolocation } from './geocode';
import debug from 'debug';

// Setup debug log
const log = debug('watsonwork-weather-weather');

// Return the current weather conditions at an address
export const conditions = (address, wuser, wpassword, cb) => {
  // Get the geolocation of the address
  return geolocation(address, wuser, wpassword, (err, geo) => {
    if(err) {
      // Geolocation error
      cb(err);
      return;
    }
    if(geo.latitude === undefined) {
      // Address not found
      cb(null, { geo: geo });
      return;
    }

    // Get the weather conditions
    log('Retrieving conditions at %d %d', geo.latitude, geo.longitude);
    get('https://twcservice.mybluemix.net/api/weather/v1/geocode/' +
      geo.latitude + '/' + geo.longitude + '/observations/timeseries.json', {
        qs: {
          language: 'en-US',
          hours: 23
        },
        auth: {
          user: wuser,
          pass: wpassword
        },
        json: true
      }, (err, val) => {
        if(err) {
          // Error communicating with the weather service
          log('Error calling weather service %o', err);
          cb(err);
          return;
        }

        log('Weather conditions response %d %o', val.statusCode, val.body);
        if(val.statusCode != 200) {
          // Weather service error
          cb({
            statusCode: val.statusCode,
            message: 'Couldn\'t retrieve weather conditions'
          });
          return;
        }
        if(!(val.body.observations && val.body.observations[0])) {
          // Coulnd't find an observation
          cb({
            message: 'Couldn\'t find weather conditions'
          });
          return;
        }

        cb(null, {
          geo: geo,
          observation: val.body.observations[val.body.observations.length - 1]
        });
      });
  });
};

// Return a 5 day weather forecast at an address
export const forecast5d = (address, wuser, wpassword, cb) => {
  // Get the geolocation of the address
  return geolocation(address, wuser, wpassword, (err, geo) => {
    if(err) {
      // Geolocation error
      cb(err);
      return;
    }

    if(geo.latitude === undefined) {
      // Address not found
      cb(null, { geo: geo });
      return;
    }

    // Get the weather forecast 
    log('Retrieving forecast for %d %d', geo.latitude, geo.longitude);
    get('https://twcservice.mybluemix.net/api/weather/v1/geocode/'
      + geo.latitude + '/' + geo.longitude + '/forecast/daily/5day.json', {
        json: true,
        qs: {
          language: 'en-US'
        },
        auth: {
          user: wuser,
          pass: wpassword
        }
      }, (err, val) => {
        if(err) {
          // Error communicating with the weather service
          log('Error calling weather service %o', err);
          cb(err);
          return;
        }

        log('Weather forecast response %d %o', val.statusCode, val.body);
        if(val.statusCode != 200) {
          // Weather service error
          cb({
            statusCode: val.statusCode,
            message: 'Couldn\'t retrieve weather forecast'
          });
          return;
        }
        if(!val.body.forecasts) {
          // Coulnd't find a forecast
          cb({
            message: 'Couldn\'t find weather forecast'
          });
          return;
        }

        cb(null, {
          geo: geo,
          forecasts: val.body.forecasts
        });
      });
  });
};

