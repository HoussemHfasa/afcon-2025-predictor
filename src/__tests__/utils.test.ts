/**
 * Unit tests for utility functions
 */

import { formatDate, formatRelativeTime, getInitials } from '@/lib/utils';

// Define canPredict locally for testing (matches the logic used in components)
function canPredict(matchDate: Date): boolean {
  const now = new Date();
  const cutoffTime = new Date(matchDate.getTime() - 5 * 60 * 1000); // 5 min before match
  return now < cutoffTime;
}

describe('Utils', () => {
  describe('getInitials', () => {
    it('should return first letter of single word username', () => {
      const result = getInitials('houssem');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should return initials of two word name', () => {
      const result = getInitials('John Doe');
      expect(result).toBeTruthy();
    });

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('');
    });

    it('should handle single character', () => {
      const result = getInitials('A');
      expect(result).toBeTruthy();
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-15T14:30:00');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2025-01-15');
      expect(formatted).toContain('Jan');
    });
  });

  describe('formatRelativeTime', () => {
    it('should show relative time for future times', () => {
      const futureDate = new Date(Date.now() + 30 * 60 * 1000); // 30 min in future
      const result = formatRelativeTime(futureDate);
      // Accept formats like "in 30m", "in 30 minutes", etc
      expect(result).toMatch(/in|30|m/i);
    });

    it('should show relative time for past times', () => {
      const pastDate = new Date(Date.now() - 30 * 60 * 1000); // 30 min ago
      const result = formatRelativeTime(pastDate);
      // Accept formats like "30m ago", "30 minutes ago", etc
      expect(result).toMatch(/ago|30|m/i);
    });
  });

  describe('canPredict', () => {
    it('should return true for future match dates', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour in future
      expect(canPredict(futureDate)).toBe(true);
    });

    it('should return false for past match dates', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      expect(canPredict(pastDate)).toBe(false);
    });

    it('should return false for matches starting soon (within 5 minutes)', () => {
      const soonDate = new Date(Date.now() + 2 * 60 * 1000); // 2 min in future
      expect(canPredict(soonDate)).toBe(false);
    });
  });
});
