import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db/db"
import { account } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import RepositoryList from "@/components/repository-list"
import ConnectGitLabButton from "@/components/connect-gitlab-button"
import { AlertCircle } from "lucide-react"

export default async function HomePage() {
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

    const gitlabAccount = userAccounts.find(acc => acc.providerId === "gitlab")

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    Your Repositories
                </h1>
                <p className="text-slate-600">
                    Browse and manage your GitHub repositories
                </p>
            </div>

            {!gitlabAccount && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-orange-900 mb-1">
                            GitLab Not Connected
                        </h3>
                        <p className="text-sm text-orange-800 mb-3">
                            Connect your GitLab account to access GitLab repositories and features.
                        </p>
                        <ConnectGitLabButton />
                    </div>
                </div>
            )}

            <RepositoryList />
        </div>
    )
}

