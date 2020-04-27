# Landscape Connect website and server

There are two parts to the system - the build step and the server.

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

They're also run on Travis CI from GitHub.
https://travis-ci.com/github/paperclipmonkey/landscape-connect-server

## Commands
 *	`heroku local:run npm run dev` - Build and start
 *	`heroku local:run npm start` - Start without building
 *	`npm run postinstall` - Build

Changing to frontend
 *	`npm start` 
 *	`npm clean`

Manually download JSON from server
	`wget -U=LandscapeConnect http://landscape-connect-beta.herokuapp.com/api/questionnaires/6788B`