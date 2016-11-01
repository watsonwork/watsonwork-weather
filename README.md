# Weather App Sample

[![Build Status](https://travis-ci.org/watsonwork/watsonwork-sender.svg)](https://travis-ci.org/watsonwork/watsonwork-weather)

App built with node.js to query weather information (and perhaps in the future proactive provide weather alerts).

This app will listen for `@weather <zipcode>` and give you some cool data (US zipcodes for now)

## Deploy the app
Assuming you just want to take this code and get it running before hacking it, the first step is to get it deployed to a live on a server so that IBM Watson Workspace validates it's up and working before pushing messages to the app. To facilitate things, you can click the button below and it'll get it going to Bluemix very easily.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/watsonwork/watsonwork-weather)

*Note*: you can run this code locally, but then you would need to change the webhook code to get the URL of the callback. See Appendix for instructions.

Once the code is live, make note of the URL (e.g. http://mysuperawesomeurl.mybluemix.net) as you'll need this later.

## How to register the Weather App with IBM Watson Workspace
Now let's register the app to get some API keys to get things going. We need an API key from weatherunderground.com to be able to call their services. To do that, head out to [this URL](https://www.wunderground.com/weather/api/) and follow the steps to get the key. Once you get that key, store it in the environment variable `WEATHER_KEY`.

Now, let's register the app with IBM Watson Workspace and get some keys!

1. Go to [the developer apps page](https://workspace.ibm.com/developer/apps)
2. On the left, enter the `App Name` and the `Description of App`
3. Click on `Add an outbound webhook`
4. Give the webhook a name (e.g. "listen for messages") and check the `message-created` webhook. This is how we'll listen to messages in a space
5. In the callback URL, specify the URL for your app. This code assumes that the webhook listener is at `https://yoururl/webhook` so don't forget to add `/webhook` to the end of the URL (if you don't know where the app will be deployed, use a sample URL for now, like `https://weather.acme.com/webhook` and you can modify that later)
6. Click on `Register app`
7. This will give you the App ID, App secret and webhook secret. You *need to save* these to environment variables called `WEATHER_CLIENT_ID`, `WEATHER_CLIENT_SECRET`, `WEATHER_WEBHOOK_SECRET` respectively

At this point the webhook is not enabled since the system has not been able to verify it's up and running. While the webhook is probably running on Bluemix, it doesn't have the variables set

## Configure your app

Now that we have the API keys, let's configure it

1. Go to `https://console.ng.bluemix.net/dashboard/applications/` and click on your app
2. Go to Runtime -> Environment Variables
3. Define the 4 variables from above: `WEATHER_CLIENT_ID`, `WEATHER_CLIENT_SECRET`, `WEATHER_WEBHOOK_SECRET` and `WEATHER_KEY`, provide the right values and save them.
4. Click the circular arrow to restart the app so the values take effect.

You are almost there!!! 

## Enable the webhook

1. Assuming all environment variables are set (see above), go back to the [apps page](https://workspace.ibm.com/developer/apps) and click on the pencil icon to edit your app
2. Check the box to enable your webhook
3. Save your changes by clicking on "Edit app"

This now does an HTTP POST verification call to ensure your webhook is setup properly. This will also ensure that all your variables and code are good to go. If so, the webhook is now enabled and it's ready to be used! How easy was that!?!

## Add the Weather app to a space to test
We are almost there! Now we need to add the app to spaces that we want to listen for messages, and where the app will post messages to.

1. Head out to `https://workspace.ibm.com` and go to your favorite space
2. Go into the space settings
3. Click on `Apps` to go the apps menu
4. Click on your app to add it to the space
5. Type in `@weather 90210` and the app should respond with the current weather conditions in Beverly Hills, CA

Have fun!!

## Appendix: How to Start Weather app locally
1. Run `npm install` to install dependencies
2. Run `npm run build` to compile the code
3. Set the environment variables as per above.
4. Run `npm start`
5. The server will now run on localhost:3000.

You can use curl to submit a query and test it (or just deploy to Bluemix and test it there!) to simulate a call from Workspace to your webhook. 

## License and Dependencies
Licensed under Apache 2.0 (see LICENSE)

Depends on:
* body-parser
* express
* request
* node-weatherunderground
* request
* zipcode
