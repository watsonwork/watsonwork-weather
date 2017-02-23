// Utility functions to work with Watson Work Webhook events

import * as messages from './messages';
import * as util from 'util';
import debug from 'debug';

// Setup debug log
const log = debug('watsonwork-weather-events');

// Call a callback function with the info extracted from an annotation
// event, the original annotated message and the user who sent it
const callback = (evt, appId, info, annotation, token, cb) => {

  // Retrieve the annotated message
  messages.message(evt.messageId, token(), (err, message) => {
    if(err)
      return;

    // Ignore messages from the app itself
    if(message.createdBy.id === appId)
      return;

    // Return the extracted info, annotation, annotated message
    // and the user who sent it
    log('Message %s',
      util.inspect(message, { colors: debug.useColors(), depth: 10 }));
    cb(info, annotation, message, message.createdBy);
  });
};

// Return the action identified in an annotation event
export const onAction = (evt, appId, token, cb) => {
  // Check for a focus annotation
  if(evt.type === 'message-annotation-added' &&
    evt.annotationType === 'message-focus') {

    // Call back with any action found on the focus annotation
    const focus = JSON.parse(evt.annotationPayload);
    if(focus.applicationId === appId) {
      const action = focus.actions && focus.actions[0];
      if(action) {
        log('Idenfified action %s', action);
        callback(evt, appId, action, focus, token, cb);
      }
    }
  }
};

// Return the next step in an action, determined from a user input
export const onActionNextStep = (evt, appId, token, cb) => {
  // Check for a focus annotation
  if(evt.type === 'message-annotation-added' &&
    evt.annotationType === 'message-focus') {

    // Call back with any action next step found on the focus annotation
    const focus = JSON.parse(evt.annotationPayload);
    if(focus.applicationId === appId) {
      const payload = JSON.parse(focus.payload);
      const next = (payload.actionNextSteps || [])[0];
      if(next) {
        log('Idenfified action next step %s', next);
        callback(evt, appId, next, focus, token, cb);
      }
    }
  }
};

// Return the entities recognized in an annotation event
export const onEntities = (evt, appId, token, cb) => {
  // Check for an entities annotation
  if(evt.type === 'message-annotation-added' &&
    evt.annotationType === 'message-nlp-entities') {

    // Call back with any recognized entities
    const nlp = JSON.parse(evt.annotationPayload);
    if(nlp.entities.length) {
      log('Idenfified entities %o', nlp.entities);
      callback(evt, appId, nlp.entities, nlp, token, cb);
    }
  }
};

