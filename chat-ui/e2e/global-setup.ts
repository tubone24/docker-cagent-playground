import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Initialize MSW in the browser context
  await page.goto(baseURL || 'http://localhost:3000')

  // Inject MSW worker initialization script
  await page.addInitScript(() => {
    // This will be executed in the browser context before each test
    if (typeof window !== 'undefined') {
      // Set flag to enable MSW in development/test mode
      window.__MSW_ENABLED__ = true
    }
  })

  await browser.close()
}

export default globalSetup
