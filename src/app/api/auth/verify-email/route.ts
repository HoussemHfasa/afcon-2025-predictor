import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Looking up verification token:", token.substring(0, 10) + "...");

    // Find user with matching token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    console.log("🔍 User found:", user ? `${user.email} (verified: ${user.isVerified})` : "NOT FOUND");

    // If no user found with this token, check if maybe they were already verified
    if (!user) {
      // The token might have been used already - check if any recently verified user
      // This can happen if user clicks the link twice or page reloads
      console.log("ℹ️ Token not found - user may have already verified");
      
      return NextResponse.json(
        { 
          error: "This verification link has already been used or expired.",
          alreadyUsed: true,
          message: "Your email may already be verified. Try logging in."
        },
        { status: 400 }
      );
    }

    // Check if already verified (token still exists but user is verified - rare case)
    if (user.isVerified) {
      return NextResponse.json(
        { message: "Email is already verified! You can log in now." },
        { status: 200 }
      );
    }

    // Check if token has expired
    if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
      console.log("⏰ Token expired for user:", user.email);
      return NextResponse.json(
        { 
          error: "This verification link has expired.",
          expired: true,
          message: "Please request a new verification email."
        },
        { status: 400 }
      );
    }

    // Verify the user - set isVerified AND clear token and expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    console.log("✅ User verified successfully:", user.email);

    return NextResponse.json(
      { message: "Email verified successfully! You can now log in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Resend verification email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists
    if (!user || user.isVerified) {
      return NextResponse.json(
        { message: "If an unverified account exists with this email, a new verification link has been sent." },
        { status: 200 }
      );
    }

    // Generate new token and expiry
    const { sendVerificationEmail, generateVerificationToken } = await import("@/lib/email");
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token and expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send email via SMTP
    const emailSent = await sendVerificationEmail(user.email, user.username, verificationToken);

    if (!emailSent) {
      console.error("❌ Failed to send verification email to:", user.email);
      return NextResponse.json(
        { error: "Failed to send verification email. Please check your SMTP configuration and try again." },
        { status: 500 }
      );
    }

    console.log("✅ Verification email resent successfully to:", user.email);

    return NextResponse.json(
      { message: "A new verification link has been sent to your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

