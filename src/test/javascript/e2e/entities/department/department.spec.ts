import { browser, element, by } from 'protractor';

import NavBarPage from './../../page-objects/navbar-page';
import SignInPage from './../../page-objects/signin-page';
import DepartmentComponentsPage, { DepartmentDeleteDialog } from './department.page-object';
import DepartmentUpdatePage from './department-update.page-object';
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

describe('Department e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let departmentComponentsPage: DepartmentComponentsPage;
  let departmentUpdatePage: DepartmentUpdatePage;
  let departmentDeleteDialog: DepartmentDeleteDialog;
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

  it('should load Departments', async () => {
    await navBarPage.getEntityPage('department');
    departmentComponentsPage = new DepartmentComponentsPage();
    expect(await departmentComponentsPage.title.getText()).to.match(/Departments/);

    expect(await departmentComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilAnyDisplayed([departmentComponentsPage.noRecords, departmentComponentsPage.table]);

    beforeRecordsCount = (await isVisible(departmentComponentsPage.noRecords)) ? 0 : await getRecordsCount(departmentComponentsPage.table);
  });

  it('should load create Department page', async () => {
    await departmentComponentsPage.createButton.click();
    departmentUpdatePage = new DepartmentUpdatePage();
    expect(await departmentUpdatePage.getPageTitle().getAttribute('id')).to.match(/amelieApp.department.home.createOrEditLabel/);
    await departmentUpdatePage.cancel();
  });

  it('should create and save Departments', async () => {
    await departmentComponentsPage.createButton.click();
    await departmentUpdatePage.setDepartmentNameInput('departmentName');
    expect(await departmentUpdatePage.getDepartmentNameInput()).to.match(/departmentName/);
    await departmentUpdatePage.locationSelectLastOption();
    await waitUntilDisplayed(departmentUpdatePage.saveButton);
    await departmentUpdatePage.save();
    await waitUntilHidden(departmentUpdatePage.saveButton);
    expect(await isVisible(departmentUpdatePage.saveButton)).to.be.false;

    expect(await departmentComponentsPage.createButton.isEnabled()).to.be.true;

    await waitUntilDisplayed(departmentComponentsPage.table);

    await waitUntilCount(departmentComponentsPage.records, beforeRecordsCount + 1);
    expect(await departmentComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);
  });

  it('should delete last Department', async () => {
    const deleteButton = departmentComponentsPage.getDeleteButton(departmentComponentsPage.records.last());
    await click(deleteButton);

    departmentDeleteDialog = new DepartmentDeleteDialog();
    await waitUntilDisplayed(departmentDeleteDialog.deleteModal);
    expect(await departmentDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/amelieApp.department.delete.question/);
    await departmentDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(departmentDeleteDialog.deleteModal);

    expect(await isVisible(departmentDeleteDialog.deleteModal)).to.be.false;

    await waitUntilAnyDisplayed([departmentComponentsPage.noRecords, departmentComponentsPage.table]);

    const afterCount = (await isVisible(departmentComponentsPage.noRecords)) ? 0 : await getRecordsCount(departmentComponentsPage.table);
    expect(afterCount).to.eq(beforeRecordsCount);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
