"use client"

import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogOut } from "lucide-react"
import { SidebarMenuButton } from "@/components/ui/sidebar"

export default function SignOutButton() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleSignOut = async () => {
        setIsLoading(true)
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/sign-in")
                    },
                },
            })
        } catch (error) {
            console.error("Sign out error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <SidebarMenuButton onClick={handleSignOut} disabled={isLoading}>
            <LogOut className="h-4 w-4" />
            <span>{isLoading ? "Signing out..." : "Sign Out"}</span>
        </SidebarMenuButton>
    )
}
