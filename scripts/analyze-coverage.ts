/**
 * Coverage Analysis Script
 *
 * Compares current coverage against baseline and determines if tests pass.
 * Reads Istanbul JSON format coverage reports.
 */

import fs from 'fs'
import path from 'path'

export interface CoverageSummary {
  lines: { total: number; covered: number; percentage: number }
  functions: { total: number; covered: number; percentage: number }
  branches: { total: number; covered: number; percentage: number }
  statements: { total: number; covered: number; percentage: number }
}

export interface CoverageComparison {
  passed: boolean
  current: CoverageSummary
  baseline: CoverageSummary | null
  diff: {
    lines: number
    functions: number
    branches: number
    statements: number
  }
  reason?: string
}

// Coverage thresholds
const COVERAGE_THRESHOLDS = {
  MIN_COVERAGE: 75, // Minimum coverage percentage
  MAX_DROP: 5, // Maximum allowed drop in coverage percentage
}

/**
 * Parse coverage from monocart report format
 */
function parseMonocartCoverage(reportPath: string): CoverageSummary | null {
  try {
    if (!fs.existsSync(reportPath)) {
      console.log(`Coverage report not found at ${reportPath}`)
      return null
    }

    const content = fs.readFileSync(reportPath, 'utf-8')
    const data = JSON.parse(content)

    // Monocart format: Array of coverage entries
    let totalLines = 0
    let coveredLines = 0
    let totalFunctions = 0
    let coveredFunctions = 0
    let totalBranches = 0
    let coveredBranches = 0
    let totalStatements = 0
    let coveredStatements = 0

    if (Array.isArray(data)) {
      for (const entry of data) {
        if (entry.coverage) {
          const cov = entry.coverage
          // Lines
          if (cov.l) {
            totalLines += Object.keys(cov.l).length
            coveredLines += Object.values(cov.l).filter((v: any) => v > 0).length
          }
          // Functions
          if (cov.f) {
            totalFunctions += Object.keys(cov.f).length
            coveredFunctions += Object.values(cov.f).filter((v: any) => v > 0).length
          }
          // Branches
          if (cov.b) {
            for (const branch of Object.values(cov.b)) {
              if (Array.isArray(branch)) {
                totalBranches += branch.length
                coveredBranches += branch.filter((v: any) => v > 0).length
              }
            }
          }
          // Statements (s Monaco uses s for statement map)
          if (cov.s) {
            totalStatements += Object.keys(cov.s).length
            coveredStatements += Object.values(cov.s).filter((v: any) => v > 0).length
          }
        }
      }
    }

    return {
      lines: {
        total: totalLines,
        covered: coveredLines,
        percentage: totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 0,
      },
      functions: {
        total: totalFunctions,
        covered: coveredFunctions,
        percentage: totalFunctions > 0 ? Math.round((coveredFunctions / totalFunctions) * 100) : 0,
      },
      branches: {
        total: totalBranches,
        covered: coveredBranches,
        percentage: totalBranches > 0 ? Math.round((coveredBranches / totalBranches) * 100) : 0,
      },
      statements: {
        total: totalStatements,
        covered: coveredStatements,
        percentage: totalStatements > 0 ? Math.round((coveredStatements / totalStatements) * 100) : 0,
      },
    }
  } catch (error) {
    console.error(`Error parsing coverage report: ${error}`)
    return null
  }
}

/**
 * Load baseline coverage
 */
function loadBaselineCoverage(baselineDir: string): CoverageSummary | null {
  const baselinePath = path.join(baselineDir, 'coverage-summary.json')
  try {
    if (fs.existsSync(baselinePath)) {
      const content = fs.readFileSync(baselinePath, 'utf-8')
      return JSON.parse(content) as CoverageSummary
    }
    return null
  } catch {
    return null
  }
}

/**
 * Compare current coverage against baseline
 */
export function compareCoverage(
  currentCoveragePath: string,
  baselineDir?: string
): CoverageComparison {
  const current = parseMonocartCoverage(currentCoveragePath)
  const baseline = baselineDir ? loadBaselineCoverage(baselineDir) : null

  if (!current) {
    return {
      passed: false,
      current: {
        lines: { total: 0, covered: 0, percentage: 0 },
        functions: { total: 0, covered: 0, percentage: 0 },
        branches: { total: 0, covered: 0, percentage: 0 },
        statements: { total: 0, covered: 0, percentage: 0 },
      },
      baseline: null,
      diff: { lines: 0, functions: 0, branches: 0, statements: 0 },
      reason: 'Failed to parse current coverage report',
    }
  }

  const diff = {
    lines: baseline ? current.lines.percentage - baseline.lines.percentage : 0,
    functions: baseline ? current.functions.percentage - baseline.functions.percentage : 0,
    branches: baseline ? current.branches.percentage - baseline.branches.percentage : 0,
    statements: baseline ? current.statements.percentage - baseline.statements.percentage : 0,
  }

  // Check minimum coverage threshold
  if (current.lines.percentage < COVERAGE_THRESHOLDS.MIN_COVERAGE) {
    return {
      passed: false,
      current,
      baseline,
      diff,
      reason: `Line coverage ${current.lines.percentage}% is below minimum ${COVERAGE_THRESHOLDS.MIN_COVERAGE}%`,
    }
  }

  // Check coverage drop
  if (baseline && diff.lines < -COVERAGE_THRESHOLDS.MAX_DROP) {
    return {
      passed: false,
      current,
      baseline,
      diff,
      reason: `Line coverage dropped by ${Math.abs(diff.lines)}% (max allowed: ${COVERAGE_THRESHOLDS.MAX_DROP}%)`,
    }
  }

  return {
    passed: true,
    current,
    baseline,
    diff,
  }
}

/**
 * Generate coverage description for GitHub status
 */
export function generateCoverageDescription(comparison: CoverageComparison): string {
  if (!comparison.passed) {
    return comparison.reason || 'Coverage check failed'
  }

  const { current, diff, baseline } = comparison
  const baselineInfo = baseline
    ? ` (${diff.lines >= 0 ? '+' : ''}${diff.lines}% from baseline)`
    : ''

  return `Coverage: ${current.lines.percentage}%${baselineInfo}`
}

/**
 * Save current coverage as baseline
 */
export function saveBaseline(
  currentCoveragePath: string,
  baselineDir: string
): void {
  const coverage = parseMonocartCoverage(currentCoveragePath)
  if (coverage) {
    fs.mkdirSync(baselineDir, { recursive: true })
    fs.writeFileSync(
      path.join(baselineDir, 'coverage-summary.json'),
      JSON.stringify(coverage, null, 2)
    )
    console.log(`Baseline coverage saved: ${coverage.lines.percentage}%`)
  }
}

/**
 * CLI entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const coveragePath = process.argv[2] || 'coverage/coverage-final.json'
  const baselineDir = process.argv[3] || 'coverage-baseline'

  const result = compareCoverage(coveragePath, baselineDir)

  console.log(JSON.stringify(result, null, 2))

  // Exit with appropriate code
  process.exit(result.passed ? 0 : 1)
}

export default compareCoverage
