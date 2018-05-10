# wapi-core
> Core module for weeb.sh APIs

[![NPM](https://img.shields.io/npm/v/@weeb_services/wapi-core.svg)](https://www.npmjs.com/package/@weeb_services/wapi-core)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)

## How to use it

1. Install via Yarn or NPM
```
yarn add @weeb_services/wapi-core

npm i @weeb_services/wapi-core
```
2. Create an index.js with the following code
```js
const { WeebAPI } = require('@weeb_services/wapi-core');

class YourAPI extends WeebAPI {
	async onLoad() {
		// Called before the config is loaded
	}

	async onLoaded() {
		// Called after the config is loaded
	}

	async registerMiddlewares(app) {
		// Register your middlewares here
	}

	async registerRouters(app) {
		// Register your routers here
	}
	
	async onInitialized() {
		// Called after everything is setup and started
	}
}

new YourAPI().init();
```
3. Create a folder called "config" in your project root and put a file called "main.json" into that with the following contents
```json
{
	"host": "127.0.0.1",
	"port": 8080,
	"env": "development",
	"sentry": "",
	"track": "",
	"redis": "",
	"mongodb": "",
	"registration": {
		"enabled": false,
		"host": "",
		"token": "",
		"checks": null
	},
	"whitelist": [
		{
			"path": "/"
		}
	],
	"irohHost": "http://localhost:9010"
}
```
4. Make sure you have a package.json file in your project root

5. Run it! It should start up and show something if you open http://localhost:8080 in your browser. For authentication and such you should also get an instance of [Iroh](https://github.com/weeb-services/iroh) up and running and provide a token as a header.

## How to develop with it

The module provides several utilites to help creating an API like a Router class and such. Here are some of the available classes:

```js
const {
	Async,
	Constants,
	FileCache,
	Middleware,
	Redis,
	Require,
	Route,
	Router,
	Util,
	WeebAPI,
} = require('@weeb_services/wapi-core');
```
