'use strict';

const rx = require('rxjs/Observable');
require('rxjs/add/observable/of');

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('sinon-chai'));

const os = require('os');
const path = require('path');

const AccountSetingsService = require('./account-settings-service');

describe('Account Setings Service', () => {
	let accountSetingsService;

	let accountSettings = {
		login: "some.login"
	}

	let fs = {
		readFile: sinon.stub().yields(null, JSON.stringify(accountSettings))
	};

	beforeEach(() => {
		accountSetingsService = new AccountSetingsService(fs);
	});

	describe('getAll', () => {
		it('allows us to subscribe for the settings', () => {
			let subscription = accountSetingsService.getAll().subscribe();
			expect(subscription).to.exist;
		});

		it('loads a settings file and parses it into an object', () => {
			return accountSetingsService.getAll().subscribe(result => {
				expect(fs.readFile).to.have.been.calledWith(path.join(os.homedir(), '.amelie-mail.accounts.json'), 'utf8');
				expect(result).to.deep.equal(accountSettings);
			});
		});
	});
});
