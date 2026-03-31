import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

When('I enter the login username {string}', async function (username) {
  const page = this.page;
  await page.locator('#login-username').fill(username);
});

When('I enter the login password {string}', async function (password) {
  const page = this.page;
  await page.locator('#login-password').fill(password);
});

When('I click the main menu play button', async function () {
  const page = this.page;
  await page.locator('.main-button.full-width').click();
});

When('I click the preview play now button', async function () {
  const page = this.page;
  // The play button inside the size and dificulty selector
  await page.locator('.btn-play-now-preview').click();
});

When('I click on an empty hexagonal cell', async function () {
  const page = this.page;
  // We wait for the board to load
  await page.waitForSelector('.hex-cell');
  // And find the first empty cell
  const emptyCell = page.locator('.hex-cell:not(.p1-selected):not(.p2-selected)').first();
  await emptyCell.click();
});

When('I confirm my move', async function () {
  const page = this.page;
  // We confirm the action
  await page.locator('.btn-confirm-action').click();
});

Then('the bot should place a piece automatically', async function () {
  const page = this.page;
  
  // Bots placed cells are called 'p2-selected'
  const botCell = page.locator('.hex-cell.p2-selected');
  
  // The bot has a 1200ms timeout. So we wait 3000ms
  await expect(botCell).toHaveCount(1, { timeout: 3000 });
});