import { browser, element, by } from 'protractor';

import NavBarPage from './../../page-objects/navbar-page';
import SignInPage from './../../page-objects/signin-page';
import TaskComponentsPage, { TaskDeleteDialog } from './task.page-object';
import TaskUpdatePage from './task-update.page-object';
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

describe('Task e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let taskComponentsPage: TaskComponentsPage;
  let taskUpdatePage: TaskUpdatePage;
  let taskDeleteDialog: TaskDeleteDialog;
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

  it('should load Tasks', async () => {
    await navBarPage.getEntityPage('task');
    taskComponentsPage = new TaskComponentsPage();
    expect(await taskComponentsPage.title.getText()).to.match(/Tasks/);

    expect(await taskComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilAnyDisplayed([taskComponentsPage.noRecords, taskComponentsPage.table]);

    beforeRecordsCount = (await isVisible(taskComponentsPage.noRecords)) ? 0 : await getRecordsCount(taskComponentsPage.table);
  });

  it('should load create Task page', async () => {
    await taskComponentsPage.createButton.click();
    taskUpdatePage = new TaskUpdatePage();
    expect(await taskUpdatePage.getPageTitle().getAttribute('id')).to.match(/amelieApp.task.home.createOrEditLabel/);
    await taskUpdatePage.cancel();
  });

  it('should create and save Tasks', async () => {
    await taskComponentsPage.createButton.click();
    await taskUpdatePage.setTitleInput('title');
    expect(await taskUpdatePage.getTitleInput()).to.match(/title/);
    await taskUpdatePage.setDescriptionInput('description');
    expect(await taskUpdatePage.getDescriptionInput()).to.match(/description/);
    await waitUntilDisplayed(taskUpdatePage.saveButton);
    await taskUpdatePage.save();
    await waitUntilHidden(taskUpdatePage.saveButton);
    expect(await isVisible(taskUpdatePage.saveButton)).to.be.false;

    expect(await taskComponentsPage.createButton.isEnabled()).to.be.true;

    await waitUntilDisplayed(taskComponentsPage.table);

    await waitUntilCount(taskComponentsPage.records, beforeRecordsCount + 1);
    expect(await taskComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);
  });

  it('should delete last Task', async () => {
    const deleteButton = taskComponentsPage.getDeleteButton(taskComponentsPage.records.last());
    await click(deleteButton);

    taskDeleteDialog = new TaskDeleteDialog();
    await waitUntilDisplayed(taskDeleteDialog.deleteModal);
    expect(await taskDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/amelieApp.task.delete.question/);
    await taskDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(taskDeleteDialog.deleteModal);

    expect(await isVisible(taskDeleteDialog.deleteModal)).to.be.false;

    await waitUntilAnyDisplayed([taskComponentsPage.noRecords, taskComponentsPage.table]);

    const afterCount = (await isVisible(taskComponentsPage.noRecords)) ? 0 : await getRecordsCount(taskComponentsPage.table);
    expect(afterCount).to.eq(beforeRecordsCount);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
