import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    baseURL: 'http://localhost:5173',
  },
  // Monocart coverage reporter configuration
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
    ['monocart-coverage', {
      reports: [
        ['json', {
          dir: 'coverage',
          fileName: 'coverage-final.json'
        }],
        ['html', {
          dir: 'coverage-html'
        }]
      ],
      entryFilter: (entry) => {
        // Only collect coverage from localhost
        return entry.url.includes('localhost:5173')
      },
      sourceFilter: (source) => {
        // Only include src/ files
        return source.path.includes('/src/')
      },
      onEnd: async (coverageReports) => {
        console.log('Coverage collection completed');
        console.log(`Coverage summary: ${JSON.stringify(coverageReports)}`);
      }
    }]
  ]
});
