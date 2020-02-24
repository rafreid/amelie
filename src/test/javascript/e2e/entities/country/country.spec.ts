import { browser, element, by } from 'protractor';

import NavBarPage from './../../page-objects/navbar-page';
import SignInPage from './../../page-objects/signin-page';
import CountryComponentsPage, { CountryDeleteDialog } from './country.page-object';
import CountryUpdatePage from './country-update.page-object';
import {
  waitUntilDisplayed,
  waitUntilAnyDisplayed,
  click,
  getRecordsCount,
  waitUntilHidden,
  waitUntilCount,
  isVisible
} from '../../util/utils';

const expect = chai.expect;

describe('Country e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let countryComponentsPage: CountryComponentsPage;
  let countryUpdatePage: CountryUpdatePage;
  let countryDeleteDialog: CountryDeleteDialog;
  let beforeRecordsCount = 0;

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.waitUntilDisplayed();

    await signInPage.username.sendKeys('admin');
    await signInPage.password.sendKeys('admin');
    await signInPage.loginButton.click();
    await signInPage.waitUntilHidden();
    await waitUntilDisplayed(navBarPage.entityMenu);
    await waitUntilDisplayed(navBarPage.adminMenu);
    await waitUntilDisplayed(navBarPage.accountMenu);
  });

  it('should load Countries', async () => {
    await navBarPage.getEntityPage('country');
    countryComponentsPage = new CountryComponentsPage();
    expect(await countryComponentsPage.title.getText()).to.match(/Countries/);

    expect(await countryComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilAnyDisplayed([countryComponentsPage.noRecords, countryComponentsPage.table]);

    beforeRecordsCount = (await isVisible(countryComponentsPage.noRecords)) ? 0 : await getRecordsCount(countryComponentsPage.table);
  });

  it('should load create Country page', async () => {
    await countryComponentsPage.createButton.click();
    countryUpdatePage = new CountryUpdatePage();
    expect(await countryUpdatePage.getPageTitle().getAttribute('id')).to.match(/amelieApp.country.home.createOrEditLabel/);
    await countryUpdatePage.cancel();
  });

  it('should create and save Countries', async () => {
    await countryComponentsPage.createButton.click();
    await countryUpdatePage.setCountryNameInput('countryName');
    expect(await countryUpdatePage.getCountryNameInput()).to.match(/countryName/);
    await countryUpdatePage.regionSelectLastOption();
    await waitUntilDisplayed(countryUpdatePage.saveButton);
    await countryUpdatePage.save();
    await waitUntilHidden(countryUpdatePage.saveButton);
    expect(await isVisible(countryUpdatePage.saveButton)).to.be.false;

    expect(await countryComponentsPage.createButton.isEnabled()).to.be.true;

    await waitUntilDisplayed(countryComponentsPage.table);

    await waitUntilCount(countryComponentsPage.records, beforeRecordsCount + 1);
    expect(await countryComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);
  });

  it('should delete last Country', async () => {
    const deleteButton = countryComponentsPage.getDeleteButton(countryComponentsPage.records.last());
    await click(deleteButton);

    countryDeleteDialog = new CountryDeleteDialog();
    await waitUntilDisplayed(countryDeleteDialog.deleteModal);
    expect(await countryDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/amelieApp.country.delete.question/);
    await countryDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(countryDeleteDialog.deleteModal);

    expect(await isVisible(countryDeleteDialog.deleteModal)).to.be.false;

    await waitUntilAnyDisplayed([countryComponentsPage.noRecords, countryComponentsPage.table]);

    const afterCount = (await isVisible(countryComponentsPage.noRecords)) ? 0 : await getRecordsCount(countryComponentsPage.table);
    expect(afterCount).to.eq(beforeRecordsCount);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
