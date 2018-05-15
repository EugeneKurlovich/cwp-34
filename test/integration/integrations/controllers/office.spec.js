const repo = require('../../../mocks/repository');
const officeHelper = require('../../utils/officeHelper');
const officesData = require('../../../data/offices');
const config = require('../../../data/test_config');

describe('controllers/offices', () => {

	let helper;
	let officesRepo;

	beforeEach(() => {
		officesData.push({df:2, getAgents: ()=>(Promise.resolve('it is agent'))});
		officesRepo = repo(officesData);
		helper = officeHelper({offices: officesRepo}, config);
	});

	it('get all', async () => {
		expect.assertions(1);

		const offices = await helper.getOffices();

		expect(offices).toEqual(JSON.parse(JSON.stringify(officesData)));
	});

	it('get once', async () => {
		expect.assertions(1);

		const offices = await helper.getOffices();
		let officeId = offices.findIndex((office) => office.title === 'Greenberg');

		const hero = await helper.getOffice(officeId);

		expect(hero).toEqual(offices[officeId]);
	});

	it('create office', async () => {
		// так впадлу, шоб вы знали
		expect.assertions(2);

		const data = {
			title: 'Eee baby',
			website: 'https://www.tut.by',
			address: 'Minsk'
		};

		const office = await helper.createOffice(data);
		const offices = await helper.getOffices();

		expect(data).toMatchObject(office);
		expect(offices).toContainEqual(
			expect.objectContaining(office)
		);
	});

	it('update office', async () => {
		expect.assertions(1);

		let offices = await helper.getOffices();

		const item = offices.find((office) => office.title === 'Scout, The');

		item.address = 'Kokokokoko.kokom';

		await helper.updateOffice(item);
		offices = await helper.getOffices();

		expect(offices).toContainEqual(
			expect.objectContaining(item)
		);
	});

	it('remove office', async () => {
		expect.assertions(1);

		let offices = await helper.getOffices();

		const item = offices.find((hero) => hero.title === 'Scout, The');

		await helper.deleteOffice(item);

		offices = await helper.getOffices();

		expect(offices).not.toContainEqual(
			expect.objectContaining(item)
		);
	});

	it('read agents', async () => {
		expect.assertions(1);

		const fouondedItem = await helper.readAgents({id: 3});

		expect(fouondedItem).toEqual('it is agent');
	});
});

