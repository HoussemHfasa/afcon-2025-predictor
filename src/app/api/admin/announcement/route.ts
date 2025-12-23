import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Feature announcement email HTML
function getAnnouncementEmailHtml(username: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0f1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="font-size: 32px; font-weight: bold;">
            <span style="color: #ffffff;">AFCON 2025</span>
            <span style="color: #10b981;"> Predictor</span>
          </div>
        </div>

        <!-- Main Card -->
        <div style="background: linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%); border-radius: 16px; padding: 40px; border: 1px solid #2d3748;">
          
          <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 16px 0; text-align: center;">
            🎉 Nouvelles Fonctionnalités Disponibles!
          </h1>
          
          <p style="color: #9ca3af; font-size: 16px; text-align: center; margin-bottom: 30px;">
            Salut <strong style="color: #ffffff;">${username}</strong>, nous avons ajouté de nouvelles fonctionnalités passionnantes !
          </p>

          <!-- Feature 1: Quick Predict -->
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 24px; margin-right: 12px;">⚡</span>
              <h2 style="color: #10b981; font-size: 20px; margin: 0;">Pronostic Rapide</h2>
            </div>
            <p style="color: #d1d5db; margin: 0; line-height: 1.6;">
              Pronostiquez <strong>tous les matchs en une seule fois</strong> ! Plus besoin d'aller match par match. 
              Cliquez sur "Quick Predict All" depuis la page des matchs pour gagner du temps.
            </p>
          </div>

          <!-- Feature 2: Live Minutes -->
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 24px; margin-right: 12px;">⏱️</span>
              <h2 style="color: #ef4444; font-size: 20px; margin: 0;">Scores & Minutes en Direct</h2>
            </div>
            <p style="color: #d1d5db; margin: 0; line-height: 1.6;">
              Suivez les matchs en temps réel avec les <strong>scores et le temps de jeu</strong> qui se mettent à jour automatiquement.
              Voyez quand c'est la mi-temps (HT) ou les arrêts de jeu (90+).
            </p>
          </div>

          <!-- Feature 3: Prediction Results -->
          <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 24px; margin-right: 12px;">✅</span>
              <h2 style="color: #3b82f6; font-size: 20px; margin: 0;">Résultats de vos Pronostics</h2>
            </div>
            <p style="color: #d1d5db; margin: 0; line-height: 1.6;">
              Voyez directement sur la page des matchs si vos pronostics étaient <strong style="color: #10b981;">corrects (+3 pts)</strong> ou <strong style="color: #ef4444;">incorrects (0 pts)</strong>. 
              Bonus 🔥 pour la différence de score exacte (+4 pts) !
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center;">
            <a href="https://afcon2025-predictor.vercel.app/quick-predict" 
               style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #0a0f1a; font-size: 16px; font-weight: bold; padding: 16px 32px; border-radius: 12px; text-decoration: none;">
              🚀 Essayer le Pronostic Rapide
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">Bonne chance pour vos pronostics ! ⚽</p>
          <p style="margin: 0;">
            <a href="https://afcon2025-predictor.vercel.app" style="color: #10b981; text-decoration: none;">afcon2025-predictor.vercel.app</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (by ID first, then by email as fallback)
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true, email: true },
    });

    // Fallback: check by email if ID lookup fails
    if (!user && session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { isAdmin: true, email: true },
      });
    }

    console.log("Admin check:", { userId: session.user.id, email: session.user.email, user });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get all verified users
    const users = await prisma.user.findMany({
      where: {
        isVerified: true,
      },
      select: {
        email: true,
        username: true,
      },
    });

    console.log(`Sending announcement emails to ${users.length} users...`);

    let successCount = 0;
    let failCount = 0;

    // Send emails (with small delay to avoid rate limiting)
    for (const recipient of users) {
      try {
        const success = await sendEmail({
          to: recipient.email,
          subject: "🎉 Nouvelles Fonctionnalités sur AFCON 2025 Predictor!",
          html: getAnnouncementEmailHtml(recipient.username),
        });

        if (success) {
          successCount++;
          console.log(`✅ Sent to ${recipient.email}`);
        } else {
          failCount++;
          console.log(`❌ Failed: ${recipient.email}`);
        }

        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        failCount++;
        console.error(`Error sending to ${recipient.email}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      successCount,
      failCount,
    });
  } catch (error) {
    console.error("Announcement email error:", error);
    return NextResponse.json(
      { error: "Failed to send announcement emails" },
      { status: 500 }
    );
  }
}
