//
// index.js
// @trenskow/app-express
//
// Created by Kristian Trenskow on 2022/07/26
// For license see LICENSE.
//

import caseit from '@trenskow/caseit';

export default ({ Router, util: { resolveInlineImport } }) => {

	Router.prototype.express = function(router) {

		router = resolveInlineImport(router);

		if (Array.isArray(router)) return router.reduce((last, router) => {
			return last.express(router);
		}, this);

		this._layers.push({
			handler: (_, __, { ignore, request, response }, next) => {

				const headers = request.headers;

				request.headers = Object.fromEntries(
					Object.entries(headers)
						.map(([key, value]) => [caseit(key, 'kebab'), value]));

				return new Promise((resolve, reject) => {

					const writeHeadEventHandler = () => {
						ignore();
					};

					try {

						response.on('writeHead', writeHeadEventHandler);

						response.send = (data) => {
							response.write(data);
							response.end();
							return response;
						};

						response.status = (statusCode) => {
							response.statusCode = statusCode;
							return response;
						};

						response.json = (json) => {
							response.headers['contentType'] = 'application/json';
							return response.send(JSON.stringify(json));
						};

						response.set = (name, value) => {

							if (typeof name === 'object' && name !== null) {

								const obj = name;

								return Object.keys(obj)
									.forEach((name) => {
										response.set(name, value);
									});

							}

							response.setHeader(name, value);

						};

						router(request, response, (error) => {

							response.removeListener('writeHead', writeHeadEventHandler);

							request.headers = headers;

							if (error) return reject(error);

							resolve(next());

						});

					} catch (error) {
						reject(error);
					}

				});

			}
		});

		return this;

	};

};
