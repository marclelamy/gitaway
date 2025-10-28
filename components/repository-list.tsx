"use client"

import { useEffect, useState } from "react"
import { GitHubRepo } from "@/lib/types/github"
import { Loader2, Lock, GitBranch, ExternalLink, Clock } from "lucide-react"

export default function RepositoryList() {
    const [repos, setRepos] = useState<GitHubRepo[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [commitsLoading, setCommitsLoading] = useState<Set<number>>(new Set())

    useEffect(() => {
        fetchRepos(1)
    }, [])

    useEffect(() => {
        // Fetch commits for repos that don't have them yet
        const reposNeedingCommits = repos.filter(r => !r.lastCommit && !commitsLoading.has(r.id))
        if (reposNeedingCommits.length > 0) {
            fetchCommitsForRepos(reposNeedingCommits)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repos.length])

    async function fetchRepos(pageNum: number) {
        try {
            if (pageNum === 1) {
                setLoading(true)
            } else {
                setLoadingMore(true)
            }
            setError(null)
            
            const response = await fetch(`/api/github/repos?page=${pageNum}&per_page=30`)
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to fetch repositories")
            }

            const data = await response.json()
            
            if (pageNum === 1) {
                setRepos(data.repos)
            } else {
                setRepos(prev => [...prev, ...data.repos])
            }
            
            setHasMore(data.hasMore)
            setPage(pageNum)
        } catch (err: any) {
            setError(err.message || "Failed to fetch repositories")
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    function handleLoadMore() {
        fetchRepos(page + 1)
    }

    async function fetchCommitsForRepos(reposToFetch: GitHubRepo[]) {
        // Mark these repos as loading commits
        setCommitsLoading(prev => {
            const newSet = new Set(prev)
            reposToFetch.forEach(r => newSet.add(r.id))
            return newSet
        })

        // Fetch commits in parallel but limit concurrency
        const batchSize = 5
        for (let i = 0; i < reposToFetch.length; i += batchSize) {
            const batch = reposToFetch.slice(i, i + batchSize)
            
            await Promise.all(
                batch.map(async (repo) => {
                    try {
                        const response = await fetch(
                            `/api/github/repos/${repo.owner.login}/${repo.name}/last-commit?branch=${repo.defaultBranch}`
                        )
                        
                        if (response.ok) {
                            const data = await response.json()
                            
                            // Update the repo with commit data
                            setRepos(prevRepos => 
                                prevRepos.map(r => 
                                    r.id === repo.id 
                                        ? { ...r, lastCommit: data.lastCommit }
                                        : r
                                )
                            )
                        }
                    } catch (error) {
                        console.error(`Failed to fetch commit for ${repo.fullName}:`, error)
                    } finally {
                        // Remove from loading set
                        setCommitsLoading(prev => {
                            const newSet = new Set(prev)
                            newSet.delete(repo.id)
                            return newSet
                        })
                    }
                })
            )
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
                    <p className="text-slate-600">Loading repositories...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-900 font-semibold mb-2">Error Loading Repositories</h3>
                <p className="text-red-700">{error}</p>
            </div>
        )
    }

    if (repos.length === 0) {
        return (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                <GitBranch className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-slate-900 font-semibold mb-2">No Repositories Found</h3>
                <p className="text-slate-600">You don't have any repositories yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {repos.map((repo) => {
                    const commitDate = repo.lastCommit?.date
                        ? new Date(repo.lastCommit.date)
                        : null
                    const timeAgo = commitDate ? getTimeAgo(commitDate) : null
                    const isLoadingCommit = commitsLoading.has(repo.id)

                    return (
                        <div
                            key={repo.id}
                            className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <GitBranch className="h-5 w-5 text-slate-600 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 truncate">
                                            {repo.name}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Updated {getTimeAgo(new Date(repo.updatedAt))}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                    {repo.private && (
                                        <Lock className="h-4 w-4 text-slate-500" />
                                    )}
                                </div>
                            </div>

                            {/* Last Commit Info */}
                            {isLoadingCommit ? (
                                <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                                    <Clock className="h-3 w-3 animate-pulse" />
                                    <span>Loading commit...</span>
                                </div>
                            ) : repo.lastCommit ? (
                                <div className="mb-2">
                                    <p className="text-xs text-slate-500 truncate">
                                        {repo.lastCommit.message}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {timeAgo} by {repo.lastCommit.author}
                                    </p>
                                </div>
                            ) : null}

                            {repo.description && (
                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                    {repo.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                                <span className="flex items-center gap-1">
                                    <span className={`inline-block w-2 h-2 rounded-full ${repo.private ? "bg-orange-500" : "bg-green-500"}`} />
                                    {repo.private ? "Private" : "Public"}
                                </span>
                                <a
                                    href={repo.htmlUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                                >
                                    View <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    )
                })}
            </div>

            {hasMore && (
                <div className="flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition-colors flex items-center gap-2"
                    >
                        {loadingMore ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading more...
                            </>
                        ) : (
                            `Load more repositories`
                        )}
                    </button>
                </div>
            )}

            {repos.length > 0 && !hasMore && (
                <p className="text-center text-slate-500 text-sm">
                    All repositories loaded ({repos.length} total)
                </p>
            )}
        </div>
    )
}

function getTimeAgo(date: Date): string {
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    
    const years = Math.floor(months / 12)
    return `${years}y ago`
}

