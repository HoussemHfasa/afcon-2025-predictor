import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate, formatMatchTime } from "@/lib/utils";
import { formatMatchStatus, getStatusColor } from "@/lib/scoring";
import { Countdown } from "@/components/matches/Countdown";
import { PredictionForm } from "@/components/predictions/PredictionForm";
import { FiArrowLeft, FiMapPin, FiCalendar, FiUsers } from "react-icons/fi";
import { GiSoccerBall } from "react-icons/gi";

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

async function getUserPrediction(matchId: string, userId: string) {
  return prisma.prediction.findUnique({
    where: {
      userId_matchId: {
        userId,
        matchId,
      },
    },
  });
}

async function getPredictionStats(matchId: string) {
  const predictions = await prisma.prediction.groupBy({
    by: ["predictedWinner"],
    where: { matchId },
    _count: true,
  });

  const total = predictions.reduce((acc, p) => acc + p._count, 0);
  
  return {
    teamA: predictions.find((p) => p.predictedWinner === "TEAM_A")?._count || 0,
    teamB: predictions.find((p) => p.predictedWinner === "TEAM_B")?._count || 0,
    draw: predictions.find((p) => p.predictedWinner === "DRAW")?._count || 0,
    total,
  };
}

export default async function MatchDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const match = await getMatch(resolvedParams.id);

  if (!match) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userPrediction = session?.user?.id
    ? await getUserPrediction(match.id, session.user.id)
    : null;
    
  const predictionStats = await getPredictionStats(match.id);

  const isUpcoming = match.status === "UPCOMING";
  const isLive = match.status === "LIVE";
  const isCompleted = match.status === "COMPLETED";

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-primary-500 transition-colors mb-8"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Matches
        </Link>

        {/* Match Header Card */}
        <div className={`card overflow-hidden ${isLive ? "match-live" : ""}`}>
          {/* Status Bar */}
          <div className="flex items-center justify-between p-4 bg-[var(--muted-bg)] border-b border-[var(--card-border)]">
            <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                {formatDate(match.matchDate, { hour: undefined, minute: undefined })} at {formatMatchTime(match.matchDate)}
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin className="w-4 h-4" />
                {match.venue}
              </div>
            </div>
            <span className={`badge ${getStatusColor(match.status)}`}>
              {isLive && <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />}
              {formatMatchStatus(match.status)}
            </span>
          </div>

          {/* Teams & Score */}
          <div className="p-8">
            <div className="flex items-center justify-between gap-8">
              {/* Team A */}
              <div className="flex-1 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-[var(--muted-bg)] flex items-center justify-center overflow-hidden">
                  {match.teamA.flagUrl ? (
                    <Image
                      src={match.teamA.flagUrl}
                      alt={match.teamA.name}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-[var(--muted)]">
                      {match.teamA.shortName}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  {match.teamA.name}
                </h2>
                <p className="text-sm text-[var(--muted)]">Group {match.teamA.group}</p>
              </div>

              {/* Score / VS */}
              <div className="text-center">
                {isCompleted || isLive ? (
                  <div className="flex items-center gap-4">
                    <span className={`text-5xl font-bold ${isLive ? "text-accent-500" : "text-[var(--foreground)]"}`}>
                      {match.scoreA ?? 0}
                    </span>
                    <span className="text-2xl text-[var(--muted)]">-</span>
                    <span className={`text-5xl font-bold ${isLive ? "text-accent-500" : "text-[var(--foreground)]"}`}>
                      {match.scoreB ?? 0}
                    </span>
                  </div>
                ) : (
                  <div>
                    <GiSoccerBall className="w-12 h-12 text-primary-500 mx-auto mb-2 animate-pulse" />
                    <div className="text-3xl font-bold text-[var(--muted)]">VS</div>
                  </div>
                )}
                {isLive && (
                  <span className="inline-block mt-2 text-sm text-accent-500 font-medium animate-pulse">
                    🔴 LIVE
                  </span>
                )}
              </div>

              {/* Team B */}
              <div className="flex-1 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-[var(--muted-bg)] flex items-center justify-center overflow-hidden">
                  {match.teamB.flagUrl ? (
                    <Image
                      src={match.teamB.flagUrl}
                      alt={match.teamB.name}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-[var(--muted)]">
                      {match.teamB.shortName}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  {match.teamB.name}
                </h2>
                <p className="text-sm text-[var(--muted)]">Group {match.teamB.group}</p>
              </div>
            </div>

            {/* Countdown */}
            {isUpcoming && (
              <div className="mt-8">
                <h3 className="text-center text-sm text-[var(--muted)] mb-4">Match Starts In</h3>
                <Countdown targetDate={match.matchDate} />
              </div>
            )}
          </div>

          {/* Match Info Footer */}
          <div className="px-8 py-4 bg-[var(--muted-bg)] flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <FiUsers className="w-4 h-4" />
              {match._count.predictions} predictions
            </div>
            <span className="text-sm font-medium text-primary-500 uppercase">
              {match.stage === "GROUP" && match.groupName 
                ? `GROUP ${match.groupName}` 
                : match.stage.replace("_", " ")} • Match #{match.matchNumber}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Prediction Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
              {userPrediction ? "Your Prediction" : "Make Your Prediction"}
            </h3>
            
            <PredictionForm
              matchId={match.id}
              teamAName={match.teamA.shortName}
              teamBName={match.teamB.shortName}
              matchDate={match.matchDate}
              existingPrediction={userPrediction ? {
                predictedWinner: userPrediction.predictedWinner,
                predictedScoreA: userPrediction.predictedScoreA,
                predictedScoreB: userPrediction.predictedScoreB,
              } : undefined}
            />

            {isCompleted && userPrediction && (
              <div className={`mt-6 p-4 rounded-xl ${
                userPrediction.isCorrect
                  ? "bg-secondary-500/10 border border-secondary-500/20"
                  : "bg-accent-500/10 border border-accent-500/20"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={userPrediction.isCorrect ? "text-secondary-500" : "text-accent-500"}>
                    {userPrediction.isCorrect ? "✓ Correct Prediction!" : "✗ Incorrect Prediction"}
                  </span>
                  <span className={`text-xl font-bold ${
                    userPrediction.isCorrect ? "text-secondary-500" : "text-accent-500"
                  }`}>
                    +{userPrediction.pointsEarned} pts
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Community Stats */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
              Community Predictions
            </h3>

            {predictionStats.total === 0 ? (
              <p className="text-center text-[var(--muted)] py-8">
                No predictions yet. Be the first!
              </p>
            ) : (
              <div className="space-y-4">
                <PredictionBar
                  label={match.teamA.shortName}
                  count={predictionStats.teamA}
                  total={predictionStats.total}
                  color="primary"
                />
                <PredictionBar
                  label="Draw"
                  count={predictionStats.draw}
                  total={predictionStats.total}
                  color="muted"
                />
                <PredictionBar
                  label={match.teamB.shortName}
                  count={predictionStats.teamB}
                  total={predictionStats.total}
                  color="secondary"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PredictionBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: "primary" | "secondary" | "muted";
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const colorClasses = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    muted: "bg-[var(--muted)]",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-[var(--foreground)]">{label}</span>
        <span className="text-sm text-[var(--muted)]">{count} ({percentage}%)</span>
      </div>
      <div className="h-3 rounded-full bg-[var(--muted-bg)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
