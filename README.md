@trenskow/app-express
----

A plugin for [@trenskow/app](https://github.com/trenskow/app) that enables it to handle [express.js](https://expressjs.com) routes.

> ⚠️ Be aware that this plugin is experimental. Not all features of express is currently supported.

# Installation and usage

Installation is pretty simple. You install it by registering the plugin.

````javascript
import { Application, Endpoint } from '@trenskow/app';
import express from '@trenskow/app-express'

Application.plugin(express);

const app = new Application({ port: 8080 });

const root = new Endpoint()
	.mount('ping', new Endpoint()
		.express((req, res, /* next */) => {
			res.json('pong')
		}));

await app
	.root(root)
	.start();
````

# LICENSE

See license in LICENSE.

