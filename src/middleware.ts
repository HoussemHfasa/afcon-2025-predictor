import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = {
  auth: 20,     // 20 auth attempts per minute
  api: 200,     // 200 API requests per minute
  default: 300, // 300 requests per minute for everything else
};

function getClientIP(request: NextRequest): string {
  // Get IP from various headers (works behind proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfIP = request.headers.get("cf-connecting-ip");
  
  if (cfIP) return cfIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();
  
  return "unknown";
}

function getRateLimitKey(ip: string, path: string): string {
  // Exclude verify-email and forgot-password from strict auth rate limiting
  if (path.includes("/api/auth/verify-email") || path.includes("/api/auth/forgot-password") || path.includes("/api/auth/reset-password")) {
    return `api:${ip}`; // Use general API rate limit (more lenient)
  }
  if (path.includes("/api/auth")) return `auth:${ip}`;
  if (path.includes("/api/")) return `api:${ip}`;
  return `default:${ip}`;
}

function getMaxRequests(key: string): number {
  if (key.startsWith("auth:")) return MAX_REQUESTS.auth;
  if (key.startsWith("api:")) return MAX_REQUESTS.api;
  return MAX_REQUESTS.default;
}

function checkRateLimit(key: string, maxRequests: number): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimit.entries());
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      rateLimit.delete(key);
    }
  }
}, 60 * 1000);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  
  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const key = getRateLimitKey(ip, pathname);
    const maxRequests = getMaxRequests(key);
    
    if (!checkRateLimit(key, maxRequests)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
          }
        }
      );
    }
  }
  
  // Security: Prevent access to sensitive files
  const sensitivePatterns = [
    /\.env/,
    /\.git/,
    /prisma\/.*\.ts$/,
    /node_modules/,
  ];
  
  if (sensitivePatterns.some(pattern => pattern.test(pathname))) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }
  
  const response = NextResponse.next();
  
  // Add security headers that may be missed by config
  response.headers.set("X-Request-Id", crypto.randomUUID());
  
  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
    // Don't match static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
