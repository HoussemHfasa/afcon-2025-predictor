import { PredictionType, MatchStatus } from "@prisma/client";

/**
 * Calculate points earned for a prediction
 * 
 * @param prediction The user's prediction
 * @param predictedScoreA Predicted score for Team A (optional)
 * @param predictedScoreB Predicted score for Team B (optional)
 * @param actualScoreA Actual score for Team A
 * @param actualScoreB Actual score for Team B
 * @returns Points earned (0, 3, or 4)
 */
export function calculatePoints(
  prediction: PredictionType,
  predictedScoreA: number | null,
  predictedScoreB: number | null,
  actualScoreA: number,
  actualScoreB: number
): { points: number; isCorrect: boolean; hasBonus: boolean } {
  // Determine actual outcome
  let actualOutcome: PredictionType;
  if (actualScoreA > actualScoreB) {
    actualOutcome = "TEAM_A";
  } else if (actualScoreB > actualScoreA) {
    actualOutcome = "TEAM_B";
  } else {
    actualOutcome = "DRAW";
  }

  // Check if prediction is correct
  const isCorrect = prediction === actualOutcome;

  if (!isCorrect) {
    return { points: 0, isCorrect: false, hasBonus: false };
  }

  // Base points for correct prediction
  let points = 3;
  let hasBonus = false;

  // Check for exact score difference bonus
  if (predictedScoreA !== null && predictedScoreB !== null) {
    const predictedDiff = predictedScoreA - predictedScoreB;
    const actualDiff = actualScoreA - actualScoreB;

    if (predictedDiff === actualDiff) {
      points += 1;
      hasBonus = true;
    }
  }

  return { points, isCorrect: true, hasBonus };
}

/**
 * Check if predictions are still allowed for a match
 * 
 * @param matchDate The match date
 * @param deadlineHours Hours before match when predictions close (default: 1)
 * @returns Whether predictions are still allowed
 */
export function canPredict(matchDate: Date, deadlineHours: number = 1): boolean {
  const now = new Date();
  const deadline = new Date(matchDate.getTime() - deadlineHours * 60 * 60 * 1000);
  return now < deadline;
}

/**
 * Get the deadline for predictions
 * 
 * @param matchDate The match date
 * @param deadlineHours Hours before match when predictions close (default: 1)
 * @returns The prediction deadline
 */
export function getPredictionDeadline(matchDate: Date, deadlineHours: number = 1): Date {
  return new Date(matchDate.getTime() - deadlineHours * 60 * 60 * 1000);
}

/**
 * Format match status for display
 */
export function formatMatchStatus(status: MatchStatus): string {
  switch (status) {
    case "UPCOMING":
      return "Upcoming";
    case "LIVE":
      return "Live";
    case "COMPLETED":
      return "Completed";
    case "POSTPONED":
      return "Postponed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

/**
 * Get status badge color classes
 */
export function getStatusColor(status: MatchStatus): string {
  switch (status) {
    case "UPCOMING":
      return "badge-primary";
    case "LIVE":
      return "badge-accent";
    case "COMPLETED":
      return "badge-secondary";
    case "POSTPONED":
      return "bg-yellow-500/20 text-yellow-500";
    case "CANCELLED":
      return "bg-gray-500/20 text-gray-500";
    default:
      return "badge-primary";
  }
}
