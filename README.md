# watsonwork-weather

[![Build Status](https://travis-ci.org/watsonwork/watsonwork-weather.svg)](https://travis-ci.org/watsonwork/watsonwork-weather)

A sample Watson Work cognitive app that listens to messages posted to a
space in IBM Watson Workspace, understands the natural language conversation
happening in the space and posts helpful weather information as needed in
the conversation.

The Watson Work platform provides **spaces** for people to exchange
**messages** in conversations. This sample app shows the following
aspects of a Watson Work cognitive application:

* how to implement a Watson Work application using Node.js;
* how to authenticate and obtain the OAuth token needed to make Watson Work
API calls;
* how to listen to a conversation and receive messages on a Webhook endpoint;
* how to send messages back to the conversation;
* how to use Watson Conversation to understand the conversation, identify
user intents, recognize entities like city names for example, and
decide what actions the app should execute to help in the conversation;
* how to handle a multi-turn conversation and keep track of what's being
said across multiple messages.

## Try it out

To try the sample app do the following:

### Deploying the app to IBM Bluemix

If you want to give the sample app a quick try using [Bluemix]
(https://bluemix.net), you can simply get it deployed to Bluemix straight
from Github without even having to download it to your local development
environment and build it yourself. Just click the button below:

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/watsonwork/watsonwork-weather&branch=master)

Once that's done, go to your
[Bluemix Dashboard](https://console.ng.bluemix.net/dashboard/cf-apps). The
app you've just deployed should be listed on that page. Write down its
**route** public URL (usually `https://<bluemix app name>.mybluemix.net`)
as you will need it later to register the app's Webhook endpoint with
the Watson Work platform.

### Building the app locally

You can skip this if you've just deployed the app directly to Bluemix.

To build the app in your local development environment, follow these steps:

Install Node.js 6+.

In a terminal window, do the following:
```sh
# For more verbose output
export DEBUG=watsonwork-*

# Get the code
git clone https://github.com/watsonwork/watsonwork-weather

# Build the app
cd watsonwork-weather
npm run build
```

### Configuring the Bluemix Watson Conversation service

The sample Weather app uses Watson Conversation to understand natural
language and provide a natural language conversational interface, so
you need to configure a Watson Conversation Bluemix service for it.

Go to the
[Bluemix Watson Dashboard](https://console.ng.bluemix.net/dashboard/watson)
and create a Watson Conversation service.

Note the Watson Conversation service user name and password, as you will
need to configure the Weather app with them.

From the Watson Conversation service page click **Launch tool** to open
the Watson Conversation tooling, and import **watson.json** into a new
Watson Conversation workspace.

Note the Watson Conversation workspace id, as you will need to configure the
Weather app with it.

### Configuring the Weather Company Data service

The sample Weather app uses the Weather Company Data API to retrieve
weather information, so you need to configure a Weather Company Data
Bluemix service for it.

Go to the
[Bluemix Data & Analytics Dashboard]
(https://console.ng.bluemix.net/catalog/?category=data) and create a Weather
Company Data service.

Note the Weather Company Data service user name and password, as you will
need to configure the Weather app with them.

### Registering the app with Watson Work

In your Web browser, go to [Watson Work Services / Apps]
(https://workspace.ibm.com/developer/apps) and add a new app named
**Weather** with a Webhook configured for **message-created** and
**message-annotation-added** events.

Set the Webhook **Callback URL** to a public URL targeting the server where
you're planning to run the sample app,
`https://<your server hostname>/weather` for example, or
`https://<bluemix app name>.mybluemix.net/weather` if you've deployed it
to Bluemix.

Configure the **Make It Cognitive** section of the app to use your Watson
Conversation workspace, user and password.

Save the app and write down its app id, app secret and Webhook secret.

### Starting the app on Bluemix

Go to your
[Bluemix Dashboard](https://console.ng.bluemix.net/dashboard/cf-apps),
select your app and under **Runtime** / **Environment Variables** /
**User Defined**, add the following variables:

```
WEATHER_APP_ID: <the Weather app id>                                      
WEATHER_APP_SECRET: <the Weather app secret>                              
WEATHER_WEBHOOK_SECRET: <the Weather Webhook secret>
WEATHER_TWC_USER: <your Weather company service user>
WEATHER_TWC_PASSWORD: <your Weather company service password>
DEBUG: watsonwork-*
```

Click the **> Start** button to start the app.

### Launching the app from the Bluemix DevOps Services IDE

If you've followed the above steps to deploy the app to Bluemix, it is now
also set up as a project in the [Bluemix DevOps Services](https://hub.jazz.net)
Web IDE, allowing you to edit and manage the app directly from within the IDE.

You can skip this step if you're not planning to use that Web IDE. To enable
the app to be launched directly from the IDE, edit its
[Launch Configuration](https://hub.jazz.net/tutorials/livesync/#launch_configuration)
and under **Manifest Settings**, set its launch **Command** to:

```
npm install babel-cli@6.10.1 && npm run babel && npm start
```

### Starting the app locally

You can skip this if you've just started the app on Bluemix.

In the terminal window, do the following:
```
# Configure the app id and app secret
export WEATHER_APP_ID=<the Weather app id>
export WEATHER_APP_SECRET=<the Weather app secret>
export WEATHER_WEBHOOK_SECRET=<the Weather Webhook secret>
export WEATHER_TWC_USER: <your Weather company service user>
export WEATHER_TWC_PASSWORD: <your Weather company service password>
```

The Watson Work platform requires Webhook endpoints to use HTTPS. The
sample app listens on HTTPS port 443 and can be configured to use an SSL
certificate like follows:
```
# Configure the SSL certificate
export SSLCERT=<path to your SSL certificate in PEM format>
export SSLKEY=<path to your SSL certificate key in PEM format>

# Start the app
npm start
```

You can also use a different HTTPS port number and a self-signed certificate,
like follows:
```
# Configure the HTTPS port number
export SSLPORT=8443

# Generate a self-signed SSL certificate with /CN set to your server's
# FQDN (fully qualified domain name), www.yourcompany.com for example
openssl req -nodes -new -x509 -keyout server.key -out server.crt -subj "/CN=your server's FQDN"
export SSLCERT=server.crt
export SSLKEY=server.key

# Start the app
npm start
```

If you're running behind a HTTPS proxy, you may want to have the app listen
on HTTP instead to let the proxy handle the HTTPS to HTTP conversion, like
follows:
```
# Configure the HTTP port
export PORT=8080

# Start the app
npm start
```

Finally, if the app is running on your development machine and you don't
want to set up a public IP and domain name for it yourself, you can also
use one the tunnel tools popular for Webhook development like
[localtunnel](https://localtunnel.github.io/www/) or
[ngrok](https://ngrok.com) for example.

Here's how to use a tunnel with localtunnel:

```
# Install the localtunnel module
npm install -g localtunnel

# Set up a tunnel from https://<subdomain name>.localtunnel.me
# to localhost:8080
lt --subdomain <pick a subdomain name> --port 8080

# Configure the app HTTP port
# No need for HTTPS here as localtunnel handles it
export PORT=8080

# Start the app
npm start
```

You can now go back to
[Watson Work Services / Apps](https://workspace.ibm.com/developer/apps),  
edit the **Weather** app and set its Webhook **Callback URL** to
`https://<subdomain name>.localtunnel.me/weather`.

### Enabling the app Webhook

Now that the app is running and listening for HTTPS requests at a public URL,
you're ready to **enable** its Webhook on the Watson Work platform.

Go back to
[Watson Work Services / Apps](https://workspace.ibm.com/developer/apps),
edit the **Weather** app and set its Webhook to **Enabled**. Watson Work will
ping the app Webhook callback URL with a verification challenge request to
check that it's up and responding correctly.

The sample app will respond to that challenge request and output the
following log:
```
watsonwork-weather-app Got Webhook verification challenge
```

### Chatting with the app in a space

You're now ready to chat with the sample app!

Go to [Watson Workspace](https://workspace.ibm.com) and create a space
named **Examples**, then open the **Apps** tab for that space and add the
**Weather** app to it.

In the **Examples** space, say "*Is it raining in San Francisco?*".

The Weather app will respond with a message asking you to confirm that you're
interested in the weather in San Francisco: 
"*Hey [your name], I think you're looking for the weather conditions in
San Francisco. Is that correct?*".

Say "*yes*".

The Weather app will then respond with the weather conditions in San
Francisco, like this for example:
"*San Francisco, CA, 48F Feels like 41F, Fair*"

## Project layout

The sample project source tree is organized as follows:

```sh
README.md     - this README
package.json  - Node.js package definition
watson.json   - Watson Conversation training configuration

src/          - Javascript sources

  app.js      - main app conversation handling script
  events.js   - routes Webhook events to app logic
  messages.js - reads and sends messages
  graphql.js  - runs GraphQL queries
  oauth.js    - obtains OAuth tokens for the app
  sign.js     - signs and verifies Webhook requests and responses
  state.js    - stores conversation state in a database
  users.js    - queries user profile info
  weather.js  - gets weather info from The Weather Company
  geocode.js  - gets the geolocation of a city
  ssl.js      - configures the app to use an SSL certificate

  test/       - unit tests
```

## What API does the app use?

The app uses the [Watson Work OAuth API]
(https://workspace.ibm.com/developer/docs) to authenticate and get an
OAuth token. It implements a Webhook endpoint according to the
[Watson Work Webhook API](https://workspace.ibm.com/developer/docs) to
listen to conversations in a space and receive messages and message
annotations. Finally, it uses the [Watson Work Spaces API]
(https://workspace.ibm.com/developer/docs) to send back weather information
messages to the space.

## How can I contribute?

Pull requests welcome!

