import { browser, element, by } from 'protractor';

import NavBarPage from './../../page-objects/navbar-page';
import SignInPage from './../../page-objects/signin-page';
import RegionComponentsPage, { RegionDeleteDialog } from './region.page-object';
import RegionUpdatePage from './region-update.page-object';
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

describe('Region e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let regionComponentsPage: RegionComponentsPage;
  let regionUpdatePage: RegionUpdatePage;
  let regionDeleteDialog: RegionDeleteDialog;
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

  it('should load Regions', async () => {
    await navBarPage.getEntityPage('region');
    regionComponentsPage = new RegionComponentsPage();
    expect(await regionComponentsPage.title.getText()).to.match(/Regions/);

    expect(await regionComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilAnyDisplayed([regionComponentsPage.noRecords, regionComponentsPage.table]);

    beforeRecordsCount = (await isVisible(regionComponentsPage.noRecords)) ? 0 : await getRecordsCount(regionComponentsPage.table);
  });

  it('should load create Region page', async () => {
    await regionComponentsPage.createButton.click();
    regionUpdatePage = new RegionUpdatePage();
    expect(await regionUpdatePage.getPageTitle().getAttribute('id')).to.match(/amelieApp.region.home.createOrEditLabel/);
    await regionUpdatePage.cancel();
  });

  it('should create and save Regions', async () => {
    await regionComponentsPage.createButton.click();
    await regionUpdatePage.setRegionNameInput('regionName');
    expect(await regionUpdatePage.getRegionNameInput()).to.match(/regionName/);
    await waitUntilDisplayed(regionUpdatePage.saveButton);
    await regionUpdatePage.save();
    await waitUntilHidden(regionUpdatePage.saveButton);
    expect(await isVisible(regionUpdatePage.saveButton)).to.be.false;

    expect(await regionComponentsPage.createButton.isEnabled()).to.be.true;

    await waitUntilDisplayed(regionComponentsPage.table);

    await waitUntilCount(regionComponentsPage.records, beforeRecordsCount + 1);
    expect(await regionComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);
  });

  it('should delete last Region', async () => {
    const deleteButton = regionComponentsPage.getDeleteButton(regionComponentsPage.records.last());
    await click(deleteButton);

    regionDeleteDialog = new RegionDeleteDialog();
    await waitUntilDisplayed(regionDeleteDialog.deleteModal);
    expect(await regionDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/amelieApp.region.delete.question/);
    await regionDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(regionDeleteDialog.deleteModal);

    expect(await isVisible(regionDeleteDialog.deleteModal)).to.be.false;

    await waitUntilAnyDisplayed([regionComponentsPage.noRecords, regionComponentsPage.table]);

    const afterCount = (await isVisible(regionComponentsPage.noRecords)) ? 0 : await getRecordsCount(regionComponentsPage.table);
    expect(afterCount).to.eq(beforeRecordsCount);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
