/**
 * API-Football Integration Service
 * 
 * Handles fetching live match data from API-Football
 * League ID for AFCON: 6
 * Season: 2024 (AFCON 2025 is in 2024 season)
 */

const API_BASE_URL = "https://v3.football.api-sports.io";
const AFCON_LEAGUE_ID = 6;
const AFCON_SEASON = 2024;

// Map API-Football status to our database status
const STATUS_MAP: Record<string, "UPCOMING" | "LIVE" | "COMPLETED"> = {
  // Not started
  "TBD": "UPCOMING",
  "NS": "UPCOMING",
  "PST": "UPCOMING", // Postponed
  "CANC": "UPCOMING", // Cancelled (treat as upcoming for now)
  
  // Live
  "1H": "LIVE",
  "HT": "LIVE",
  "2H": "LIVE",
  "ET": "LIVE", // Extra time
  "P": "LIVE", // Penalty shootout
  "BT": "LIVE", // Break time
  "LIVE": "LIVE",
  "INT": "LIVE", // Interrupted
  
  // Finished
  "FT": "COMPLETED",
  "AET": "COMPLETED", // After Extra Time
  "PEN": "COMPLETED", // After Penalties
  "AWD": "COMPLETED", // Awarded
  "WO": "COMPLETED", // Walkover
};

interface APIFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      elapsed: number | null;
    };
    venue: {
      name: string;
      city: string;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
    };
    away: {
      id: number;
      name: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface APIResponse {
  get: string;
  parameters: Record<string, string>;
  errors: Record<string, string>;
  results: number;
  response: APIFixture[];
}

interface SyncResult {
  matchesChecked: number;
  matchesUpdated: number;
  errors: string[];
  timestamp: Date;
}

class FootballAPIService {
  private apiKey: string;
  private requestsToday: number = 0;
  private lastResetDate: string = "";
  private readonly MAX_DAILY_REQUESTS = 95; // Keep 5 buffer

  constructor() {
    this.apiKey = process.env.FOOTBALL_API_KEY || "";
    this.resetDailyCounter();
  }

  private resetDailyCounter() {
    const today = new Date().toISOString().split("T")[0];
    if (this.lastResetDate !== today) {
      this.requestsToday = 0;
      this.lastResetDate = today;
    }
  }

  private async makeRequest(endpoint: string): Promise<APIResponse | null> {
    if (!this.apiKey) {
      console.error("❌ FOOTBALL_API_KEY not configured");
      return null;
    }

    this.resetDailyCounter();
    
    if (this.requestsToday >= this.MAX_DAILY_REQUESTS) {
      console.warn("⚠️ Daily API request limit reached");
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "x-apisports-key": this.apiKey,
        },
      });

      this.requestsToday++;
      console.log(`📡 API Request ${this.requestsToday}/${this.MAX_DAILY_REQUESTS}: ${endpoint}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ API request failed:", error);
      return null;
    }
  }

  /**
   * Fetch all AFCON fixtures for the season
   */
  async getAllFixtures(): Promise<APIFixture[]> {
    const data = await this.makeRequest(
      `/fixtures?league=${AFCON_LEAGUE_ID}&season=${AFCON_SEASON}`
    );
    return data?.response || [];
  }

  /**
   * Fetch only live AFCON matches (most efficient for real-time updates)
   */
  async getLiveFixtures(): Promise<APIFixture[]> {
    const data = await this.makeRequest(
      `/fixtures?live=all&league=${AFCON_LEAGUE_ID}`
    );
    return data?.response || [];
  }

  /**
   * Fetch fixtures by date
   */
  async getFixturesByDate(date: string): Promise<APIFixture[]> {
    const data = await this.makeRequest(
      `/fixtures?league=${AFCON_LEAGUE_ID}&season=${AFCON_SEASON}&date=${date}`
    );
    return data?.response || [];
  }

  /**
   * Convert API status to our database status
   */
  mapStatus(apiStatus: string): "UPCOMING" | "LIVE" | "COMPLETED" {
    return STATUS_MAP[apiStatus] || "UPCOMING";
  }

  /**
   * Get remaining API requests for today
   */
  getRemainingRequests(): number {
    this.resetDailyCounter();
    return this.MAX_DAILY_REQUESTS - this.requestsToday;
  }

  /**
   * Check if we can make more requests today
   */
  canMakeRequest(): boolean {
    return this.getRemainingRequests() > 0;
  }

  /**
   * Get API usage stats
   */
  getUsageStats() {
    this.resetDailyCounter();
    return {
      used: this.requestsToday,
      remaining: this.MAX_DAILY_REQUESTS - this.requestsToday,
      limit: this.MAX_DAILY_REQUESTS,
      date: this.lastResetDate,
    };
  }
}

// Export singleton instance
export const footballAPI = new FootballAPIService();

// Export types
export type { APIFixture, SyncResult };
export { STATUS_MAP };
