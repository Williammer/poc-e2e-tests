import { defineConfig } from '@playwright/test'

// Conditionally add monocart coverage reporter
const reporters: any[] = [
  ['html'],
  ['json', { outputFile: 'test-results/results.json' }],
  ['list']
]

// Only add monocart reporter if the package is available
try {
  require.resolve('monocart-coverage-reports')
  reporters.push([
    'monocart-coverage',
    {
      reports: [
        ['json', {
          dir: 'coverage',
          fileName: 'coverage-final.json'
        }],
        ['html', {
          dir: 'coverage-html'
        }]
      ],
      entryFilter: (entry: any) => {
        return entry.url.includes('localhost:5173')
      },
      sourceFilter: (source: any) => {
        return source.path.includes('/src/')
      },
      onEnd: async (coverageReports: any) => {
        console.log('Coverage collection completed')
      }
    }
  ])
} catch {
  console.log('monocart-coverage-reports not found, coverage reporting disabled')
}

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: reporters,
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    baseURL: 'http://localhost:5173',
  },
})
