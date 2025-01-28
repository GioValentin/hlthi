import { expect, Page, test } from '@playwright/test';
import { dataTestIds } from '../../../src/constants/data-test-ids';
import { ResourceHandler } from '../../e2e-utils/resource-handler';
import {
  TEST_EMPLOYEE_1_UPDATED_INFO,
  TestEmployee,
  testEmployeeGivenNamePattern,
  TestEmployeeInviteParams,
} from '../../e2e-utils/resource/employees';
import { AVAILABLE_EMPLOYEE_ROLES, RoleType } from '../../e2e-utils/temp-imports-from-utils';
import { PractitionerQualificationCode } from 'utils';

// We may create new instances for the tests with mutable operations, and keep parralel tests isolated
const resourceHandler = new ResourceHandler();
const DEFAULT_TIMEOUT = { timeout: 15000 };

test.beforeAll(async () => {
  await resourceHandler.setEmployees();
});

test.afterAll(async () => {
  await resourceHandler.deleteEmployees();
});

async function waitUntilEmployeeProviderTableLoaded(page: Page): Promise<void> {
  await expect(page.getByTestId(dataTestIds.employeesPage.table)).toBeVisible(DEFAULT_TIMEOUT);
  await expect(page.getByTestId(dataTestIds.dashboard.loadingIndicator)).not.toBeVisible(DEFAULT_TIMEOUT);
}

async function goToTestEmployeePage(page: Page, employee: TestEmployee): Promise<void> {
  await page.getByTestId(dataTestIds.employeesPage.searchByName).getByRole('textbox').fill(employee.familyName);
  const targetLink = page.locator(`text=${employee.familyName}`);
  await targetLink.click(DEFAULT_TIMEOUT);
  await expect(page.getByTestId(dataTestIds.employeesPage.informationForm)).toBeVisible(DEFAULT_TIMEOUT);
}

async function waitForSuccessSnackbar(page: Page): Promise<void> {
  // for this moment it's the easiest way to check for snackbar, data-key didn't work out
  // const snackbar = page.locator(`[data-key="${dataTestIds.employeesPage.snackbarSuccessKey}"]`);
  const snackbar = page.locator('div[id=notistack-snackbar]');
  await expect(snackbar).toBeVisible(DEFAULT_TIMEOUT);
}

async function checkEmployeeFields(page: Page, employee: TestEmployeeInviteParams): Promise<void> {
  // CHECKING EMPLOYEE BASIC FIELDS
  const firstNameField = page.getByTestId(dataTestIds.employeesPage.firstName).locator('input');
  const middleNameField = page.getByTestId(dataTestIds.employeesPage.middleName).locator('input');
  const lastNameField = page.getByTestId(dataTestIds.employeesPage.lastName).locator('input');
  const emailField = page.getByTestId(dataTestIds.employeesPage.email).locator('input');
  const phoneField = page.getByTestId(dataTestIds.employeesPage.phone).locator('input');

  await expect(firstNameField).toHaveValue(employee.givenName);
  await expect(middleNameField).toHaveValue(employee.middleName);
  if (employee.familyName) await expect(lastNameField).toHaveValue(employee.familyName);
  await expect(emailField).toHaveValue(employee.email!);
  await expect(phoneField).toHaveValue(employee.telecomPhone);

  // CHECKING EMPLOYEE ROLES
  for (const emp_role of AVAILABLE_EMPLOYEE_ROLES) {
    const roleCheckbox = page.getByTestId(dataTestIds.employeesPage.roleRow(emp_role.value));
    if (employee.roles.includes(emp_role.value)) {
      await expect(roleCheckbox.getByRole('checkbox')).toBeChecked();
    } else {
      await expect(roleCheckbox.getByRole('checkbox')).not.toBeChecked();
    }
  }

  // IN CASE EMPLOYEE IS A PROVIDER WE CHECKING CREDENTIALS AND NPI
  if (employee.roles.includes(RoleType.Provider)) {
    const credentialsField = page.getByTestId(dataTestIds.employeesPage.providerDetailsCredentials).locator('input');
    await expect(credentialsField).toHaveValue(employee.credentials);

    const npiField = page.getByTestId(dataTestIds.employeesPage.providerDetailsNPI).locator('input');
    await expect(npiField).toHaveValue(employee.npi);
  }

  // CHECKING QUALIFICATION
  if (employee.qualification.length > 0) {
    for (const qualification of employee.qualification) {
      const row = page.getByTestId(
        dataTestIds.employeesPage.qualificationRow(qualification.code as PractitionerQualificationCode)
      );
      await expect(row).toBeVisible(DEFAULT_TIMEOUT);
    }
  }
}

