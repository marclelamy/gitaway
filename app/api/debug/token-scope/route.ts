import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/db'
import { account } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

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

        const accountData = githubAccount[0]

        return NextResponse.json({
            scope: accountData.scope,
            hasAccessToken: !!accountData.accessToken,
            tokenPrefix: accountData.accessToken?.substring(0, 8),
            createdAt: accountData.createdAt,
            expiresAt: accountData.accessTokenExpiresAt,
            expectedScope: 'repo admin:repo_hook read:user user:email',
        })
    } catch (error: any) {
        console.error('Error checking token scope:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to check token scope' },
            { status: 500 }
        )
    }
}

