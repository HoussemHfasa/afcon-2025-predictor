import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail, generateVerificationToken } from "@/lib/email";

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

    // Always return success to prevent email enumeration
    const successMessage = "If an account exists with this email, you will receive a password reset link shortly.";

    if (!user) {
      return NextResponse.json({ message: successMessage }, { status: 200 });
    }

    // Generate reset token (reuse verification token generator)
    const resetToken = generateVerificationToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send email
    const emailSent = await sendPasswordResetEmail(user.email, user.username, resetToken);
    
    if (!emailSent) {
      console.error("Failed to send password reset email to:", user.email);
    }

    return NextResponse.json({ message: successMessage }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
