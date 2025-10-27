import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Welcome to git-away
                    </h1>
                    <p className="text-slate-600 mb-8">
                        {session
                            ? `Welcome back, ${session.user.name}!`
                            : "Secure authentication with GitHub OAuth"}
                    </p>

                    <div className="space-y-3">
                        {session ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                                >
                                    Go to Dashboard
                                </Link>
                            </>
                        ) : (
                            <Link
                                href="/sign-in"
                                className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                            >
                                Sign In with GitHub
                            </Link>
                        )}
                    </div>

                    <p className="text-slate-500 text-sm mt-6">
                        Built with Next.js, Better Auth, and GitHub OAuth
                    </p>
                </div>
            </div>
        </div>
    );
}
