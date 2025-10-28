import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import SignInForm from "@/components/sign-in-form"

export default async function SignInPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (session) {
        redirect("/")
    }

    return <SignInForm />
}
