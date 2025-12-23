"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiMenu, 
  FiX, 
  FiSun, 
  FiMoon, 
  FiUser, 
  FiLogOut, 
  FiSettings,
  FiHome,
  FiCalendar,
  FiAward,
  FiTrendingUp,
  FiTarget
} from "react-icons/fi";
import { GiSoccerBall } from "react-icons/gi";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";

export function Navbar() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { href: "/", label: t("nav.home"), icon: FiHome },
    { href: "/matches", label: t("nav.matches"), icon: FiCalendar },
    { href: "/predictions", label: t("nav.predictions"), icon: FiTarget },
    { href: "/leaderboard", label: t("nav.leaderboard"), icon: FiTrendingUp },
  ];

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--background)]/80 backdrop-blur-xl shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <GiSoccerBall className="w-8 h-8 md:w-10 md:h-10 text-primary-500 group-hover:rotate-180 transition-transform duration-500" />
              <div className="absolute inset-0 bg-primary-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display text-xl md:text-2xl font-bold">
              <span className="text-primary-500">AFCON</span>
              <span className="text-[var(--foreground)]"> 2025</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--muted)] hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-200"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <FiSun className="w-5 h-5" />
                ) : (
                  <FiMoon className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Auth Buttons */}
            {status === "loading" ? (
              <div className="w-24 h-10 rounded-xl animate-shimmer" />
            ) : session ? (
              <div className="hidden md:flex items-center gap-2">
                {/* Admin Button - only show for admins */}
                {session.user?.isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-accent-500 bg-accent-500/10 hover:bg-accent-500/20 transition-all duration-200"
                  >
                    <FiSettings className="w-4 h-4" />
                    {t("common.admin")}
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--muted)] hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-200"
                >
                  <FiUser className="w-4 h-4" />
                  {session.user?.name || t("common.dashboard")}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="p-2 rounded-xl text-[var(--muted)] hover:text-accent-500 hover:bg-accent-500/10 transition-all duration-200"
                  aria-label={t("common.signOut")}
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm">
                  {t("common.signIn")}
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  {t("common.joinNow")}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl text-[var(--muted)] hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--background)]/95 backdrop-blur-xl border-t border-[var(--card-border)]"
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--foreground)] hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-200"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t border-[var(--card-border)] my-4" />
              
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--foreground)] hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-200"
                  >
                    <FiUser className="w-5 h-5" />
                    {t("common.dashboard")}
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--foreground)] hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-200"
                  >
                    <FiSettings className="w-5 h-5" />
                    {t("common.settings")}
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/login' });
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-accent-500 hover:bg-accent-500/10 transition-all duration-200"
                  >
                    <FiLogOut className="w-5 h-5" />
                    {t("common.signOut")}
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center btn-ghost"
                  >
                    {t("common.signIn")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center btn-primary"
                  >
                    {t("common.joinNow")}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

