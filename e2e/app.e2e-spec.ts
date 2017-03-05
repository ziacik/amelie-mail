import { AmelieMailPage } from './app.po';

describe('amelie-mail App', () => {
  let page: AmelieMailPage;

  beforeEach(() => {
    page = new AmelieMailPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
