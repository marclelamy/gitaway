import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { github, gitlab } from "better-auth/social-providers"
import { nextCookies } from "better-auth/next-js"
import { db } from "./db/db"
import * as schema from "./db/schema"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3010"],
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            scope: ["repo", "admin:repo_hook", "read:user", "user:email"],
        },
        gitlab: {
            clientId: process.env.GITLAB_CLIENT_ID as string,
            clientSecret: process.env.GITLAB_CLIENT_SECRET as string,
            scope: ["read_user", "api"],
        },
    },
    plugins: [nextCookies()],
} as any)
