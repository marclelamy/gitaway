import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db/db"
import { account } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import ConnectGitLabButton from "@/components/connect-gitlab-button"
import { CheckCircle, XCircle, Key } from "lucide-react"

export default async function TokensPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        return null
    }

    const userAccounts = await db
        .select()
        .from(account)
        .where(eq(account.userId, session.user.id))

    const githubAccount = userAccounts.find(acc => acc.providerId === "github")
    const gitlabAccount = userAccounts.find(acc => acc.providerId === "gitlab")

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    Tokens & Connections
                </h1>
                <p className="text-slate-600">
                    Manage your connected accounts and access tokens
                </p>
            </div>

            {/* Connected Accounts */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900">
                    Connected Accounts
                </h2>

                {/* GitHub Account */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-7 h-7 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    GitHub
                                </h3>
                                <p className="text-sm text-slate-600">
                                    {githubAccount ? "Connected" : "Not connected"}
                                </p>
                            </div>
                        </div>
                        {githubAccount ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                            <XCircle className="h-6 w-6 text-slate-400" />
                        )}
                    </div>

                    {githubAccount && (
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">
                                    Account ID:
                                </span>
                                <span className="text-sm text-slate-900 font-mono">
                                    {githubAccount.accountId}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">
                                    Scope:
                                </span>
                                <span className="text-sm text-slate-900">
                                    {githubAccount.scope}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">
                                    Access Token:
                                </span>
                                <span className="text-sm text-slate-900 font-mono">
                                    {githubAccount.accessToken
                                        ? `${githubAccount.accessToken.slice(0, 10)}...`
                                        : "N/A"}
                                </span>
                            </div>
                            {githubAccount.accessTokenExpiresAt && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-600">
                                        Token Expires:
                                    </span>
                                    <span className="text-sm text-slate-900">
                                        {new Date(
                                            githubAccount.accessTokenExpiresAt
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* GitLab Account */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-7 h-7 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L.375 10.93c-.5.5-.5 1.314 0 1.814L10.88 23.25c.604.603 1.582.603 2.188 0l10.478-10.506c.5-.5.5-1.314 0-1.814zM12 16.033l-4.033-4.033L12 7.967l4.033 4.033z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    GitLab
                                </h3>
                                <p className="text-sm text-slate-600">
                                    {gitlabAccount ? "Connected" : "Not connected"}
                                </p>
                            </div>
                        </div>
                        {gitlabAccount ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                            <XCircle className="h-6 w-6 text-slate-400" />
                        )}
                    </div>

                    {gitlabAccount ? (
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">
                                    Account ID:
                                </span>
                                <span className="text-sm text-slate-900 font-mono">
                                    {gitlabAccount.accountId}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">
                                    Scope:
                                </span>
                                <span className="text-sm text-slate-900">
                                    {gitlabAccount.scope}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">
                                    Access Token:
                                </span>
                                <span className="text-sm text-slate-900 font-mono">
                                    {gitlabAccount.accessToken
                                        ? `${gitlabAccount.accessToken.slice(0, 10)}...`
                                        : "N/A"}
                                </span>
                            </div>
                            {gitlabAccount.refreshToken && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-600">
                                        Refresh Token:
                                    </span>
                                    <span className="text-sm text-slate-900 font-mono">
                                        {gitlabAccount.refreshToken.slice(0, 10)}...
                                    </span>
                                </div>
                            )}
                            {gitlabAccount.accessTokenExpiresAt && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-600">
                                        Token Expires:
                                    </span>
                                    <span className="text-sm text-slate-900">
                                        {new Date(
                                            gitlabAccount.accessTokenExpiresAt
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-600 mb-3">
                                Connect your GitLab account to access GitLab repositories
                                and features.
                            </p>
                            <ConnectGitLabButton />
                        </div>
                    )}
                </div>
            </div>

            {/* API Tokens Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                    <Key className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-2">
                            About Access Tokens
                        </h3>
                        <p className="text-sm text-blue-800">
                            Access tokens are used to authenticate with GitHub and GitLab
                            APIs. They are stored securely and only partial tokens are
                            displayed here for security reasons. Tokens are automatically
                            refreshed when they expire.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

