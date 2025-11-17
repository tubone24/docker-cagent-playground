import { test as base } from '@playwright/test'

export type TestFixtures = {
  mockApi: void
}

export const test = base.extend<TestFixtures>({
  mockApi: async ({ page }, use) => {
    // Set up common API mocks that are used across all tests
    await page.route('**/api/agents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          agents: [
            {
              id: 'default-agent',
              name: 'Default Agent',
              description: 'Default test agent',
              model: 'claude-3-5-sonnet-20241022',
            },
          ],
        }),
      })
    })

    await use()
  },
})

export { expect } from '@playwright/test'
