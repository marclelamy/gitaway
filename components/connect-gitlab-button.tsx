"use client"

import { signIn } from "@/lib/auth-client"
import { useState } from "react"

export default function ConnectGitLabButton() {
    const [isLoading, setIsLoading] = useState(false)

    const handleConnect = async () => {
        setIsLoading(true)
        try {
            await signIn.social({
                provider: "gitlab",
                callbackURL: "/dashboard",
            })
        } catch (error) {
            console.error("GitLab connection error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleConnect}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:bg-orange-400"
        >
            {isLoading ? "Connecting..." : "Connect GitLab"}
        </button>
    )
}

