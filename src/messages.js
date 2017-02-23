// Utility functions to work with Watson Work messages

import * as util from 'util';
import * as graphql from './graphql';
import * as request from 'request';
import debug from 'debug';

// Setup debug log
const log = debug('watsonwork-weather-messages');

// Return message with the given id
export const message = (messageId, token, cb) => {
  log('Getting message %s', messageId);
  graphql.query(util.format(`
    {
      message(id: "%s") {
        id
        created
        createdBy {
          id
          extId
          email
          displayName
        }
        content
        annotations
      }
    }`, messageId),
    token, (err, res) => {
      if(err) {
        if(err.errors) {
          cb(null, {});
          return;
        }
        cb(err);
        return;
      }

      let message;
      try {
        // Expect a GraphQL result like this:
        // data: {
        //   message: {
        //     id: '...',
        //     contentType: 'text/html',
        //     content: 'text of the message',
        //     annotations: [...]
        //   }
        // }

        message = res.data.message;
        // Parse annotations
        message.annotations = message.annotations.map((a) => JSON.parse(a));
      }
      catch(err) {
        log('Error getting message %o', err);
        cb(null, {});
        return;
      }

      // Return message
      // log('Message %s',
      //  util.inspect(message, { colors: debug.useColors(), depth: 10 }));
      cb(null, message);
    });
};

// Send a message template to the conversation in a space
export const send = (spaceId, title, text, actor, token, cb) => {
  request.post(
    'https://api.watsonwork.ibm.com/v1/spaces/' + spaceId + '/messages', {
      headers: {
        Authorization: 'Bearer ' + token
      },
      json: true,
      // An App message can specify a color, a title, markdown text and
      // an 'actor' useful to show where the message is coming from
      body: {
        type: 'appMessage',
        version: 1.0,
        annotations: [{
          type: 'generic',
          version: 1.0,

          color: '#6CB7FB',
          title: title,
          text: text,

          actor: {
            name: actor
          }
        }]
      }
    }, (err, res) => {
      if(err || res.statusCode !== 201) {
        log('Error sending message %o', err || res.statusCode);
        if(cb)
          cb(err || new Error(res.statusCode));
        return;
      }
      log('Send result %d, %o', res.statusCode, res.body);
      if(cb)
        cb(null, res.body);
    });
};

