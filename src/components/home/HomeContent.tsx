"use client";

import Link from "next/link";
import { FiTarget, FiAward, FiUsers, FiTrendingUp, FiZap } from "react-icons/fi";
import { GiSoccerBall, GiTrophy } from "react-icons/gi";
import { useTranslation } from "@/lib/i18n";
import { HeroCTA } from "./HeroCTA";

export function HomeContent() {
  const { t } = useTranslation();

  const features = [
    {
      icon: FiTarget,
      title: t("home.features.predictMatches.title"),
      description: t("home.features.predictMatches.description"),
    },
    {
      icon: FiAward,
      title: t("home.features.earnPoints.title"),
      description: t("home.features.earnPoints.description"),
    },
    {
      icon: FiTrendingUp,
      title: t("home.features.climbLeaderboard.title"),
      description: t("home.features.climbLeaderboard.description"),
    },
    {
      icon: FiUsers,
      title: t("home.features.challengeFriends.title"),
      description: t("home.features.challengeFriends.description"),
    },
    {
      icon: GiTrophy,
      title: t("home.features.unlockAchievements.title"),
      description: t("home.features.unlockAchievements.description"),
    },
    {
      icon: FiZap,
      title: t("home.features.realTimeUpdates.title"),
      description: t("home.features.realTimeUpdates.description"),
    },
  ];

  const stats = [
    { value: "24", label: t("home.stats.teams") },
    { value: "52", label: t("home.stats.matches") },
    { value: "1M+", label: t("home.stats.predictions") },
    { value: "3", label: t("home.stats.titles") },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 hero-pattern" />
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 opacity-20 animate-float">
          <GiSoccerBall className="w-20 h-20 text-primary-500" />
        </div>
        <div className="absolute bottom-1/4 right-10 opacity-20 animate-float" style={{ animationDelay: "1s" }}>
          <GiTrophy className="w-16 h-16 text-secondary-500" />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-10 animate-float" style={{ animationDelay: "2s" }}>
          <GiSoccerBall className="w-24 h-24 text-primary-400" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center py-32">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8">
            <GiSoccerBall className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-500">
              {t("home.badge")}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
            <span className="text-[var(--foreground)]">{t("home.heroTitle1")} </span>
            <span className="gradient-text">{t("home.heroTitle2")}</span>
            <br />
            <span className="text-[var(--foreground)]">{t("home.heroTitle3")} </span>
            <span className="text-primary-500">{t("home.heroTitle4")}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10">
            {t("home.heroSubtitle")}
          </p>

          {/* CTA Buttons - Dynamic based on session */}
          <HeroCTA />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary-500">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-[var(--card-bg)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="text-[var(--foreground)]">{t("home.features.title")} </span>
              <span className="text-primary-500">{t("home.features.titleHighlight")}</span>
            </h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="card-hover p-8 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-6 group-hover:bg-primary-500/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--muted)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Points Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                <span className="text-[var(--foreground)]">{t("home.scoring.title")} </span>
                <span className="text-primary-500">{t("home.scoring.titleHighlight")}</span>
              </h2>
              <p className="text-[var(--muted)] mb-8">
                {t("home.scoring.subtitle")}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary-500/10 border border-secondary-500/20">
                  <div className="w-12 h-12 rounded-xl bg-secondary-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)]">{t("home.scoring.correctPrediction.title")}</h4>
                    <p className="text-sm text-[var(--muted)]">
                      {t("home.scoring.correctPrediction.description")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                  <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-dark-950 font-bold text-xl flex-shrink-0">
                    +1
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)]">{t("home.scoring.scoreDifferenceBonus.title")}</h4>
                    <p className="text-sm text-[var(--muted)]">
                      {t("home.scoring.scoreDifferenceBonus.description")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-accent-500/10 border border-accent-500/20">
                  <div className="w-12 h-12 rounded-xl bg-accent-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    0
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)]">{t("home.scoring.incorrectPrediction.title")}</h4>
                    <p className="text-sm text-[var(--muted)]">
                      {t("home.scoring.incorrectPrediction.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card p-8 bg-gradient-to-br from-primary-500/10 to-secondary-500/10">
                <div className="text-center mb-8">
                  <GiTrophy className="w-20 h-20 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-display font-bold text-[var(--foreground)]">
                    {t("home.scoring.topPredictorTitles")}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--background)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full rank-gold flex items-center justify-center font-bold">1</div>
                      <span className="font-medium">{t("home.scoring.firstPlace")}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-primary-500 font-bold block">M3alem el Koora</span>
                      <span className="text-xs text-[var(--muted)]">معلم الكورة 🏆</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--background)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full rank-silver flex items-center justify-center font-bold">2</div>
                      <span className="font-medium">{t("home.scoring.secondPlace")}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-primary-500 font-bold block">Wazir</span>
                      <span className="text-xs text-[var(--muted)]">وزير 👑</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--background)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full rank-bronze flex items-center justify-center font-bold">3</div>
                      <span className="font-medium">{t("home.scoring.thirdPlace")}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-primary-500 font-bold block">Elfahim</span>
                      <span className="text-xs text-[var(--muted)]">الفاهم 🧠</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

