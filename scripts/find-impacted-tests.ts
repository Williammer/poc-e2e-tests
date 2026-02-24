/**
 * Find impacted tests based on changed source files
 *
 * Maps source files to test files using a file-based mapping strategy.
 * This is simpler than dependency graph analysis for E2E tests.
 */

// Mapping of source files to their corresponding E2E test files
const FILE_TO_TEST_MAP: Record<string, string[]> = {
  // Calculator related files
  'src/components/Calculator.tsx': ['tests/calculator.spec.ts'],
  'src/hooks/useCalculator.ts': ['tests/calculator.spec.ts'],
  'src/lib/utils.ts': ['tests/calculator.spec.ts'],

  // Button related files
  'src/components/Button.tsx': ['tests/button.spec.ts'],

  // App files - run all tests
  'src/App.tsx': ['tests/calculator.spec.ts', 'tests/button.spec.ts'],
  'src/main.tsx': ['tests/calculator.spec.ts', 'tests/button.spec.ts'],
}

/**
 * Parse changed files from a space-separated string
 */
function parseChangedFiles(changedFilesStr: string): string[] {
  if (!changedFilesStr) return []
  return changedFilesStr.split(' ').filter((f) => f.trim().length > 0)
}

/**
 * Find impacted test files based on changed source files
 */
export function findImpactedTests(changedFilesStr: string): string[] {
  const changedFiles = parseChangedFiles(changedFilesStr)
  const impactedTests = new Set<string>()

  for (const file of changedFiles) {
    // Normalize path (remove leading ./ or src/ if needed)
    const normalizedFile = file.replace(/^\.\//, '').replace(/^src\//, 'src/')

    // Find tests that map to this file
    const tests = FILE_TO_TEST_MAP[normalizedFile]
    if (tests) {
      tests.forEach((t) => impactedTests.add(t))
    }

    // Also check partial matches (e.g., files in subdirectories)
    for (const [sourcePattern, testFiles] of Object.entries(FILE_TO_TEST_MAP)) {
      if (normalizedFile.startsWith(sourcePattern.replace(/\.tsx?$/, ''))) {
        testFiles.forEach((t) => impactedTests.add(t))
      }
    }
  }

  return Array.from(impactedTests)
}

/**
 * CLI entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const changedFiles = process.argv[2] || ''
  const tests = findImpactedTests(changedFiles)

  if (tests.length === 0) {
    console.log('tests/') // Run all tests if no specific mapping found
  } else {
    console.log(tests.join(' '))
  }
}

export default findImpactedTests
