# Landscape Connect website and server

[![Build Status](https://travis-ci.com/paperclipmonkey/landscape-connect-server.svg?token=SsrjjdmEtzcJsGDqjxQw&branch=master)](https://travis-ci.com/paperclipmonkey/landscape-connect-server)

There are three parts to the system:

* Web server - this is a node.js web server which replies to requests and builds responses.
* Front end build system. This builds simply the splash page showing off the features.
* Admin console. Full administrative system as an SPA which uses the web server to function.

## Requirements:

### Server
The version of node is specified in `.nvmrc` as 14. This ensures long term compatability.

### Front-end build
The node version needs to be less than <TODO check> 8.

## Running
To run the system nvm can be used to run multiple versions of node on the same machine. The system must be built before being deployed

## Linting
```npx lint --fix```

## Testing

The tests are written in Mocha, and can be run with:

```heroku local:run mocha -e .env.test```

They're also run on [Travis CI](https://travis-ci.com/github/paperclipmonkey/landscape-connect-server) from GitHub actions.

## Deployment

The deployment pipeline uses GitHub actions to run the Travis CI test runner. If that pases, it's deployed to a beta environment. This can then manually be deployed to production.

Environments:

* [Beta](https://landscape-connect-beta.herokuapp.com/)
* [Production](https://landscape-connect-public.herokuapp.com/)

## Commands
 *	`heroku local:run npm run dev` - Build and start
 *	`heroku local:run npm start` - Start without building
 *	`npm run postinstall` - Build

Changing to frontend
 *	`npm start` 
 *	`npm clean`

Manually download JSON from server
	`wget -U=LandscapeConnect http://landscape-connect-beta.herokuapp.com/api/questionnaires/6788B`