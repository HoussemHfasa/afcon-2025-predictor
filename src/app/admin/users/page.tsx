import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FiArrowLeft, FiUser, FiShield, FiMail, FiCalendar } from "react-icons/fi";

export const dynamic = "force-dynamic";

async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      isAdmin: true,
      isVerified: true,
      totalPoints: true,
      correctPredictions: true,
      totalPredictions: true,
      createdAt: true,
    },
    orderBy: { totalPoints: "desc" },
  });
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  const users = await getUsers();

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-primary-500 transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-display font-bold">
            <span className="text-[var(--foreground)]">Manage </span>
            <span className="text-primary-500">Users</span>
          </h1>
          <p className="text-[var(--muted)] mt-2">
            View and manage user accounts ({users.length} total)
          </p>
        </div>

        {/* User List */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--muted-bg)]">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase">Email</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase">Points</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase">Predictions</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[var(--card-border)] hover:bg-primary-500/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-[var(--foreground)]">
                          {user.username}
                        </span>
                        {user.isAdmin && (
                          <FiShield className="w-4 h-4 text-accent-500" title="Admin" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <FiMail className="w-4 h-4" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-primary-500">{user.totalPoints}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className="text-secondary-500">{user.correctPredictions}</span>
                      <span className="text-[var(--muted)]">/{user.totalPredictions}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.isVerified ? "bg-secondary-500/20 text-secondary-500" : "bg-accent-500/20 text-accent-500"
                      }`}>
                        {user.isVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-[var(--muted)]">
                      <div className="flex items-center justify-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
