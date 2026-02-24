# POC E2E Tests

Playwright E2E test suite for the cross-repo CI/CD POC.

## Setup

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
npm install
npx playwright install --with-deps
```

### Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with headed browser
npm run test:headed

# Run with coverage
npm run test:coverage
```

## GitHub Secrets Configuration

This repository requires the following GitHub secrets to be configured:

| Secret | Description | Example |
|--------|-------------|---------|
| `SOURCE_PAT` | Personal Access Token for posting status to source repo | `ghp_xxxxxxxxxxxx` |
| `SOURCE_REPO` | Name of the source repository (optional, for reference) | `your-username/poc-source-app` |

### Creating the PAT

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with the following scopes:
   - `repo:status` - to update commit statuses
   - `repo_deployment` - for deployment access
3. Copy the token and add it as a secret named `SOURCE_PAT`

## CI/CD Flow

This repository is triggered by the source repository via `repository_dispatch`:

1. Source repo PR triggers this workflow with:
   - `source_repo`: Source repository name
   - `commit_sha`: Commit SHA to test
   - `changed_files`: List of changed files
   - `pr_number`: Pull request number

2. This workflow:
   - Checks out the source repo at the specified commit
   - Installs dependencies for both repos
   - Determines which tests to run based on changed files
   - Starts the source app
   - Runs Playwright tests with coverage collection
   - Analyzes coverage against baseline
   - Posts status back to source repo (two checks):
     - `e2e/coverage` - Coverage analysis results
     - `e2e/tests` - Test execution results

## Test Mapping

Tests are mapped to source files in `scripts/find-impacted-tests.ts`:

| Source File | Tests |
|-------------|-------|
| `src/components/Calculator.tsx` | `tests/calculator.spec.ts` |
| `src/hooks/useCalculator.ts` | `tests/calculator.spec.ts` |
| `src/lib/utils.ts` | `tests/calculator.spec.ts` |
| `src/components/Button.tsx` | `tests/button.spec.ts` |
| `src/App.tsx` | All tests |
| `src/main.tsx` | All tests |

## Coverage

Coverage is collected using `monocart-coverage-reports` and compared against a baseline:

- **Minimum coverage**: 75%
- **Max coverage drop**: 5%

To update the baseline after legitimate coverage changes:

```bash
npx tsx -e "import('./scripts/analyze-coverage.js').then(m => m.saveBaseline('coverage/coverage-final.json', 'coverage-baseline'))"
```

## Project Structure

```
tests/
├── calculator.spec.ts    # Calculator E2E tests
└── button.spec.ts        # Button component E2E tests
scripts/
├── find-impacted-tests.ts  # File-to-test mapping
├── analyze-coverage.ts     # Coverage comparison
└── post-status.ts          # GitHub Status API client
coverage-baseline/
└── coverage-summary.json   # Baseline coverage data
```
