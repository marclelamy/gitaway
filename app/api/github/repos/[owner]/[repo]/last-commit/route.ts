import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/db'
import { account } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getLastCommit } from '@/lib/github'

export async function GET(
    request: NextRequest,
    { params }: { params: { owner: string; repo: string } }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const githubAccount = await db
            .select()
            .from(account)
            .where(
                and(
                    eq(account.userId, session.user.id),
                    eq(account.providerId, 'github')
                )
            )
            .limit(1)

        if (!githubAccount.length || !githubAccount[0].accessToken) {
            return NextResponse.json(
                { error: 'GitHub not connected' },
                { status: 404 }
            )
        }

        const { searchParams } = new URL(request.url)
        const branch = searchParams.get('branch') || 'main'

        const lastCommit = await getLastCommit(
            githubAccount[0].accessToken,
            params.owner,
            params.repo,
            branch
        )

        return NextResponse.json({ lastCommit })
    } catch (error: any) {
        console.error('Error fetching last commit:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch last commit' },
            { status: 500 }
        )
    }
}

