import { Given, When, Then} from '@cucumber/cucumber'
import { expect, request } from '@playwright/test'

/////////////////////////////////////////////////////////////////////// SCENARIO 1 ////////////////////////////////////////////////////////////////////////////////////////////

When('I write the username {string}', async function (username) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.locator('#login-username').fill(username);
})

When('I write the password {string}', async function (password) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.locator('#login-password').fill(password);
})

Then('I should see the page for playing', async function () {
  const gamey = this.page.getByRole('heading', { name: 'GAME Y', level: 1 }); 
  await expect(gamey).toBeVisible();
});