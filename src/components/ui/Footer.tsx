"use client";

import Link from "next/link";
import { GiSoccerBall } from "react-icons/gi";
import { FiTwitter, FiFacebook, FiInstagram, FiGithub, FiMail } from "react-icons/fi";
import { useTranslation } from "@/lib/i18n";

const socialLinks = [
  { icon: FiTwitter, href: "https://twitter.com", label: "Twitter" },
  { icon: FiFacebook, href: "https://facebook.com", label: "Facebook" },
  { icon: FiInstagram, href: "https://instagram.com", label: "Instagram" },
  { icon: FiGithub, href: "https://github.com", label: "GitHub" },
];

export function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    quickLinks: [
      { label: t("nav.home"), href: "/" },
      { label: t("nav.matches"), href: "/matches" },
      { label: t("nav.predictions"), href: "/predictions" },
      { label: t("nav.leaderboard"), href: "/leaderboard" },
    ],
    legal: [
      { label: t("footer.privacyPolicy"), href: "/privacy" },
      { label: t("footer.termsOfService"), href: "/terms" },
      { label: t("footer.contactUs"), href: "/contact" },
    ],
  };

  return (
    <footer className="bg-[var(--card-bg)] border-t border-[var(--card-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <GiSoccerBall className="w-8 h-8 text-primary-500" />
              <span className="font-display text-xl font-bold">
                <span className="text-primary-500">AFCON</span>
                <span className="text-[var(--foreground)]"> 2025</span>
              </span>
            </Link>
            <p className="text-[var(--muted)] text-sm max-w-xs mb-6">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-[var(--muted)] hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-[var(--foreground)] mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-[var(--foreground)] mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[var(--card-border)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--muted)]">
              {t("footer.copyright")}
            </p>
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <FiMail className="w-4 h-4" />
              <a href="mailto:afcon.2025mar@gmail.com" className="hover:text-primary-500 transition-colors">
                afcon.2025mar@gmail.com
              </a>
            </div>
          </div>
          <p className="text-center text-sm text-[var(--muted)] mt-4">
            {t("footer.madeWith")}
          </p>
        </div>
      </div>
    </footer>
  );
}

