import { test, expect } from '@playwright/test'

test.describe('Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display initial value 0', async ({ page }) => {
    const display = page.getByTestId('display')
    await expect(display).toHaveText('0')
  })

  test('should input single digit', async ({ page }) => {
    await page.getByTestId('digit-5').click()
    await expect(page.getByTestId('display')).toHaveText('5')
  })

  test('should input multiple digits', async ({ page }) => {
    await page.getByTestId('digit-1').click()
    await page.getByTestId('digit-2').click()
    await page.getByTestId('digit-3').click()
    await expect(page.getByTestId('display')).toHaveText('123')
  })

  test('should clear display', async ({ page }) => {
    await page.getByTestId('digit-5').click()
    await page.getByTestId('clear').click()
    await expect(page.getByTestId('display')).toHaveText('0')
  })

  test('should add two numbers', async ({ page }) => {
    await page.getByTestId('digit-5').click()
    await page.getByTestId('add').click()
    await page.getByTestId('digit-3').click()
    await page.getByTestId('equals').click()
    await expect(page.getByTestId('display')).toHaveText('8')
  })

  test('should subtract two numbers', async ({ page }) => {
    await page.getByTestId('digit-9').click()
    await page.getByTestId('subtract').click()
    await page.getByTestId('digit-4').click()
    await page.getByTestId('equals').click()
    await expect(page.getByTestId('display')).toHaveText('5')
  })

  test('should multiply two numbers', async ({ page }) => {
    await page.getByTestId('digit-3').click()
    await page.getByTestId('multiply').click()
    await page.getByTestId('digit-4').click()
    await page.getByTestId('equals').click()
    await expect(page.getByTestId('display')).toHaveText('12')
  })

  test('should divide two numbers', async ({ page }) => {
    await page.getByTestId('digit-8').click()
    await page.getByTestId('divide').click()
    await page.getByTestId('digit-2').click()
    await page.getByTestId('equals').click()
    await expect(page.getByTestId('display')).toHaveText('4')
  })

  test('should handle decimal input', async ({ page }) => {
    await page.getByTestId('digit-5').click()
    await page.getByTestId('decimal').click()
    await page.getByTestId('digit-5').click()
    await expect(page.getByTestId('display')).toHaveText('5.5')
  })

  test('should chain operations', async ({ page }) => {
    await page.getByTestId('digit-2').click()
    await page.getByTestId('add').click()
    await page.getByTestId('digit-3').click()
    await page.getByTestId('equals').click()
    await expect(page.getByTestId('display')).toHaveText('5')
    await page.getByTestId('multiply').click()
    await page.getByTestId('digit-4').click()
    await page.getByTestId('equals').click()
    await expect(page.getByTestId('display')).toHaveText('20')
  })

  test('should only allow one decimal point', async ({ page }) => {
    await page.getByTestId('digit-5').click()
    await page.getByTestId('decimal').click()
    await page.getByTestId('decimal').click()
    await page.getByTestId('digit-5').click()
    await expect(page.getByTestId('display')).toHaveText('5.5')
  })
})

test.describe('Calculator - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should handle zero as first operand', async ({ page }) => {
    await page.getByTestId('digit-0').click()
    await page.getByTestId('add').click()
    await page.getByTestId('digit-5').click()
    await page.getByTestId('equals').click()
    await expect(page.getByTestId('display')).toHaveText('5')
  })

  test('should handle division by zero gracefully', async ({ page }) => {
    await page.getByTestId('digit-5').click()
    await page.getByTestId('divide').click()
    await page.getByTestId('digit-0').click()
    await page.getByTestId('equals').click()
    // Should display Infinity or error message
    const display = page.getByTestId('display')
    const text = await display.textContent()
    expect(text === 'Infinity' || text === 'NaN' || text?.includes('Error')).toBeTruthy()
  })
})
