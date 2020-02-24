import { browser, element, by, protractor } from 'protractor';

import NavBarPage from './../../page-objects/navbar-page';
import SignInPage from './../../page-objects/signin-page';
import JobHistoryComponentsPage, { JobHistoryDeleteDialog } from './job-history.page-object';
import JobHistoryUpdatePage from './job-history-update.page-object';
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

describe('JobHistory e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let jobHistoryComponentsPage: JobHistoryComponentsPage;
  let jobHistoryUpdatePage: JobHistoryUpdatePage;
  let jobHistoryDeleteDialog: JobHistoryDeleteDialog;
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

  it('should load JobHistories', async () => {
    await navBarPage.getEntityPage('job-history');
    jobHistoryComponentsPage = new JobHistoryComponentsPage();
    expect(await jobHistoryComponentsPage.title.getText()).to.match(/Job Histories/);

    expect(await jobHistoryComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilAnyDisplayed([jobHistoryComponentsPage.noRecords, jobHistoryComponentsPage.table]);

    beforeRecordsCount = (await isVisible(jobHistoryComponentsPage.noRecords)) ? 0 : await getRecordsCount(jobHistoryComponentsPage.table);
  });

  it('should load create JobHistory page', async () => {
    await jobHistoryComponentsPage.createButton.click();
    jobHistoryUpdatePage = new JobHistoryUpdatePage();
    expect(await jobHistoryUpdatePage.getPageTitle().getAttribute('id')).to.match(/amelieApp.jobHistory.home.createOrEditLabel/);
    await jobHistoryUpdatePage.cancel();
  });

  it('should create and save JobHistories', async () => {
    await jobHistoryComponentsPage.createButton.click();
    await jobHistoryUpdatePage.setStartDateInput('01/01/2001' + protractor.Key.TAB + '02:30AM');
    expect(await jobHistoryUpdatePage.getStartDateInput()).to.contain('2001-01-01T02:30');
    await jobHistoryUpdatePage.setEndDateInput('01/01/2001' + protractor.Key.TAB + '02:30AM');
    expect(await jobHistoryUpdatePage.getEndDateInput()).to.contain('2001-01-01T02:30');
    await jobHistoryUpdatePage.languageSelectLastOption();
    await jobHistoryUpdatePage.jobSelectLastOption();
    await jobHistoryUpdatePage.departmentSelectLastOption();
    await jobHistoryUpdatePage.employeeSelectLastOption();
    await waitUntilDisplayed(jobHistoryUpdatePage.saveButton);
    await jobHistoryUpdatePage.save();
    await waitUntilHidden(jobHistoryUpdatePage.saveButton);
    expect(await isVisible(jobHistoryUpdatePage.saveButton)).to.be.false;

    expect(await jobHistoryComponentsPage.createButton.isEnabled()).to.be.true;

    await waitUntilDisplayed(jobHistoryComponentsPage.table);

    await waitUntilCount(jobHistoryComponentsPage.records, beforeRecordsCount + 1);
    expect(await jobHistoryComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);
  });

  it('should delete last JobHistory', async () => {
    const deleteButton = jobHistoryComponentsPage.getDeleteButton(jobHistoryComponentsPage.records.last());
    await click(deleteButton);

    jobHistoryDeleteDialog = new JobHistoryDeleteDialog();
    await waitUntilDisplayed(jobHistoryDeleteDialog.deleteModal);
    expect(await jobHistoryDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/amelieApp.jobHistory.delete.question/);
    await jobHistoryDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(jobHistoryDeleteDialog.deleteModal);

    expect(await isVisible(jobHistoryDeleteDialog.deleteModal)).to.be.false;

    await waitUntilAnyDisplayed([jobHistoryComponentsPage.noRecords, jobHistoryComponentsPage.table]);

    const afterCount = (await isVisible(jobHistoryComponentsPage.noRecords)) ? 0 : await getRecordsCount(jobHistoryComponentsPage.table);
    expect(afterCount).to.eq(beforeRecordsCount);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
