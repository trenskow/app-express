//
// index.js
// @trenskow/app-express
// 
// Created by Kristian Trenskow on 2022/07/26
// For license see LICENSE.
//

import supertest from 'supertest';
import { expect } from 'chai';
import { Application, Endpoint } from '@trenskow/app';

import express from './index.js';

Application.plugin(express);

let app;
let request;

describe('app-express', () => {

	before(async () => {

		app = new Application();

		const port = (await app
			.open())
			.port;

		request = supertest(`http://localhost:${port}`);

	});

	it ('should call express route', async () => {

		app.root(
			new Endpoint()
				.express((_, res) => {
					res.status(201).json('pong');
				})
		);

		let response = await request
			.get('/')
			.expect(201, '"pong"');

		expect(response.headers).to.have.property('content-type').equal('application/json');

	});

	it ('should handle an array of routes', async () => {

		app.root(
			new Endpoint()
				.express([
					(_, __, next) => next(),
					(_, __, next) => next(),
					(_, res) => res.send('ok')
				])
		);

		await request
			.get('/')
			.expect(200, 'ok');

	});

	it ('should handle error from express route', async () => {
		app.root(
			new Endpoint()
				.express((_, __, next) => {
					next(new Error('An error'));
				})
		);
		await request
			.get('/')
			.expect(500);
	});

	it ('should continue routing if express route called next', async () => {
		app.root(
			new Endpoint()
				.express((_, __, next) => {
					next();
				})
				.get(async () => 'pong')
		);
		await request
			.get('/')
			.expect(200, 'pong');
	});

	after(async () => {
		await app.close({ awaitAllConnections: true });
	});

});
