import { AmelieMailPage } from './app.po';

describe('amelie-mail App', function() {
	let page: AmelieMailPage;

	beforeEach(() => {
		page = new AmelieMailPage();
	});

	it('should display message saying app works', () => {
		page.navigateTo();
		expect(page.getParagraphText()).toEqual('app works!');
	});
});
