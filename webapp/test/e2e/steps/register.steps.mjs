import { Given, When, Then} from '@cucumber/cucumber'
import { expect } from '@playwright/test'

Given('the main page opened', async function () {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.goto('http://localhost:5173')
})

// It works for clicking in creating the account,
// and for clicking in the signup button
When('I click on {string}', async function (textToButton) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.getByRole('button', { name: textToButton }).click();
})

When('I enter the username {string}', async function (username) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.locator('#signup-username').fill(username);
})
When('I enter the nickname {string}', async function (usernick) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.locator('#signup-nickname').fill(usernick);
})
When('I enter the email {string}', async function (email) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.locator('#signup-email').fill(email);
})
When('I enter the password {string}', async function (password) {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.locator('#password').fill(password);
})

Then('I should see the login page', async function () {
  const botonLogin = this.page.getByRole('button', { name: 'PLAY' }); 
  await expect(botonLogin).toBeVisible();
})
