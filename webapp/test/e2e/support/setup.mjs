import { setWorldConstructor, Before, After, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium } from 'playwright'

setDefaultTimeout(60_000)

class CustomWorld {
  browser = null
  page = null
}

setWorldConstructor(CustomWorld)

Before(async function () {
  // Allow turning off headless mode and enabling slow motion/devtools via env vars
  const headless = true
  const slowMo = 0
  const devtools = false

  this.browser = await chromium.launch({ headless, slowMo, devtools })
  this.context = await this.browser.newContext({
    locale: 'es', 
    viewport: { width: 1280, height: 720 } 
  });
  this.page = await this.browser.newPage()
})

After(async function () {
 if (this.page && !this.page.isClosed()) {
    await this.page.close();
  }
  if (this.context) {
    await this.context.close();
  }

})
