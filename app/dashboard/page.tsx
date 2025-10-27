import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import SignOutButton from "@/components/sign-out-button"
import ConnectGitLabButton from "@/components/connect-gitlab-button"
import { db } from "@/lib/db/db"
import { account } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/sign-in")
    }

    const user = session.user

    // Get user's connected accounts
    const userAccounts = await db.select().from(account).where(eq(account.userId, user.id))
    
    const githubAccount = userAccounts.find(acc => acc.providerId === "github")
    const gitlabAccount = userAccounts.find(acc => acc.providerId === "gitlab")

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-8 text-white flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Welcome, {user.name}!</h1>
                            <p className="text-slate-200">Your authenticated session</p>
                        </div>
                        <SignOutButton />
                    </div>

                    {/* User Info */}
                    <div className="px-8 py-8">
                        {/* Avatar */}
                        {user.image && (
                            <div className="mb-8 flex justify-center">
                                <img
                                    src={user.image}
                                    alt={user.name || "User avatar"}
                                    className="w-32 h-32 rounded-full border-4 border-slate-200 shadow-lg"
                                />
                            </div>
                        )}

                        {/* User Details */}
                        <div className="space-y-6">
                            {/* Connected Accounts */}
                            <div className="bg-slate-50 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                    Connected Accounts
                                </h2>
                                <div className="space-y-4">
                                    {/* GitHub Account */}
                                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">GitHub</p>
                                                <p className="text-sm text-slate-600">
                                                    {githubAccount ? "Connected" : "Not connected"}
                                                </p>
                                            </div>
                                        </div>
                                        {githubAccount && (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                ✓ Active
                                            </span>
                                        )}
                                    </div>

                                    {/* GitLab Account */}
                                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L.375 10.93c-.5.5-.5 1.314 0 1.814L10.88 23.25c.604.603 1.582.603 2.188 0l10.478-10.506c.5-.5.5-1.314 0-1.814zM12 16.033l-4.033-4.033L12 7.967l4.033 4.033z"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">GitLab</p>
                                                <p className="text-sm text-slate-600">
                                                    {gitlabAccount ? "Connected" : "Not connected"}
                                                </p>
                                            </div>
                                        </div>
                                        {gitlabAccount ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                ✓ Active
                                            </span>
                                        ) : (
                                            <ConnectGitLabButton />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                    User Information
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-slate-600 font-medium">Name:</span>
                                        <span className="text-slate-900 text-right ml-4">
                                            {user.name || "Not provided"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-slate-600 font-medium">Email:</span>
                                        <span className="text-slate-900 text-right ml-4">
                                            {user.email || "Not provided"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-slate-600 font-medium">ID:</span>
                                        <span className="text-slate-900 text-right ml-4 font-mono text-sm break-words">
                                            {user.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-slate-600 font-medium">
                                            Email Verified:
                                        </span>
                                        <span className={`text-right ml-4 font-medium ${user.emailVerified ? "text-green-600" : "text-orange-600"}`}>
                                            {user.emailVerified ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Account Data */}
                            {userAccounts.length > 0 && (
                                <div className="bg-slate-50 rounded-lg p-6">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                        Account Details
                                    </h2>
                                    <div className="space-y-4">
                                        {userAccounts.map(acc => (
                                            <div key={acc.id} className="bg-white rounded-lg p-4 border border-slate-200">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="font-semibold text-slate-900 capitalize">
                                                        {acc.providerId}
                                                    </span>
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                        {acc.scope}
                                                    </span>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Account ID:</span>
                                                        <span className="text-slate-900 font-mono">{acc.accountId}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Access Token:</span>
                                                        <span className="text-slate-900 font-mono">
                                                            {acc.accessToken ? `${acc.accessToken.slice(0, 10)}...` : "N/A"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Refresh Token:</span>
                                                        <span className="text-slate-900 font-mono">
                                                            {acc.refreshToken ? `${acc.refreshToken.slice(0, 10)}...` : "N/A"}
                                                        </span>
                                                    </div>
                                                    {acc.accessTokenExpiresAt && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-600">Token Expires:</span>
                                                            <span className="text-slate-900">
                                                                {new Date(acc.accessTokenExpiresAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Full User Object */}
                            <div className="bg-slate-50 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                    Full User Object
                                </h2>
                                <pre className="bg-slate-900 text-slate-100 p-4 rounded overflow-auto text-sm">
                                    {JSON.stringify(user, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
