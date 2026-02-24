/**
 * GitHub Status API Client
 *
 * Posts status updates back to the source repository for PR checks.
 */

import axios from 'axios'

export interface PostStatusOptions {
  owner: string
  repo: string
  sha: string
  token: string
  context: string
  state: 'success' | 'failure' | 'pending' | 'error'
  description: string
  targetUrl?: string
}

/**
 * Post a status to a commit via GitHub Status API
 */
export async function postStatus(options: PostStatusOptions): Promise<void> {
  const { owner, repo, sha, token, context, state, description, targetUrl } = options

  const url = `https://api.github.com/repos/${owner}/${repo}/statuses/${sha}`
  const body = {
    state,
    context,
    description: description.substring(0, 140), // GitHub limits to 140 chars
    target_url: targetUrl,
  }

  try {
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'poc-e2e-tests',
      },
    })

    console.log(`Status posted: ${context} - ${state} - ${description}`)
    console.log(`Response: ${response.status}`)
  } catch (error) {
    console.error(`Failed to post status: ${error}`)
    throw error
  }
}

/**
 * Parse repository from "owner/repo" format
 */
export function parseRepo(repoFullName: string): { owner: string; repo: string } {
  const [owner, repo] = repoFullName.split('/')
  if (!owner || !repo) {
    throw new Error(`Invalid repository format: ${repoFullName}`)
  }
  return { owner, repo }
}

/**
 * Create target URL for workflow run
 */
export function createWorkflowUrl(
  serverUrl: string,
  repoFullName: string,
  runId: string
): string {
  return `${serverUrl}/${repoFullName}/actions/runs/${runId}`
}

/**
 * CLI entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const [
    ,
    ,
    repoFullName,
    sha,
    token,
    context,
    state,
    description,
    targetUrl,
  ] = process.argv

  if (!repoFullName || !sha || !token || !context || !state) {
    console.error('Usage: tsx post-status.ts <repo> <sha> <token> <context> <state> [description] [targetUrl]')
    process.exit(1)
  }

  const { owner, repo } = parseRepo(repoFullName)

  postStatus({
    owner,
    repo,
    sha,
    token,
    context,
    state: state as any,
    description: description || '',
    targetUrl,
  })
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export default postStatus
