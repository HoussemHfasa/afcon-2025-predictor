import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AdminMatchForm } from "@/components/admin/AdminMatchForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getMatch(id: string) {
  return prisma.match.findUnique({
    where: { id },
    include: {
      teamA: true,
      teamB: true,
      _count: {
        select: { predictions: true },
      },
    },
  });
}

export default async function AdminMatchPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  const resolvedParams = await params;
  const match = await getMatch(resolvedParams.id);

  if (!match) {
    notFound();
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-[var(--foreground)] mb-8">
          Edit Match Result
        </h1>
        
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-[var(--foreground)]">
                {match.teamA.shortName}
              </div>
              <div className="text-sm text-[var(--muted)]">{match.teamA.name}</div>
            </div>
            <div className="text-2xl text-[var(--muted)]">vs</div>
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-[var(--foreground)]">
                {match.teamB.shortName}
              </div>
              <div className="text-sm text-[var(--muted)]">{match.teamB.name}</div>
            </div>
          </div>
          
          <div className="text-center text-sm text-[var(--muted)]">
            {match._count.predictions} predictions made
          </div>
        </div>

        <AdminMatchForm
          matchId={match.id}
          currentScoreA={match.scoreA}
          currentScoreB={match.scoreB}
          currentStatus={match.status}
          teamAName={match.teamA.shortName}
          teamBName={match.teamB.shortName}
        />
      </div>
    </div>
  );
}
