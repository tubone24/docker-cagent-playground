import { useDarkModeStore } from '@/lib/dark-mode-store'
import { renderHook, act } from '@testing-library/react'

describe('useDarkModeStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useDarkModeStore.setState({ darkMode: false })
    })
  })

  it('should initialize with darkMode false', () => {
    const { result } = renderHook(() => useDarkModeStore())
    expect(result.current.darkMode).toBe(false)
  })

  it('should toggle dark mode', () => {
    const { result } = renderHook(() => useDarkModeStore())

    act(() => {
      result.current.toggleDarkMode()
    })

    expect(result.current.darkMode).toBe(true)

    act(() => {
      result.current.toggleDarkMode()
    })

    expect(result.current.darkMode).toBe(false)
  })

  it('should set dark mode explicitly', () => {
    const { result } = renderHook(() => useDarkModeStore())

    act(() => {
      result.current.setDarkMode(true)
    })

    expect(result.current.darkMode).toBe(true)

    act(() => {
      result.current.setDarkMode(false)
    })

    expect(result.current.darkMode).toBe(false)
  })
})
