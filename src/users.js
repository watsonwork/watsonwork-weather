// Utility function that returns a user's information

import * as util from 'util';
import * as graphql from './graphql';
import debug from 'debug';

// Setup debug log
const log = debug('watsonwork-weather-users');

// Return user with the given id
export const user = (userId, token, cb) => {
  log('Getting user %s', userId);
  graphql.query(util.format(`
    query {
      person(id: "%s") {
        id
        displayName
        email
      }
    }`, userId),
    token, (err, res) => {
      if(err) {
        if(err.errors) {
          cb(null, {});
          return;
        }
        cb(err);
        return;
      }

      let user;
      try {
        // Expect a GraphQL result like this:
        // data: {
        //   person: {
        //     id: '...',
        //   }
        // }

        user = res.data.person;
      }
      catch(err) {
        log('Error getting user %o', err);
        cb(null, {});
        return;
      }

      // Return user
      log('User %s',
        util.inspect(user, { colors: debug.useColors(), depth: 10 }));
      cb(null, user);
    });
};

