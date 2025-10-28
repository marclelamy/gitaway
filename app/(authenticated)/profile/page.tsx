import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { User, Mail, CheckCircle, XCircle } from "lucide-react"

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        return null
    }

    const user = session.user

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile</h1>
                <p className="text-slate-600">View your account information</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-8">
                    <div className="flex items-center gap-6">
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name || "User avatar"}
                                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-slate-300 flex items-center justify-center">
                                <User className="h-12 w-12 text-slate-600" />
                            </div>
                        )}
                        <div className="text-white">
                            <h2 className="text-2xl font-bold mb-1">
                                {user.name || "No name provided"}
                            </h2>
                            <p className="text-slate-200">
                                {user.email || "No email provided"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="p-6 space-y-4">
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-slate-600" />
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Name
                                    </p>
                                    <p className="text-base text-slate-900">
                                        {user.name || "Not provided"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-slate-600" />
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Email
                                    </p>
                                    <p className="text-base text-slate-900">
                                        {user.email || "Not provided"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                {user.emailVerified ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-orange-600" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Email Verification
                                    </p>
                                    <p
                                        className={`text-base font-medium ${
                                            user.emailVerified
                                                ? "text-green-600"
                                                : "text-orange-600"
                                        }`}
                                    >
                                        {user.emailVerified ? "Verified" : "Not Verified"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-5 w-5 text-slate-600 flex items-center justify-center">
                                    #
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        User ID
                                    </p>
                                    <p className="text-sm text-slate-900 font-mono break-all">
                                        {user.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