async function updateEmployeesFields(page: Page, employee: TestEmployeeInviteParams): Promise<void> {
  // UPDATING EMPLOYEE BASIC FIELDS
  const firstNameField = page.getByTestId(dataTestIds.employeesPage.firstName).locator('input');
  const middleNameField = page.getByTestId(dataTestIds.employeesPage.middleName).locator('input');
  const lastNameField = page.getByTestId(dataTestIds.employeesPage.lastName).locator('input');
  const phoneField = page.getByTestId(dataTestIds.employeesPage.phone).locator('input');

  await firstNameField.fill(employee.givenName);
  await middleNameField.fill(employee.middleName);
  if (employee.familyName) await lastNameField.fill(employee.familyName);
  await phoneField.fill(employee.telecomPhone);

  // UPDATING EMPLOYEE ROLES
  for (const emp_role of AVAILABLE_EMPLOYEE_ROLES) {
    const roleCheckbox = page.getByTestId(dataTestIds.employeesPage.roleRow(emp_role.value));
    if (employee.roles.includes(emp_role.value)) await roleCheckbox.getByRole('checkbox').check();
    else await roleCheckbox.getByRole('checkbox').uncheck();
  }

  // IN CASE EMPLOYEE IS A PROVIDER WE UPDATING CREDENTIALS AND NPI
  if (employee.roles.includes(RoleType.Provider)) {
    const credentialsField = page.getByTestId(dataTestIds.employeesPage.providerDetailsCredentials).locator('input');
    await credentialsField.fill(employee.credentials);

    const npiField = page.getByTestId(dataTestIds.employeesPage.providerDetailsNPI).locator('input');
    await npiField.fill(employee.npi);
  }

  // DELETING ALL QUALIFICATIONS BEFORE POPULATING
  if (employee.qualification.length > 0) {
    const qualificationTable = page.getByTestId(dataTestIds.employeesPage.qualificationsTable);
    const deleteButton = qualificationTable.getByTestId(dataTestIds.employeesPage.deleteQualificationButton);
    const buttonsCount = await deleteButton.count();
    for (let i = 0; i < buttonsCount; i++) {
      // we press 0 index each time because as we delete each element it's disheartening from table
      // so we just need to press 0 index all way until all elements will be deleted
      await deleteButton.nth(0).click(DEFAULT_TIMEOUT);
    }
  }
  // ADDING ALL QUALIFICATIONS IN EMPLOYEE OBJ
  await page.getByTestId(dataTestIds.employeesPage.addQualificationAccordion).click(DEFAULT_TIMEOUT);
  const qualificationStateDropdown = page.getByTestId(dataTestIds.employeesPage.newQualificationStateDropdown);
  const qualificationTypeDropdown = page.getByTestId(dataTestIds.employeesPage.newQualificationTypeDropdown);
  const createQualificationButton = page.getByTestId(dataTestIds.employeesPage.addQualificationButton);
  for (const qualification of employee.qualification) {
    await qualificationStateDropdown.getByRole('button').click(DEFAULT_TIMEOUT);
    await qualificationStateDropdown.locator('input').fill(qualification.state);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await qualificationTypeDropdown.getByRole('button').click(DEFAULT_TIMEOUT);
    await qualificationTypeDropdown.locator('input').fill(qualification.code);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await createQualificationButton.click(DEFAULT_TIMEOUT);
  }
}

test('Employee page is working', async ({ page }) => {
  await page.goto(`employees`);
  await expect(page.getByTestId('PersonIcon')).toBeVisible();
  await expect(page.getByTestId(dataTestIds.header.userName)).toBeAttached(DEFAULT_TIMEOUT);

  await expect(page.getByTestId(dataTestIds.employeesPage.table)).toBeVisible(DEFAULT_TIMEOUT);
});

test('Employees list is loading', async ({ page }) => {
  await page.goto(`employees`);

  // WE GET ALL STATUS CHIPS FROM EMPLOYEES RECORDS, SO IF THERE ARE SOME WE HAVE EMPLOYEES
  await waitUntilEmployeeProviderTableLoaded(page);
  const statusChips = page.getByTestId(dataTestIds.employeesPage.statusChip);

  await expect(statusChips).not.toHaveCount(0);
});

