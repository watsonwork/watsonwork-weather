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
    if (err)
      return;

        // Ignore messages from the app itself
    if (message.createdBy.id === appId)
      return;

        // Return the extracted info, annotation, annotated message
        // and the user who sent it
        log('Message %s',
          util.inspect(message, { colors: debug.useColors(), depth: 10 }));
    cb(info, annotation, message, message.createdBy);
  });
};

// Return the action identified in an annotation event
export const onIntent = (evt, appId, token, cb) => {
  log('Annotation event!');
  // Check for a focus annotation
  if(evt.type === 'message-annotation-added' &&
    evt.annotationType === 'message-focus') {

    // Call back with any action found on the focus annotation
    const focus = JSON.parse(evt.annotationPayload);
    if(focus.applicationId === appId) {
      const intent = focus.lens;
      if(intent) {
        log('Idenfified intent %s', intent);
        callback(evt, appId, intent, focus, token, cb);
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
// // Return the intent recognized in an annotation event
// export const onAnnotation = (evt, appId, token, cb) => {
//
//     // Check for an entities annotation
//     // if(evt.type === 'message-annotation-added' &&
//     //   evt.annotationType === 'message-nlp-entities') {
//     //
//     //   // Call back with any recognized entities
//     //   const nlp = JSON.parse(evt.annotationPayload);
//     //   if(nlp.entities.length) {
//     //   //  log('Idenfified entities %o', nlp.entities);
//     //     callback(evt, appId, nlp.entities, nlp, token, cb);
//     //   }
//     // }
//
//     // intent identified
//     if (evt.type === 'message-annotation-added') {
//       const nlp = JSON.parse(evt.annotationPayload);
//         if (evt.userId === 'toscana-service-watson-conversation-client-id') {
//             callback(evt, appId, nlp.entities, nlp, token, cb);
//         }
//         // else {
//           log(evt);
//           log('_____________________________');
//         // }
//     }
//
//
// };
