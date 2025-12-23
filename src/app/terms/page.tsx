import Link from "next/link";
import { FiArrowLeft, FiShield } from "react-icons/fi";

export default function TermsOfServicePage() {
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
            <FiShield className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-display font-bold text-[var(--foreground)]">
              Terms of Service
            </h1>
          </div>

          <p className="text-[var(--muted)] mb-6">
            Last updated: December 2024
          </p>

          <div className="prose prose-invert max-w-none space-y-6 text-[var(--foreground)]">
            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">1. Acceptance of Terms</h2>
              <p className="text-[var(--muted)]">
                By accessing and using the AFCON 2025 Predictor (&quot;the Platform&quot;), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">2. Platform Purpose</h2>
              <p className="text-[var(--muted)]">
                This Platform is a <strong>free, non-commercial prediction game</strong> created for entertainment purposes only. It is designed to allow users to predict the outcomes of AFCON 2025 football matches and compete on a leaderboard.
              </p>
              <ul className="list-disc list-inside text-[var(--muted)] mt-2 space-y-1">
                <li>No real money or prizes are involved</li>
                <li>This is NOT a gambling or betting platform</li>
                <li>The Platform is for entertainment and testing purposes only</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">3. User Accounts</h2>
              <p className="text-[var(--muted)]">
                To use the Platform, you must create an account with a valid email address. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-[var(--muted)] mt-2 space-y-1">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and truthful information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">4. Acceptable Use</h2>
              <p className="text-[var(--muted)]">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-[var(--muted)] mt-2 space-y-1">
                <li>Create multiple accounts to manipulate the leaderboard</li>
                <li>Use automated systems or bots</li>
                <li>Attempt to hack or compromise the Platform</li>
                <li>Use the Platform for any illegal purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">5. No Warranties</h2>
              <p className="text-[var(--muted)]">
                The Platform is provided &quot;as is&quot; without any warranties. We do not guarantee:
              </p>
              <ul className="list-disc list-inside text-[var(--muted)] mt-2 space-y-1">
                <li>Continuous or uninterrupted access</li>
                <li>Accuracy of match data or scores</li>
                <li>Preservation of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">6. Limitation of Liability</h2>
              <p className="text-[var(--muted)]">
                This is a free testing platform. We are not liable for any damages arising from your use of the Platform. Use at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">7. Changes to Terms</h2>
              <p className="text-[var(--muted)]">
                We reserve the right to modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-500 mb-3">8. Contact</h2>
              <p className="text-[var(--muted)]">
                For questions about these Terms, please contact us at: afcon.2025mar@gmail.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
