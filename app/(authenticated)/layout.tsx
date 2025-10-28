import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Home, User, Key, LogOut } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import SignOutButton from "@/components/sign-out-button"

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/sign-in")
    }

    const user = session.user

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="px-2 py-4">
                        <h2 className="text-lg font-bold text-slate-900">git-away</h2>
                        <p className="text-xs text-slate-600 mt-1">
                            Repository Management
                        </p>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/">
                                            <Home className="h-4 w-4" />
                                            <span>Home</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/profile">
                                            <User className="h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/tokens">
                                            <Key className="h-4 w-4" />
                                            <span>Tokens & Connections</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <div className="flex items-center gap-3 px-2 py-2">
                                {user.image && (
                                    <img
                                        src={user.image}
                                        alt={user.name || "User"}
                                        className="h-8 w-8 rounded-full"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-slate-600 truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SignOutButton />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-4" />
                    <h1 className="text-lg font-semibold text-slate-900">
                        git-away
                    </h1>
                </header>
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

