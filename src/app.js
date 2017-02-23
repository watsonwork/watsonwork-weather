// A sample app that listens to messages posted to a space in IBM
// Watson Workspace and implements actions that return the weather.

import express from 'express';
import * as util from 'util';
import * as bparser from 'body-parser';
import * as http from 'http';
import * as https from 'https';
import * as oauth from './oauth';
import * as ssl from './ssl';
import * as sign from './sign';
import * as messages from './messages';
import * as events from './events';
import * as state from './state';
import * as twc from './weather';
import debug from 'debug';

// Debug log
const log = debug('watsonwork-weather-app');

// Handle events sent to the Weather action Webhook at /weather
export const weather = (appId, store, wuser, wpassword, token) =>
  (req, res) => {
    // log('Received body %o', req.body);

    // Get the space containing the conversation that generated the event
    const spaceId = req.body.spaceId;

    // A utility function that sends a message back to the conversation in
    // that space
    const send = (message) => {
      messages.send(spaceId,
        message.title, message.text, message.actor, token());
    };

    // Respond to the Webhook right away, as any response messages will
    // be sent asynchronously
    res.status(201).end();

    // Handle messages identified as action requests
    events.onAction(req.body, appId, token,
      (action, focus, message, user) => {

        // Run with any previously saved action state
        state.run(spaceId, user.id, store, (astate, cb) => {

          // Remember the action being requested and the message that
          // requested it
          astate.message = message;
          astate.action = action;

          // Look for a city in the request, default to last city used
          const city =
            cityAndState(focus.extractedInfo.entities) || astate.city;

          if(city) {
            // Remember the city
            astate.city = city;

            // Ask the user to confirm
            if(action === 'Get_Weather_Conditions')
              send(confirmConditions(city, user));

            else if(action === 'Get_Weather_Forecast')
              send(confirmForecast(city, user));
          }
          else
            // Need a city, ask for it
            send(whichCity(user));

          // Return the new action state
          cb(null, astate);
        });
      });

    // Handle steps within an action, determined from user input
    events.onActionNextStep(req.body, appId, token,
      (next, focus, message, user) => {

        // Run with any previously saved action state
        state.run(spaceId, user.id, store, (astate, cb) => {

          // Proceed with the action and send the weather conditions or a
          // weather forecast
          if(next === 'Proceed' && astate.city) {

            if(astate.action === 'Get_Weather_Conditions') {
              // Get the weather conditions
              twc.conditions(astate.city,
                wuser, wpassword, (err, conditions) => {
                  if(err) {
                    send(weatherError());
                    return;
                  }
                  if(!conditions.geo && conditions.geo.city) {
                    // Tell the user that the given city couldn't be found
                    send(cityNotFound(astate.city, user));
                    return;
                  }

                  // Return the weather conditions
                  send(weatherConditions(conditions, user));

                  // Reset the weather action as it's now complete
                  delete astate.action;
                  cb(null, astate);
                });
              return;
            }

            if(astate.action === 'Get_Weather_Forecast') {
              // Get a weather forecast
              twc.forecast5d(astate.city,
                wuser, wpassword, (err, forecast) => {
                  if(err) {
                    send(weatherError());
                    return;
                  }
                  if(!forecast.geo && forecast.geo.city) {
                    // Tell the user that the given city couldn't be found
                    send(cityNotFound(astate.city, user));
                    return;
                  }

                  // Return weather forecast
                  send(weatherForecast(forecast, user));

                  // Reset the weather action as it's now complete
                  delete astate.action;
                  cb(null, astate);
                });
              return;
            }
          }

          // Cancel the action
          if((astate.action === 'Get_Weather_Conditions' ||
            astate.action === 'Get_Weather_Forecast') &&
            next === 'Cancel') {
            send(noProblem(user));

            // Forget the weather action and city as that was not what the
            // user wanted
            delete astate.action;
            delete astate.city;
            cb(null, astate);
          }
        });
      });

    // Handle mentions of entities in messages
    events.onEntities(req.body, appId, token,
      (entities, nlp, message, user) => {

        // Run with any previously saved action state
        state.run(spaceId, user.id, store, (astate, cb) => {

          // Look for a city and state in the extracted entities
          const city = cityAndState(entities);
          if(city) {
            astate.city = city;
            if(message.id !== astate.message.id)

              // Ask for a confirmation to get the weather conditions or
              // weather forecast in the recognized city
              if(astate.action === 'Get_Weather_Conditions')
                send(confirmConditions(city, user));

              else if(astate.action === 'Get_Weather_Forecast')
                send(confirmForecast(city, user));
          }

          // Return the new action state
          cb(null, astate);
        });
      });
  };

