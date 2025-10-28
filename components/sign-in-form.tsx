"use client"

import { signIn } from "@/lib/auth-client"
import { useState } from "react"

export default function SignInForm() {
    const [isLoading, setIsLoading] = useState(false)

    const handleGitHubSignIn = async () => {
        setIsLoading(true)
        try {
            await signIn.social({
                provider: "github",
                callbackURL: "/",
            })
        } catch (error) {
            console.error("Sign in error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            Welcome to git-away
                        </h1>
                        <p className="text-slate-600">Sign in with your GitHub account</p>
                    </div>

                    <button
                        onClick={handleGitHubSignIn}
                        disabled={isLoading}
                        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.186.092-.923.35-1.544.636-1.9-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.191 20 14.44 20 10.017 20 4.484 15.522 0 10 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {isLoading ? "Signing in..." : "Sign in with GitHub"}
                    </button>

                    <p className="text-center text-slate-500 text-sm mt-6">
                        Your data is secure and private.
                    </p>
                </div>
            </div>
        </div>
    )
}

