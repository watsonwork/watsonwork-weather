// Utility functions to persist action state on a space and user basis

import PouchDB from 'pouchdb-node';
import memdown from 'memdown';
import debug from 'debug';

// Setup debug log
const log = debug('watsonwork-weather-state');

// Return a store that can be used to persist action state
export const store = (uri = 'state') => {
  log('Opening action state db %s', uri);
  return /:/.test(uri) ? new PouchDB(uri) : new PouchDB(uri, { db: memdown });
};

// Get the action state for a space / user / dialog
export const get = (spaceId, userId, store, cb) => {
  log('Getting action state for %s %s', spaceId, userId);
  store.get([spaceId, userId].join('-'), (err, res) => {
    log('Get err %o result %o', err, res);
    cb(err, res);
  });
};

// Store the action state for a space / user / dialog
export const put = (spaceId, userId, astate, store, cb) => {
  astate._id = [spaceId, userId].join('-');
  log('Putting action state for %s %s %o', spaceId, userId, astate);
  store.put(astate, (err, res) => {
    log('Put err %o result %o', err, res);
    if(cb)
      cb(err, res);
  });
};

// Run an action function with a state, i.e. a function that takes an action
// state and calls back with a new state
export const run = (spaceId, userId, store, fn, cb) => {
  // Get the action state
  get(spaceId, userId, store, (err, ostate) => {

    // Run the action function
    fn(ostate || {}, (err, nstate) => {
      if(err)
        return;
      // Store the new action state
      put(spaceId, userId, nstate, store, cb);
    });
  });
};

