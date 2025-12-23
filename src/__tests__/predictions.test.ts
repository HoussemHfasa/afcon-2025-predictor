/**
 * Unit tests for prediction validation and scoring
 */

import { z } from 'zod';

// Prediction schema (same as in predictions/route.ts)
const predictionSchema = z.object({
  matchId: z.string(),
  predictedWinner: z.enum(["TEAM_A", "TEAM_B", "DRAW"]),
  predictedScoreA: z.number().min(0).max(20).optional(),
  predictedScoreB: z.number().min(0).max(20).optional(),
});

// Scoring logic
function calculatePoints(
  prediction: { predictedWinner: string; predictedScoreA?: number; predictedScoreB?: number },
  match: { scoreA: number; scoreB: number }
): number {
  let points = 0;
  
  // Determine actual winner
  let actualWinner: string;
  if (match.scoreA > match.scoreB) actualWinner = "TEAM_A";
  else if (match.scoreB > match.scoreA) actualWinner = "TEAM_B";
  else actualWinner = "DRAW";
  
  // 3 points for correct winner/draw prediction
  if (prediction.predictedWinner === actualWinner) {
    points = 3;
    
    // +1 bonus for exact score difference
    if (prediction.predictedScoreA !== undefined && prediction.predictedScoreB !== undefined) {
      const predictedDiff = prediction.predictedScoreA - prediction.predictedScoreB;
      const actualDiff = match.scoreA - match.scoreB;
      if (predictedDiff === actualDiff) {
        points += 1;
      }
    }
  }
  
  return points;
}

describe('Predictions', () => {
  describe('Prediction Schema Validation', () => {
    it('should accept valid prediction with winner only', () => {
      const validData = {
        matchId: 'match-123',
        predictedWinner: 'TEAM_A',
      };
      const result = predictionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid prediction with scores', () => {
      const validData = {
        matchId: 'match-123',
        predictedWinner: 'TEAM_A',
        predictedScoreA: 2,
        predictedScoreB: 1,
      };
      const result = predictionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept DRAW as predicted winner', () => {
      const validData = {
        matchId: 'match-123',
        predictedWinner: 'DRAW',
        predictedScoreA: 1,
        predictedScoreB: 1,
      };
      const result = predictionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid predicted winner', () => {
      const invalidData = {
        matchId: 'match-123',
        predictedWinner: 'INVALID',
      };
      const result = predictionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative scores', () => {
      const invalidData = {
        matchId: 'match-123',
        predictedWinner: 'TEAM_A',
        predictedScoreA: -1,
        predictedScoreB: 0,
      };
      const result = predictionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject scores over 20', () => {
      const invalidData = {
        matchId: 'match-123',
        predictedWinner: 'TEAM_A',
        predictedScoreA: 25,
        predictedScoreB: 0,
      };
      const result = predictionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Scoring System', () => {
    it('should give 3 points for correct winner prediction', () => {
      const prediction = { predictedWinner: 'TEAM_A' };
      const match = { scoreA: 2, scoreB: 1 };
      expect(calculatePoints(prediction, match)).toBe(3);
    });

    it('should give 0 points for incorrect winner prediction', () => {
      const prediction = { predictedWinner: 'TEAM_B' };
      const match = { scoreA: 2, scoreB: 1 };
      expect(calculatePoints(prediction, match)).toBe(0);
    });

    it('should give 3 points for correct draw prediction', () => {
      const prediction = { predictedWinner: 'DRAW' };
      const match = { scoreA: 1, scoreB: 1 };
      expect(calculatePoints(prediction, match)).toBe(3);
    });

    it('should give 4 points for correct winner + exact score difference', () => {
      const prediction = { 
        predictedWinner: 'TEAM_A',
        predictedScoreA: 3,
        predictedScoreB: 1,
      };
      const match = { scoreA: 2, scoreB: 0 }; // Same difference (2)
      expect(calculatePoints(prediction, match)).toBe(4);
    });

    it('should give 3 points for correct winner but wrong score difference', () => {
      const prediction = { 
        predictedWinner: 'TEAM_A',
        predictedScoreA: 3,
        predictedScoreB: 1,
      };
      const match = { scoreA: 2, scoreB: 1 }; // Difference is 1, not 2
      expect(calculatePoints(prediction, match)).toBe(3);
    });

    it('should give 4 points for correct draw + exact scores', () => {
      const prediction = { 
        predictedWinner: 'DRAW',
        predictedScoreA: 2,
        predictedScoreB: 2,
      };
      const match = { scoreA: 2, scoreB: 2 };
      expect(calculatePoints(prediction, match)).toBe(4);
    });
  });
});
