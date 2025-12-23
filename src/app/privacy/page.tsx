import Link from "next/link";
import { FiArrowLeft, FiLock } from "react-icons/fi";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/register" 
          className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-primary-500 transition-colors mb-8"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Registration
        </Link>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <FiLock className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-display font-bold text-[var(--foreground)]">
              Privacy Policy
            </h1>
          </div>

          <p className="text-[var(--muted)] mb-6">
            Last updated: December 2024
          </p>

          <div className="prose prose-invert max-w-none space-y-6 text-[var(--foreground)]">
            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">1. Introduction</h2>
              <p className="text-[var(--muted)]">
                This Privacy Policy explains how AFCON 2025 Predictor (&quot;we&quot;, &quot;our&quot;, &quot;the Platform&quot;) collects, uses, and protects your personal information. This is a <strong>free testing platform</strong> for entertainment purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">2. Information We Collect</h2>
              <p className="text-[var(--muted)]">
                We collect the following information when you create an account:
              </p>
              <ul className="list-disc list-inside text-[var(--muted)] mt-2 space-y-1">
                <li><strong>Email address</strong> - For account verification and password reset</li>
                <li><strong>Username</strong> - For display on the leaderboard</li>
                <li><strong>Password</strong> - Stored securely using bcrypt encryption</li>
                <li><strong>Predictions</strong> - Your match predictions and scores</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">3. How We Use Your Information</h2>
              <p className="text-[var(--muted)]">
                Your information is used solely for:
              </p>
              <ul className="list-disc list-inside text-[var(--muted)] mt-2 space-y-1">
                <li>Account authentication and security</li>
                <li>Displaying your username on the leaderboard</li>
                <li>Sending verification and password reset emails</li>
                <li>Calculating and displaying your prediction scores</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">4. Data Storage & Security</h2>
              <p className="text-[var(--muted)]">
                We take your data security seriously:
              </p>
              <ul className="list-disc list-inside text-[var(--muted)] mt-2 space-y-1">
                <li>Passwords are hashed using bcrypt (never stored in plain text)</li>
                <li>Data is stored on secure cloud infrastructure (Supabase)</li>
                <li>HTTPS encryption for all data transmission</li>
                <li>Session tokens use HTTP-only cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">5. Data Sharing</h2>
              <p className="text-[var(--muted)]">
                We do <strong>NOT</strong> sell, trade, or share your personal information with third parties. Your data is only used for operating this Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">6. Cookies</h2>
              <p className="text-[var(--muted)]">
                We use essential cookies for:
              </p>
              <ul className="list-disc list-inside text-[var(--muted)] mt-2 space-y-1">
                <li>Authentication sessions</li>
                <li>Theme preferences (dark/light mode)</li>
              </ul>
              <p className="text-[var(--muted)] mt-2">
                We do not use tracking or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">7. Your Rights</h2>
              <p className="text-[var(--muted)]">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-[var(--muted)] mt-2 space-y-1">
                <li>Request access to your personal data</li>
                <li>Request deletion of your account and data</li>
                <li>Update your account information</li>
              </ul>
              <p className="text-[var(--muted)] mt-2">
                Contact us at afcon.2025mar@gmail.com to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">8. Data Retention</h2>
              <p className="text-[var(--muted)]">
                As this is a testing platform, data may be deleted at any time without notice. We do not guarantee long-term data preservation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">9. Children&apos;s Privacy</h2>
              <p className="text-[var(--muted)]">
                This Platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">10. Changes to This Policy</h2>
              <p className="text-[var(--muted)]">
                We may update this Privacy Policy at any time. Continued use of the Platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">11. Contact</h2>
              <p className="text-[var(--muted)]">
                For privacy-related questions, contact us at: afcon.2025mar@gmail.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
