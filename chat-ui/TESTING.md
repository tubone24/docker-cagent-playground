# Testing Guide

このプロジェクトでは、Jest（ユニットテスト）とPlaywright（E2Eテスト）を使用しています。

## セットアップ

```bash
cd chat-ui
npm install
```

Playwrightブラウザーをインストール：

```bash
npx playwright install
```

## ユニットテスト（Jest）

### テストの実行

```bash
# 全テストを実行
npm run test

# ウォッチモードで実行（開発時に便利）
npm run test:watch

# カバレッジレポート付きで実行
npm run test:coverage
```

### テストの書き方

ユニットテストは `__tests__` ディレクトリまたは `*.test.ts(x)` ファイルに配置します。

```typescript
// __tests__/lib/example.test.ts
import { myFunction } from '@/lib/example'

describe('myFunction', () => {
  it('should return expected value', () => {
    expect(myFunction('input')).toBe('expected output')
  })
})
```

### Reactコンポーネントのテスト

React Testing Libraryを使用します：

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<MyComponent onClick={handleClick} />)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## E2Eテスト（Playwright）

### テストの実行

```bash
# 全E2Eテストを実行（ヘッドレスモード）
npm run test:e2e

# UIモードで実行（デバッグに便利）
npm run test:e2e:ui

# ブラウザを表示して実行
npm run test:e2e:headed
```

### テストの書き方

E2Eテストは `e2e` ディレクトリに配置します。

```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test'

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Button')
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

### APIモック（MSW）

Cagent APIバックエンドをモックするには、Playwrightの `page.route()` を使用します：

```typescript
test('should display mocked data', async ({ page }) => {
  // APIレスポンスをモック
  await page.route('**/api/agents', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        agents: [{ id: 'test', name: 'Test Agent' }],
      }),
    })
  })

  await page.goto('/')
  await expect(page.locator('text=Test Agent')).toBeVisible()
})
```

## Lint & Format

### ESLint

```bash
# コードをチェック
npm run lint

# 自動修正
npm run lint:fix
```

### Prettier

```bash
# フォーマットをチェック
npm run format:check

# 自動フォーマット
npm run format
```

## すべて実行

リント、フォーマットチェック、ユニットテスト、E2Eテストを一度に実行：

```bash
npm run test:all
```

## CI/CD

GitHub ActionsなどのCI環境では、以下のコマンドを順に実行することを推奨します：

```bash
npm ci
npm run lint
npm run format:check
npm run test
npm run build
npm run test:e2e
```

## トラブルシューティング

### Playwrightブラウザーが見つからない

```bash
npx playwright install
```

### Jestでモジュールが見つからない

`jest.config.ts` の `moduleNameMapper` を確認してください。

### E2Eテストがタイムアウトする

開発サーバーが起動していることを確認してください。`playwright.config.ts` の `webServer` 設定により、自動的に起動されるはずです。
