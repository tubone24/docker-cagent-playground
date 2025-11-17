import { http, HttpResponse } from 'msw'

const API_BASE_URL = process.env.CAGENT_API_BASE_URL || 'http://localhost:8080/api'

export const handlers = [
  // Get agents list
  http.get(`${API_BASE_URL}/agents`, () => {
    return HttpResponse.json({
      agents: [
        {
          id: 'test-agent',
          name: 'Test Agent',
          description: 'A test agent for e2e testing',
          model: 'claude-3-5-sonnet-20241022',
        },
      ],
    })
  }),

  // Get sessions for an agent
  http.get(`${API_BASE_URL}/agents/:agentId/sessions`, ({ params }) => {
    return HttpResponse.json({
      sessions: [
        {
          id: 'test-session-1',
          agent_id: params.agentId,
          title: 'Test Session 1',
          created_at: new Date().toISOString(),
        },
      ],
    })
  }),

  // Create new session
  http.post(`${API_BASE_URL}/agents/:agentId/sessions`, ({ params }) => {
    return HttpResponse.json({
      session_id: 'new-test-session',
      agent_id: params.agentId,
      created_at: new Date().toISOString(),
    })
  }),

  // Get session messages
  http.get(`${API_BASE_URL}/sessions/:sessionId/messages`, () => {
    return HttpResponse.json({
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello',
          created_at: new Date().toISOString(),
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Hello! How can I help you today?',
          created_at: new Date().toISOString(),
        },
      ],
    })
  }),

  // Execute agent (SSE endpoint) - returns mock streaming response
  http.post(`${API_BASE_URL}/agents/:agentId/execute`, async ({ request }) => {
    const body = await request.text()

    // For SSE testing, we'll return a simple response
    // In real tests, you might want to use a custom handler per test
    return new HttpResponse(
      `data: ${JSON.stringify({ type: 'stream_started', session_id: 'test-session' })}\n\n` +
      `data: ${JSON.stringify({ type: 'agent_choice', content: 'Mock response', agent_name: 'test-agent' })}\n\n` +
      `data: ${JSON.stringify({ type: 'stream_stopped' })}\n\n`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    )
  }),

  // Delete session
  http.delete(`${API_BASE_URL}/sessions/:sessionId`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Approve tool
  http.post(`${API_BASE_URL}/sessions/:sessionId/approve-tool`, () => {
    return HttpResponse.json({ success: true })
  }),

  // Resume session
  http.post(`${API_BASE_URL}/sessions/:sessionId/resume`, () => {
    return new HttpResponse(
      `data: ${JSON.stringify({ type: 'stream_started' })}\n\n` +
      `data: ${JSON.stringify({ type: 'agent_choice', content: 'Resumed response' })}\n\n` +
      `data: ${JSON.stringify({ type: 'stream_stopped' })}\n\n`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
        },
      }
    )
  }),
]