test('Providers tab filters are working', async ({ page }) => {
  await page.goto(`employees`);
  await page.getByTestId(dataTestIds.employeesPage.providersTabButton).click(DEFAULT_TIMEOUT);
  await waitUntilEmployeeProviderTableLoaded(page);
  const table = page.getByTestId(dataTestIds.employeesPage.table);

  await test.step('Check name search filed', async () => {
    await page
      .getByTestId(dataTestIds.employeesPage.searchByName)
      .getByRole('textbox')
      .fill(resourceHandler.testEmployee1.familyName);

    await expect(table.locator(`text=${resourceHandler.testEmployee1.familyName}`)).toBeVisible(DEFAULT_TIMEOUT);
    await expect(table.locator(`text=${resourceHandler.testEmployee2.familyName}`)).not.toBeVisible(DEFAULT_TIMEOUT);
  });

  await test.step('Check name search filed', async () => {
    await page
      .getByTestId(dataTestIds.employeesPage.searchByName)
      .getByRole('textbox')
      .fill(testEmployeeGivenNamePattern);

    // SELECT 'AK' STATE BY CLICKING TWO TIMES DOWN IN STATES DROPDOWN
    await page
      .getByTestId(dataTestIds.employeesPage.providersStateFilter)
      .getByRole('button', { name: 'Open' })
      .click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    // CHECKING IF WE ARE RECEIVING OUR TEST EMPLOYEES
    await waitUntilEmployeeProviderTableLoaded(page);
    await expect(table.locator(`text=${testEmployeeGivenNamePattern}`).first()).toBeVisible(DEFAULT_TIMEOUT);
  });
});

test('Employee editing is working', async ({ page }) => {
  await page.goto(`employees`);
  await waitUntilEmployeeProviderTableLoaded(page);
  await goToTestEmployeePage(page, resourceHandler.testEmployee1);
  const submitButton = page.getByTestId(dataTestIds.employeesPage.submitButton);

  await test.step('Updating employee data', async () => {
    await updateEmployeesFields(page, TEST_EMPLOYEE_1_UPDATED_INFO);
    await submitButton.click(DEFAULT_TIMEOUT);

    await waitForSuccessSnackbar(page);
    await expect(submitButton).not.toBeDisabled(DEFAULT_TIMEOUT);
  });

  await test.step('Checking employee were updated correctly', async () => {
    await page.reload(DEFAULT_TIMEOUT);
    // we do that because these fields are unique and are set during initialization
    TEST_EMPLOYEE_1_UPDATED_INFO.email = resourceHandler.testEmployee1.email;
    TEST_EMPLOYEE_1_UPDATED_INFO.familyName = resourceHandler.testEmployee1.familyName;
    await checkEmployeeFields(page, TEST_EMPLOYEE_1_UPDATED_INFO);
  });

  await test.step('Returning employee to initial values', async () => {
    await updateEmployeesFields(page, resourceHandler.testEmployee1);

    await submitButton.click(DEFAULT_TIMEOUT);
    await expect(submitButton).not.toBeDisabled(DEFAULT_TIMEOUT);
  });

  await test.step('Updating employee data back to normal values', async () => {
    await page.reload(DEFAULT_TIMEOUT);
    await checkEmployeeFields(page, resourceHandler.testEmployee1);
  });
});

test('Deactivating employee success', async ({ page }) => {
  await page.goto(`employees`);
  await waitUntilEmployeeProviderTableLoaded(page);

  await test.step('Go to employee page and click deactivate', async () => {
    await goToTestEmployeePage(page, resourceHandler.testEmployee2);
    const deactivateButton = page.getByTestId(dataTestIds.employeesPage.deactivateUserButton);
    await expect(deactivateButton).toBeVisible(DEFAULT_TIMEOUT);
    await deactivateButton.click(DEFAULT_TIMEOUT);
    await waitForSuccessSnackbar(page);
  });

  await test.step('Checking provider deactivated successfully', async () => {
    await page.goto(`employees`);
    await waitUntilEmployeeProviderTableLoaded(page);
    await page
      .getByTestId(dataTestIds.employeesPage.searchByName)
      .getByRole('textbox')
      .fill(resourceHandler.testEmployee2.familyName);
    const table = page.getByTestId(dataTestIds.employeesPage.table);
    const targetRow = table.locator(`tr:has-text("${resourceHandler.testEmployee2.email}")`);
    await expect(targetRow.getByTestId(dataTestIds.employeesPage.statusChip)).toHaveText('DEACTIVATED');
  });
});
