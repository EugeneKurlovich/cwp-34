const app = require('../../../AppManager');
const request = require('supertest');

module.exports = (db, config) => {

	const server = app(db, config);
	const testInstance = request(server);

	return {
		getOffices: (options) => testInstance
			.get(`/offices${options ? `?${options}` : ''}`)
			.expect(200)
			.then((res) => res.body)
		,
		getOffice: (id) =>
			testInstance
				.get(`/offices/${id}`)
				.expect(200)
				.then((res) => res.body)
		,
		createOffice: (office) =>
			testInstance
				.post('/offices/create')
				.send(office)
				.expect(200)
				.then((res) => res.body)
		,
		updateOffice: (office) =>
			testInstance
				.post(`/offices/update`)
				.send(office)
				.expect(200)
				.then((res) => res.body)
		,
		deleteOffice: (office) =>
			testInstance
				.post(`/offices/delete`)
				.send(office)
				.expect(200)
				.then((res) => res.body)
		,
		readAgents: (officeId) =>
			testInstance
				.post(`/offices/agents`)
				.send(officeId)
				.expect(200)
				.then((res) => res.body)
	}
};
