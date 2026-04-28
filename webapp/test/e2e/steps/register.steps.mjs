import { Given, When, Then} from '@cucumber/cucumber'
import { expect, request } from '@playwright/test'

/////////////////////////////////////////////////////////////////////// SCENARIO 1 ////////////////////////////////////////////////////////////////////////////////////////////
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
  const button = page.getByRole('button', { 
    name: new RegExp(textToButton, 'i'), 
    exact: false 
  });

  await button.click();
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

Then('I should see the GAME Y title', async function () {
  const gamey = this.page.getByRole('heading', { name: 'GAME Y', level: 1 }); 
  await expect(gamey).toBeVisible();
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////// SCENARIO 2 ////////////////////////////////////////////////////////////////////////////////////////////
Given('the main page opened and a user already created with username {string} and email {string}', async function (username, email) {
  const page = this.page;
  if (!page) throw new Error('Page not initialized');

  // 1. Use the defined API
  const apiContext = await request.newContext({
    baseURL: 'http://localhost:3001' //port 3001 just for testing, to deploy the app is port 3000
  });

  const response = await apiContext.post('/users/createuser', { 
    data: {
      username: username,
      nickname: "BotNickname",
      email: email,
      password: "Test@123456",
      photo: "default.png",
    }
  });
 
  expect(response.ok()).toBeTruthy();

  await page.goto('http://localhost:5173');
});

// Here all the "When" defined in the SCENARIO 1 are reused automatically

Then('I should see an error', async function () {
  const page = this.page;
  if (!page) throw new Error('Page not initialized');

  // Here the class of the element is used to searching
  const errorMessage = page.locator('.live-error-text');
  
  // We check
  await expect(errorMessage).toBeVisible();
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////// SCENARIO 3 ////////////////////////////////////////////////////////////////////////////////////////////

// Reuse the SCENARIO 2

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////