"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/sign-in");
                    },
                },
            });
        } catch (error) {
            console.error("Sign out error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
            {isLoading ? "Signing out..." : "Sign Out"}
        </button>
    );
}