// Extract and combine city and state from a list of NL entities
const cityAndState = (entities) => {
  const city =
    (entities.filter((e) => e.type === 'City')[0] || {}).text;
  if(!city)
    return undefined;
  const state =
    (entities.filter((e) => e.type === 'StateOrCounty')[0] || {}).text;
  return state ? [city, state].join(', ') : city;
};

// The various messages the application sends

// Weather conditions
const weatherConditions = (w, user) => ({
  title: 'Weather Conditions',
  text: util.format('%s\n%sF Feels like %sF\n%s%s',
    [w.geo.city, w.geo.adminDistrictCode].join(', '),
    w.observation.temp,
    w.observation.feels_like,
    w.observation.wx_phrase,
    w.observation.terse_phrase ?
      '. ' + w.observation.terse_phrase : ''),
  actor: 'The Weather Company'
});

// Weather forecast
const weatherForecast = (w, user) => ({
  title: 'Weather Forecast',
  text: util.format('%s%s',
    [w.geo.city, w.geo.adminDistrictCode].join(', '),
    w.forecasts.reduce((a, f) => a +
      util.format('\n%s %sF %sF %s',
        f.dow.slice(0, 3),
        f.max_temp || '--', f.min_temp || '--',
        f.narrative.split('.')[0]),
      '')),
  actor: 'The Weather Company'
});

// Ask for a confirmation to get the weather conditions
const confirmConditions = (city, user) => ({
  text: util.format(
    'Hey %s, I think you\'re looking for the weather conditions ' +
   'in %s.\nIs that correct?', user.displayName, city)
});

// Ask for a confirmation to get a weather forecast
const confirmForecast = (city, user) => ({
  text: util.format(
    'Hey %s, I think you\'re looking for a weather forecast in %s.\n' +
    'Is that correct?', user.displayName, city)
});

// Ask which city to get weather for
const whichCity = (user) => ({
  text: util.format(
    'Hey %s, I can get the weather for you but I need a city name.\nYou can ' +
    'say San Francisco, or Littleton, MA for example.', user.displayName)
});

// Ask to clarify a city that cannot be found
const cityNotFound = (city, user) => ({
  text: util.format(
    'Hey %s, I couldn\'t find %s, I need a valid city.',
    user.displayName, city)
});

// Say OK
const noProblem = (user) => ({
  text: util.format('OK %s, no problem.', user.displayName)
});

// Create Express Web app
export const webapp =
  (appId, secret, whsecret, store, wuser, wpassword, cb) => {
    // Authenticate the app and get an OAuth token
    oauth.run(appId, secret, (err, token) => {
      if(err) {
        cb(err);
        return;
      }

      // Return the Express Web app
      cb(null, express()

        // Configure Express route for the app Webhook
        .post('/weather',

          // Verify Watson Work request signature and parse request body
          bparser.json({
            type: '*/*',
            verify: sign.verify(whsecret)
          }),

          // Handle Watson Work Webhook challenge requests
          sign.challenge(whsecret),

          // Handle Watson Work Webhook events
          weather(appId, state.store(store), wuser, wpassword, token)));
    });
  };

// App main entry point
const main = (argv, env, cb) => {
  // Create Express Web app
  webapp(
    env.WEATHER_APP_ID,
    env.WEATHER_APP_SECRET,
    env.WEATHER_WEBHOOK_SECRET,
    env.WEATHER_STORE,
    env.WEATHER_TWC_USER,
    env.WEATHER_TWC_PASSWORD, (err, app) => {
      if(err) {
        cb(err);
        return;
      }

      if(env.PORT) {
        // In a hosting environment like Bluemix for example, HTTPS is
        // handled by a reverse proxy in front of the app, just listen
        // on the configured HTTP port
        log('HTTP server listening on port %d', env.PORT);
        http.createServer(app).listen(env.PORT, cb);
      }

      else
        // Listen on the configured HTTPS port, default to 443
        ssl.conf(env, (err, conf) => {
          if(err) {
            cb(err);
            return;
          }
          const port = env.SSLPORT || 443;
          log('HTTPS server listening on port %d', port);
          https.createServer(conf, app).listen(port, cb);
        });
    });
};

if (require.main === module)
  main(process.argv, process.env, (err) => {
    if(err) {
      console.log('Error starting app:', err);
      return;
    }
    log('App started');
  });

