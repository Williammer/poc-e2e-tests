/**
 * Save current coverage as baseline
 */
import fs from 'fs'
import path from 'path'

function parseMonocartCoverage(reportPath: string) {
  try {
    if (!fs.existsSync(reportPath)) {
      console.log(`Coverage report not found at ${reportPath}`)
      return null
    }

    const content = fs.readFileSync(reportPath, 'utf-8')
    const data = JSON.parse(content)

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
          if (cov.l) {
            totalLines += Object.keys(cov.l).length
            coveredLines += Object.values(cov.l).filter((v: any) => v > 0).length
          }
          if (cov.f) {
            totalFunctions += Object.keys(cov.f).length
            coveredFunctions += Object.values(cov.f).filter((v: any) => v > 0).length
          }
          if (cov.b) {
            for (const branch of Object.values(cov.b)) {
              if (Array.isArray(branch)) {
                totalBranches += branch.length
                coveredBranches += branch.filter((v: any) => v > 0).length
              }
            }
          }
          if (cov.s) {
            totalStatements += Object.keys(cov.s).length
            coveredStatements += Object.values(cov.s).filter((v: any) => v > 0).length
          }
        }
      }
    }

    return {
      lines: { total: totalLines, covered: coveredLines, percentage: totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 0 },
      functions: { total: totalFunctions, covered: coveredFunctions, percentage: totalFunctions > 0 ? Math.round((coveredFunctions / totalFunctions) * 100) : 0 },
      branches: { total: totalBranches, covered: coveredBranches, percentage: totalBranches > 0 ? Math.round((coveredBranches / totalBranches) * 100) : 0 },
      statements: { total: totalStatements, covered: coveredStatements, percentage: totalStatements > 0 ? Math.round((coveredStatements / totalStatements) * 100) : 0 },
    }
  } catch (error) {
    console.error(`Error parsing coverage: ${error}`)
    return null
  }
}

export function saveBaseline(coveragePath: string, outputDir: string): void {
  const coverage = parseMonocartCoverage(coveragePath)
  if (coverage) {
    fs.mkdirSync(outputDir, { recursive: true })
    fs.writeFileSync(
      path.join(outputDir, 'baseline.json'),
      JSON.stringify(coverage, null, 2)
    )
    console.log(`Baseline saved: ${coverage.lines.percentage}% lines covered`)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const coveragePath = process.argv[2] || 'coverage/coverage-final.json'
  const outputDir = process.argv[3] || 'baseline-new'
  saveBaseline(coveragePath, outputDir)
}
