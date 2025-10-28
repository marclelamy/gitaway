export interface GitHubRepo {
    id: number
    name: string
    fullName: string
    owner: {
        login: string
        avatarUrl: string
    }
    description: string | null
    private: boolean
    htmlUrl: string
    defaultBranch: string
    updatedAt: string
    lastCommit?: {
        message: string
        date: string
        author: string
    }
}

export interface GitHubWebhook {
    id: number
    active: boolean
    config: {
        url: string
        contentType: string
    }
}
