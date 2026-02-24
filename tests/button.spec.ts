import { test, expect } from '@playwright/test'

test.describe('Button Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should render all digit buttons', async ({ page }) => {
    for (let i = 0; i <= 9; i++) {
      const button = page.getByTestId(`digit-${i}`)
      await expect(button).toBeVisible()
      await expect(button).toHaveText(String(i))
    }
  })

  test('should render operation buttons', async ({ page }) => {
    await expect(page.getByTestId('add')).toBeVisible()
    await expect(page.getByTestId('subtract')).toBeVisible()
    await expect(page.getByTestId('multiply')).toBeVisible()
    await expect(page.getByTestId('divide')).toBeVisible()
  })

  test('should render clear button', async ({ page }) => {
    const clearButton = page.getByTestId('clear')
    await expect(clearButton).toBeVisible()
    await expect(clearButton).toHaveText('C')
  })

  test('should render equals button', async ({ page }) => {
    const equalsButton = page.getByTestId('equals')
    await expect(equalsButton).toBeVisible()
    await expect(equalsButton).toHaveText('=')
  })

  test('should render decimal button', async ({ page }) => {
    const decimalButton = page.getByTestId('decimal')
    await expect(decimalButton).toBeVisible()
    await expect(decimalButton).toHaveText('.')
  })

  test('should be clickable', async ({ page }) => {
    const button = page.getByTestId('digit-5')
    await button.click()
    await expect(page.getByTestId('display')).toHaveText('5')
  })
})

test.describe('Button - Visual States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('clear button should have danger styling', async ({ page }) => {
    const clearButton = page.getByTestId('clear')
    await expect(clearButton).toBeVisible()
    // Check that the button has some background color (not transparent or empty)
    const bgColor = await clearButton.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    )
    expect(bgColor).toBeTruthy()
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(bgColor).not.toBe('transparent')
  })

  test('equals button should have primary styling', async ({ page }) => {
    const equalsButton = page.getByTestId('equals')
    await expect(equalsButton).toBeVisible()
    // Check that the button has some background color (not transparent or empty)
    const bgColor = await equalsButton.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    )
    expect(bgColor).toBeTruthy()
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(bgColor).not.toBe('transparent')
  })
})
