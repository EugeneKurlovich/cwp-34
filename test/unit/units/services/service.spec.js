const errors = require('../../../../helps/error');
const schemaProperty = require('../../../../schems/property');
const PropertyService = require('../../../../svcs/property');
const properties = require('../../../data/properties');
const agents = require('../../../data/agents');
const repositoryMock = require('../../../mocks/repository');

describe('service/property', () => {

	let agentsRepository;
	let repository;
	let instance;


	beforeEach(() => {
		repository = repositoryMock(agents);
		agentsRepository = repositoryMock(properties);

		instance = new PropertyService(repository, agentsRepository, schemaProperty, errors);
	});

	afterEach(() => {
		repository.mockClear();
		agentsRepository.mockClear();
	});

	describe('constructor', () => {
		it('success', async () => {
			expect(instance.repository).toEqual(repository);
			expect(instance.agentsRepository).toEqual(agentsRepository);
			expect(instance.schema).toEqual(schemaProperty);
			expect(instance.errors).toEqual(errors);
			expect(instance.defaults).toEqual({
				readChunk: {
					limit: 5,
					offset: 0,
					sortOrder: 'asc',
					sortField: 'id'
				}
			})
		});
	});

	describe('readChunk', () => {

		let options;

		beforeEach(() => {
			options = {
				limit: 10,
				offset: 10,
				sortField: 'sf',
				sortOrder: 'soso'
			};
		});

		it('should call db.findAll', async () => {
			instance.readChunk(options);

			expect(repository.findAll).toHaveBeenCalled();
			expect(repository.findAll.mock.calls[0][0]).toEqual({
				limit: 10,
				offset: 10,
				order: [['sf', 'SOSO']],
				raw: true
			});
		})

		it('should return a promise', async () => {
			const ret = instance.readChunk(options);

			expect(ret).toBeInstanceOf(Promise);
		})

		it('should return all data', async () => {
			const ret = await  instance.readChunk(options);

			expect(ret).toEqual(agents);
		})

		it('should use default options', async () => {
			instance.readChunk();

			expect(repository.findAll).toHaveBeenCalled();
			expect(repository.findAll.mock.calls[0][0]).toEqual({
				limit: 5,
				offset: 0,
				order: [['id', 'ASC']],
				raw: true
			});
		})
	});

	describe('read', () => {
		let id;

		beforeEach(() => {
			id = 1;
		});

		it('should throw error if id is NaN', async () => {
			id = 'sds';

			try {
				await instance.read(id);
			} catch (e) {
				expect(e).toEqual(errors.invalidId);
			}
		})

		it('should call db.findById', async () => {
			await instance.read(id);

			expect(repository.findById).toHaveBeenCalled();
			expect(repository.findById.mock.calls[0][0]).toEqual(1);
			expect(repository.findById.mock.calls[0][1]).toEqual({raw: true});
		})

		it('should parse id in string view', async () => {
			id = '1';

			await instance.read(id);

			expect(repository.findById).toHaveBeenCalled();
			expect(repository.findById.mock.calls[0][0]).toEqual(1);
		})

		it('should throw error founded item is undefined', async () => {
			instance.repository.findById = jest.fn((id) => Promise.resolve(undefined));

			try {
				await instance.read(id);
			} catch (e) {
				expect(repository.findById).toHaveBeenCalled();
				expect(e).toEqual(errors.notFound);
			}
		})

		it('should return a promise', async () => {
			const ret = instance.read(id);

			expect(ret).toBeInstanceOf(Promise);
		});


		it('should return created item', async () => {
			const ret = await instance.read(id);

			expect(ret).toEqual({
				email: 'glamborn1@yolasite.com',
				name: 'Gris Lamborn',
				officeId: 1,
				tel: '608-756-4811'
			});
		});
	});

	describe('create', () => {

		let data;

		beforeEach(() => {
			data = {
				price: 10,
				currency: 'BYN',
				heading: 'koko',
				location: 'https://www.tut.by',
				agentId: 1
			}
		});

		it('should throw error if validation failed(agentId is string)', async () => {
			data.agentId = 'sdsd';
			try {
				await instance.create(data);
			} catch (e) {
				expect(e).toBeTruthy();
				expect(e.message).toEqual('"agentId" must be a number');
				expect(e.code).toEqual('validate_error');
				expect(e.status).toEqual(400);
				expect(repository.create).not.toHaveBeenCalled();
			}
		});

		it('should throw error if validation failed(price is negative)', async () => {
			data.price = -10;
			try {
				await instance.create(data);
			} catch (e) {
				expect(e).toBeTruthy();
				expect(e.message).toEqual('"price" must be a positive number');
				expect(e.code).toEqual('validate_error');
				expect(e.status).toEqual(400);
				expect(repository.create).not.toHaveBeenCalled();
			}
		});

		it('should return a promise', async () => {
			const ret = instance.create(data);

			expect(ret).toBeInstanceOf(Promise);
		});

		it('should return created item', async () => {
			const ret = await instance.create(data);

			expect(ret).toEqual(data);
		});

		it('should call db.create', async () => {
			await instance.create(data);

			expect(repository.create).toHaveBeenCalled();
			expect(repository.create.mock.calls[0][0]).toEqual(data);
		});

	});

	describe('update', () => {
		let data;

		beforeEach(() => {
			data = {
				id: 2,
				price: 10,
				currency: 'BYN',
				heading: 'koko',
				location: 'https://www.tut.by',
				agentId: 1
			}
		});

		it('should throw error if validation failed(agentId is string)', async () => {
			data.agentId = 'sdsd';
			try {
				await instance.update(data);
			} catch (e) {
				expect(e).toBeTruthy();
				expect(e.message).toEqual('"agentId" must be a number');
				expect(e.code).toEqual('validate_error');
				expect(e.status).toEqual(400);
				expect(repository.create).not.toHaveBeenCalled();
			}
		});

		it('should throw error if validation failed(price is negative)', async () => {
			data.price = -10;
			try {
				await instance.update(data);
			} catch (e) {
				expect(e).toBeTruthy();
				expect(e.message).toEqual('"price" must be a positive number');
				expect(e.code).toEqual('validate_error');
				expect(e.status).toEqual(400);
				expect(repository.create).not.toHaveBeenCalled();
			}
		});

		it('should return promise', async () => {
			const ret = instance.update(data);

			expect(ret).toBeInstanceOf(Promise);
		});

		it('should return updated item', async () => {
			const ret = await instance.create(data);

			expect(ret).toEqual(data);
		});

		it('should call db.update and db.read', async () => {
			await instance.update(data);

			expect(repository.update).toHaveBeenCalled();
			expect(repository.update.mock.calls[0][0]).toEqual(data);
			expect(repository.update.mock.calls[0][1]).toEqual({where: {id: 2}, limit: 1});

			expect(repository.findById).toHaveBeenCalled();
			expect(repository.findById.mock.calls[0][0]).toEqual(2);
		});

	});

	describe('delete', () => {

		let id;

		beforeEach(() => {
			id = 2;
		});

		it('should call db.destroy', async () => {
			await instance.delete(id);

			expect(repository.destroy).toHaveBeenCalled();
			expect(repository.destroy.mock.calls[0][0]).toEqual({where: {id: 2}});
		})

		it('should return a promise', async () => {
			const ret = instance.delete(id);

			// expect(ret).toBeInstanceOf(Number);
		})

		it('should return a number of deleted items', async () => {
			const ret = await  instance.delete(id);

			expect(ret).toBe(1);
		})

	});

	describe('addAgent', () => {

		let propId;
		let agentId;

		beforeEach(() => {
			propId = 1;
			agentId = 1;
		});

		it('should call db.findById', async () => {
			await instance.addAgent(propId, agentId);

			expect(agentsRepository.findById).toHaveBeenCalled();
			expect(agentsRepository.findById.mock.calls[0][0]).toEqual(1);
		})

		it('should throw error founded item is undefined', async () => {
			instance.agentsRepository.findById = jest.fn((id) => Promise.resolve(undefined));

			try {
				await instance.addAgent(propId, agentId);
			} catch (e) {
				expect(agentsRepository.findById).toHaveBeenCalled();
				expect(e).toEqual(errors.notFound);
			}
		})

		it('should return promise', async () => {
			const ret = instance.addAgent(propId, agentId);

			expect(ret).toBeInstanceOf(Promise);
		});

		it('should return updated item', async () => {
			const ret = await instance.addAgent(propId, agentId);

			expect(ret).toEqual({agentId: 1});
		});

		it('should call db.update and db.read', async () => {
			await instance.addAgent(propId, agentId);

			expect(repository.update).toHaveBeenCalled();
			expect(repository.update.mock.calls[0][0]).toEqual({agentId});
			expect(repository.update.mock.calls[0][1]).toEqual({where: {id: propId}, limit: 1});

			expect(repository.findById).toHaveBeenCalled();
			expect(repository.findById.mock.calls[0][0]).toEqual(1);
		});

	});

	describe('removeAgent', () => {

		let propId;

		beforeEach(() => {
			propId = 1;
		});

		it('should call db.findById', async () => {
			await instance.removeAgent(propId);

			expect(repository.update).toHaveBeenCalled();
			expect(repository.update.mock.calls[0][0]).toEqual({agentId: null});
			expect(repository.update.mock.calls[0][1]).toEqual({where: {id: propId}, limit: 1});
		})

		it('should return promise', async () => {
			const ret = instance.removeAgent(propId);

			expect(ret).toBeInstanceOf(Promise);
		});

		it('should return updated item', async () => {
			const ret = await instance.removeAgent(propId);

			// the worst unit test ever
			expect(ret).toEqual({agentId: null});
		});

		it('should call db.update and db.read', async () => {
			await instance.removeAgent(propId);

			expect(repository.update).toHaveBeenCalled();
			expect(repository.update.mock.calls[0][0]).toEqual({agentId: null});
			expect(repository.update.mock.calls[0][1]).toEqual({where: {id: propId}, limit: 1});

			expect(repository.findById).toHaveBeenCalled();
			expect(repository.findById.mock.calls[0][0]).toEqual(1);
		});

	});
});
