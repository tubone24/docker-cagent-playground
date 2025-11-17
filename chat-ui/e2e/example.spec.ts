import { test, expect } from '@playwright/test'

test.describe('Chat UI', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
  })

  test('should display the main page', async ({ page }) => {
    // Check if the title is visible
    await expect(page).toHaveTitle(/Cagent Chat UI/i)
  })

  test('should load agents list', async ({ page }) => {
    // Mock the API response using route
    await page.route('**/api/agents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          agents: [
            {
              id: 'test-agent',
              name: 'Test Agent',
              description: 'A test agent for e2e testing',
              model: 'claude-3-5-sonnet-20241022',
            },
          ],
        }),
      })
    })

    await page.reload()

    // Wait for the agents to load
    await page.waitForSelector('text=Test Agent', { timeout: 5000 })

    // Verify agent is displayed
    await expect(page.locator('text=Test Agent')).toBeVisible()
  })

  test('should select an agent and create a session', async ({ page }) => {
    // Mock agents endpoint
    await page.route('**/api/agents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          agents: [
            {
              id: 'test-agent',
              name: 'Test Agent',
              description: 'A test agent',
              model: 'claude-3-5-sonnet-20241022',
            },
          ],
        }),
      })
    })

    // Mock sessions endpoint
    await page.route('**/api/agents/test-agent/sessions', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ sessions: [] }),
        })
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            session_id: 'new-session',
            agent_id: 'test-agent',
            created_at: new Date().toISOString(),
          }),
        })
      }
    })

    await page.reload()

    // Wait for agent to be available and click it
    const agentButton = page.locator('text=Test Agent').first()
    await agentButton.waitFor({ state: 'visible' })
    await agentButton.click()

    // Verify session is created (this depends on your UI implementation)
    // You might need to adjust this selector based on your actual UI
    await page.waitForTimeout(1000)
  })

  test('should send a message and receive a response', async ({ page }) => {
    // Mock agents endpoint
    await page.route('**/api/agents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          agents: [
            {
              id: 'test-agent',
              name: 'Test Agent',
              description: 'A test agent',
            },
          ],
        }),
      })
    })

    // Mock sessions endpoint
    await page.route('**/api/agents/test-agent/sessions', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            session_id: 'test-session',
            agent_id: 'test-agent',
          }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ sessions: [] }),
        })
      }
    })

    // Mock execute endpoint (SSE)
    await page.route('**/api/agents/test-agent/execute', async (route) => {
      const sseResponse = [
        `data: ${JSON.stringify({ type: 'stream_started', session_id: 'test-session' })}`,
        '',
        `data: ${JSON.stringify({ type: 'agent_choice', content: 'Hello! This is a test response.', agent_name: 'test-agent' })}`,
        '',
        `data: ${JSON.stringify({ type: 'stream_stopped' })}`,
        '',
      ].join('\n')

      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: sseResponse,
      })
    })

    await page.reload()

    // Select agent
    const agentButton = page.locator('text=Test Agent').first()
    await agentButton.waitFor({ state: 'visible' })
    await agentButton.click()

    await page.waitForTimeout(500)

    // Type a message (adjust selector based on your UI)
    const messageInput = page.locator('textarea, input[type="text"]').first()
    await messageInput.waitFor({ state: 'visible' })
    await messageInput.fill('Hello, test!')

    // Send the message (adjust selector based on your UI)
    const sendButton = page.locator('button[type="submit"]').first()
    await sendButton.click()

    // Wait for response (adjust based on your UI)
    await page.waitForTimeout(1000)
  })
})
