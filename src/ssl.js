// Return HTTPS server SSL configuration

// Feel free to adapt to your particular security and hosting environment

import * as fs from 'fs';
import debug from 'debug';

// Debug log
const log = debug('watsonwork-weather-ssl');

// Return HTTPS server SSL configuration
export const conf = (env, cb) => {
  // Read configured SSL cert and key
  log('Reading SSL cert');
  fs.readFile(env.SSLCERT || './server.crt', (err, cert) => {
    if(err) {
      log('Error reading SSL cert %o', err);
      cb(err);
      return;
    }
    fs.readFile(env.SSLKEY || './server.key', (err, key) => {
      if(err) {
        log('Error reading SSL key %o', err);
        cb(err);
        return;
      }
      cb(null, {
        cert: cert,
        key: key
      });
    });
  });
};

