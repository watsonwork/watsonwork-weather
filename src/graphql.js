// Utility function that runs a GraphQL query

import * as request from 'request';
import * as util from 'util';
import assert from 'assert';
import debug from 'debug';

// Setup debug log
const log = debug('watsonwork-weather-graphql');

// Run the given GraphQL query
export const query = (q, token, cb) => {
  // log('Running query %s', q);
  request.post('https://api.watsonwork.ibm.com/graphql', {
    headers: {
      jwt: token,
      'content-type': 'application/graphql'
    },
    body: q

  }, (err, val) => {
    if(err) {
      // Error communicating with the GraphQL service
      log('Error calling GraphQL service %o', err);
      cb(err);
      return;
    }

    // log('GraphQL response code %d', val.statusCode);
    if(val.statusCode != 200) {
      // GraphQL service error
      cb({
        statusCode: val.statusCode,
        message: 'Error code from GraphQL service'
      });
      return;
    }

    let body;
    try {
      body = JSON.parse(val.body);
      assert(body);
    }
    catch(err) {
      // Something is wrong with the query result body
      log('Error parsing query result %o', err);
      cb(err);
      return;
    }

    if(body.errors && body.errors.length) {
      // GraphQL returned query errors
      log('GraphQL query errors %o', body.errors);
      cb({
        errors: body.errors,
        message: 'GraphQL query errors'
      });
      return;
    }

    // log('GraphQL response body %s',
    //   util.inspect(body, { colors: debug.useColors(), depth: 10 }));
    cb(null, body);
  });
};
