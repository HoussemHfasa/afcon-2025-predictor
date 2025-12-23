import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FiArrowLeft, FiEdit, FiCheck, FiClock, FiPlay } from "react-icons/fi";
import { GiSoccerBall } from "react-icons/gi";

export const dynamic = "force-dynamic";

async function getMatches() {
  return prisma.match.findMany({
    include: {
      teamA: true,
      teamB: true,
      _count: {
        select: { predictions: true },
      },
    },
    orderBy: { matchDate: "asc" },
  });
}

export default async function AdminMatchesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  const matches = await getMatches();

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
            <span className="text-primary-500">Matches</span>
          </h1>
          <p className="text-[var(--muted)] mt-2">
            Update scores and manage match status
          </p>
        </div>

        {/* Match List */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--muted-bg)]">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase">Match</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase">Score</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--muted)] uppercase">Predictions</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--muted)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id} className="border-b border-[var(--card-border)] hover:bg-primary-500/5">
                    <td className="px-6 py-4 text-sm text-[var(--muted)]">
                      {new Date(match.matchDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <GiSoccerBall className="w-4 h-4 text-primary-500" />
                        <span className="font-medium text-[var(--foreground)]">
                          {match.teamA.name} vs {match.teamB.name}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--muted)]">{match.venue}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {match.status === "COMPLETED" ? (
                        <span className="font-bold text-lg text-[var(--foreground)]">
                          {match.scoreA} - {match.scoreB}
                        </span>
                      ) : (
                        <span className="text-[var(--muted)]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        match.status === "COMPLETED" ? "bg-secondary-500/20 text-secondary-500" :
                        match.status === "LIVE" ? "bg-accent-500/20 text-accent-500" : 
                        "bg-primary-500/20 text-primary-500"
                      }`}>
                        {match.status === "COMPLETED" && <FiCheck className="w-3 h-3" />}
                        {match.status === "LIVE" && <FiPlay className="w-3 h-3" />}
                        {match.status === "UPCOMING" && <FiClock className="w-3 h-3" />}
                        {match.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--foreground)]">
                      {match._count.predictions}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/matches/${match.id}`}
                        className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-400 text-sm font-medium"
                      >
                        <FiEdit className="w-4 h-4" />
                        Edit
                      </Link>
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
