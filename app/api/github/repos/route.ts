import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/db'
import { account } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getRepos } from '@/lib/github'

export async function GET(request: NextRequest) {
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

        if (!githubAccount.length) {
            return NextResponse.json(
                { error: 'GitHub not connected' },
                { status: 404 }
            )
        }

        const accessToken = githubAccount[0].accessToken

        if (!accessToken) {
            return NextResponse.json(
                { error: 'GitHub access token not found' },
                { status: 404 }
            )
        }

        // Get pagination params from query string
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1', 10)
        const perPage = parseInt(searchParams.get('per_page') || '30', 10)

        const repos = await getRepos(accessToken, page, perPage)

        return NextResponse.json({
            repos,
            page,
            perPage,
            hasMore: repos.length === perPage,
        })
    } catch (error: any) {
        console.error('Error fetching GitHub repos:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch repositories' },
            { status: 500 }
        )
    }
}
