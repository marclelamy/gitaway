import { Octokit } from 'octokit'
import type { GitHubRepo, GitHubWebhook } from './types/github'

function getOctokitClient(accessToken: string): Octokit {
    return new Octokit({ auth: accessToken })
}

export function parseRepoFullName(fullName: string): { owner: string; repo: string } {
    const [owner, repo] = fullName.split('/')
    if (!owner || !repo) {
        throw new Error('Invalid repository format. Expected: "owner/repo"')
    }
    return { owner, repo }
}

export async function getRepos(
    accessToken: string,
    page: number = 1,
    perPage: number = 30
): Promise<GitHubRepo[]> {
    try {
        const octokit = getOctokitClient(accessToken)

        // Fetch repos with pagination
        const { data } = await octokit.rest.repos.listForAuthenticatedUser({
            per_page: perPage,
            page: page,
            type: 'all',
            sort: 'updated',
            direction: 'desc',
        })

        // Return repos immediately without fetching commits
        // Commits will be loaded separately on-demand
        return data.map((repo): GitHubRepo => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            owner: {
                login: repo.owner.login,
                avatarUrl: repo.owner.avatar_url,
            },
            description: repo.description,
            private: repo.private,
            htmlUrl: repo.html_url,
            defaultBranch: repo.default_branch,
            updatedAt: repo.updated_at || new Date().toISOString(),
            lastCommit: undefined, // Will be loaded on-demand
        }))
    } catch (error: any) {
        if (error.status === 401) {
            throw new Error('GitHub authentication expired. Please reconnect.')
        }
        throw new Error(`Failed to fetch repositories: ${error.message}`)
    }
}

export async function getLastCommit(
    accessToken: string,
    owner: string,
    repo: string,
    branch: string = 'main'
): Promise<{ message: string; date: string; author: string } | null> {
    try {
        const octokit = getOctokitClient(accessToken)

        const { data: commits } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            per_page: 1,
            sha: branch,
        })

        if (commits.length > 0) {
            const commit = commits[0]
            return {
                message: commit.commit.message.split('\n')[0],
                date: commit.commit.author?.date || '',
                author: commit.commit.author?.name || 'Unknown',
            }
        }

        return null
    } catch (error: any) {
        // Handle empty repositories (409 error)
        if (error.status === 409) {
            console.log(`Repository ${owner}/${repo} is empty (no commits yet)`)
            return null
        }
        console.error(`Failed to fetch last commit for ${owner}/${repo}:`, error)
        return null
    }
}

export async function createWebhook(
    accessToken: string,
    owner: string,
    repo: string,
    webhookUrl: string,
    secret: string
): Promise<GitHubWebhook> {
    try {
        const octokit = getOctokitClient(accessToken)

        const { data } = await octokit.rest.repos.createWebhook({
            owner,
            repo,
            config: {
                url: webhookUrl,
                content_type: 'json',
                secret: secret,
                insecure_ssl: '0',
            },
            events: ['push'],
            active: true,
        })

        return {
            id: data.id,
            active: data.active,
            config: {
                url: data.config.url || '',
                contentType: data.config.content_type || '',
            },
        }
    } catch (error: any) {
        if (error.status === 401) {
            throw new Error('GitHub authentication expired.')
        }
        if (error.status === 403) {
            throw new Error('Insufficient permissions. Need admin access to create webhooks.')
        }
        if (error.status === 404) {
            throw new Error('Repository not found or you don\'t have access.')
        }
        if (error.status === 422) {
            throw new Error('Webhook already exists or validation failed.')
        }
        throw new Error(`Failed to create webhook: ${error.message}`)
    }
}

export async function deleteWebhook(
    accessToken: string,
    owner: string,
    repo: string,
    webhookId: number
): Promise<void> {
    try {
        const octokit = getOctokitClient(accessToken)

        await octokit.rest.repos.deleteWebhook({
            owner,
            repo,
            hook_id: webhookId,
        })
    } catch (error: any) {
        if (error.status === 404) {
            return
        }
        throw new Error(`Failed to delete webhook: ${error.message}`)
    }
}
