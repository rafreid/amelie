import { browser, element, by } from 'protractor';

import NavBarPage from './../../page-objects/navbar-page';
import SignInPage from './../../page-objects/signin-page';
import JobComponentsPage, { JobDeleteDialog } from './job.page-object';
import JobUpdatePage from './job-update.page-object';
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

describe('Job e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let jobComponentsPage: JobComponentsPage;
  let jobUpdatePage: JobUpdatePage;
  let jobDeleteDialog: JobDeleteDialog;
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

  it('should load Jobs', async () => {
    await navBarPage.getEntityPage('job');
    jobComponentsPage = new JobComponentsPage();
    expect(await jobComponentsPage.title.getText()).to.match(/Jobs/);

    expect(await jobComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilAnyDisplayed([jobComponentsPage.noRecords, jobComponentsPage.table]);

    beforeRecordsCount = (await isVisible(jobComponentsPage.noRecords)) ? 0 : await getRecordsCount(jobComponentsPage.table);
  });

  it('should load create Job page', async () => {
    await jobComponentsPage.createButton.click();
    jobUpdatePage = new JobUpdatePage();
    expect(await jobUpdatePage.getPageTitle().getAttribute('id')).to.match(/amelieApp.job.home.createOrEditLabel/);
    await jobUpdatePage.cancel();
  });

  it('should create and save Jobs', async () => {
    await jobComponentsPage.createButton.click();
    await jobUpdatePage.setJobTitleInput('jobTitle');
    expect(await jobUpdatePage.getJobTitleInput()).to.match(/jobTitle/);
    await jobUpdatePage.setMinSalaryInput('5');
    expect(await jobUpdatePage.getMinSalaryInput()).to.eq('5');
    await jobUpdatePage.setMaxSalaryInput('5');
    expect(await jobUpdatePage.getMaxSalaryInput()).to.eq('5');
    // jobUpdatePage.taskSelectLastOption();
    await jobUpdatePage.employeeSelectLastOption();
    await waitUntilDisplayed(jobUpdatePage.saveButton);
    await jobUpdatePage.save();
    await waitUntilHidden(jobUpdatePage.saveButton);
    expect(await isVisible(jobUpdatePage.saveButton)).to.be.false;

    expect(await jobComponentsPage.createButton.isEnabled()).to.be.true;

    await waitUntilDisplayed(jobComponentsPage.table);

    await waitUntilCount(jobComponentsPage.records, beforeRecordsCount + 1);
    expect(await jobComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);
  });

  it('should delete last Job', async () => {
    const deleteButton = jobComponentsPage.getDeleteButton(jobComponentsPage.records.last());
    await click(deleteButton);

    jobDeleteDialog = new JobDeleteDialog();
    await waitUntilDisplayed(jobDeleteDialog.deleteModal);
    expect(await jobDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/amelieApp.job.delete.question/);
    await jobDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(jobDeleteDialog.deleteModal);

    expect(await isVisible(jobDeleteDialog.deleteModal)).to.be.false;

    await waitUntilAnyDisplayed([jobComponentsPage.noRecords, jobComponentsPage.table]);

    const afterCount = (await isVisible(jobComponentsPage.noRecords)) ? 0 : await getRecordsCount(jobComponentsPage.table);
    expect(afterCount).to.eq(beforeRecordsCount);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
