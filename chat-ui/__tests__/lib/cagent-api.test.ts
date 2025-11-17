import { CagentAPI } from '@/lib/cagent-api'

describe('CagentAPI', () => {
  let api: CagentAPI

  beforeEach(() => {
    api = new CagentAPI('http://localhost:8080/api')
  })

  describe('getAgents', () => {
    it('should fetch agents successfully', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              agents: [
                { id: 'test-agent', name: 'Test Agent', description: 'Test description' },
              ],
            }),
        })
      ) as jest.Mock

      const agents = await api.getAgents()

      expect(agents).toHaveLength(1)
      expect(agents[0].id).toBe('test-agent')
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/agents', {
        credentials: 'include',
      })
    })

    it('should throw error when fetch fails', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
      ) as jest.Mock

      await expect(api.getAgents()).rejects.toThrow('Failed to fetch agents')
    })
  })

  describe('getSessions', () => {
    it('should fetch sessions for an agent', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              sessions: [
                {
                  id: 'session-1',
                  agent_id: 'test-agent',
                  title: 'Test Session',
                  created_at: '2025-01-01T00:00:00Z',
                },
              ],
            }),
        })
      ) as jest.Mock

      const sessions = await api.getSessions('test-agent')

      expect(sessions).toHaveLength(1)
      expect(sessions[0].id).toBe('session-1')
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/agents/test-agent/sessions',
        { credentials: 'include' }
      )
    })
  })

  describe('createSession', () => {
    it('should create a new session', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              session_id: 'new-session',
              agent_id: 'test-agent',
            }),
        })
      ) as jest.Mock

      const session = await api.createSession('test-agent')

      expect(session.session_id).toBe('new-session')
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/agents/test-agent/sessions',
        {
          method: 'POST',
          credentials: 'include',
        }
      )
    })
  })
})
