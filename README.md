# ⚽ AFCON 2025 Predictor

A modern prediction platform for the Africa Cup of Nations 2025 (Morocco). Predict match results, compete on the leaderboard, and earn Tunisian titles!

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)
![Vibe Coded](https://img.shields.io/badge/Vibe%20Coded-with%20Claude-blueviolet)

> 🤖 **Vibe Coded** with [Claude](https://claude.ai) (Anthropic) - This project was built through AI-assisted development, combining human creativity with AI pair programming!

## 🎮 Play Now!

**[➡️ Play Live at afcon2025-predictor.vercel.app](https://afcon2025-predictor.vercel.app)**

No setup needed - just sign up and start predicting!

---

## ⚡ Quick Start (Run Locally)

```bash
# 1. Clone & install
git clone https://github.com/your-username/afcon-predictor.git
cd afcon-predictor
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your database & SMTP credentials

# 3. Setup database
npx prisma db push
npm run db:seed

# 4. Run!
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

---

## 🆕 Latest Features

### ⚡ Quick Predict

Predict **all matches at once** instead of one by one! Find it at `/quick-predict`

### ⏱️ Live Match Minutes

Real-time display of match minutes during live games:

- Shows current minute (45', 67', 90+3')
- Halftime indicator (HT)
- Auto-completes matches and calculates points when FT

### ✅ Prediction Results

See directly on match cards if your prediction was:

- 🟢 **Correct** (+3 or +4 points with 🔥 bonus)
- 🔴 **Wrong** (0 points)

### 🌍 French Translation

Full French language support with auto-detection based on location

### 📧 Admin Announcements

Send feature announcements to all users via email from admin panel

---

## 🚀 Features

### User Features

- ✅ **Email Verification** - Secure registration with email confirmation
- ✅ **Password Reset** - Forgot password flow with email link
- ✅ **Quick Predict** - Predict all matches in one go
- ✅ **Match Predictions** - Predict winners and exact scores
- ✅ **Live Match Minutes** - Real-time minute display during games
- ✅ **Prediction Results** - See correct/wrong on match cards
- ✅ **Live Leaderboard** - Real-time rankings with Tunisian titles
- ✅ **User Dashboard** - Personal stats and prediction history
- ✅ **Local Timezone** - Match times displayed in your timezone
- ✅ **Multi-language** - English & French with auto-detection

### Admin Features

- ✅ **Admin Panel** - Full dashboard at `/admin`
- ✅ **Match Management** - Update scores and status
- ✅ **Auto-Sync Scores** - API-Football integration
- ✅ **User Management** - View all users and stats
- ✅ **Points Recalculation** - Manual trigger option
- ✅ **Email Announcements** - Send updates to all users

### Security

- ✅ **Rate Limiting** - Protects against brute force
- ✅ **Input Validation** - Zod schemas on all endpoints
- ✅ **Password Hashing** - bcrypt with 12 rounds
- ✅ **Session Security** - HTTP-only cookies, 30-day expiry
- ✅ **HTTPS Headers** - CSP, HSTS, X-Frame-Options

## 📋 Tech Stack

| Category   | Technology              |
| ---------- | ----------------------- |
| Framework  | Next.js 14 (App Router) |
| Language   | TypeScript              |
| Styling    | Tailwind CSS            |
| Database   | PostgreSQL (Supabase)   |
| ORM        | Prisma                  |
| Auth       | NextAuth.js             |
| Email      | Brevo (Sendinblue) SMTP |
| Sports API | API-Football            |
| Testing    | Jest + Testing Library  |

## Scoring System

| Prediction               | Points |
| ------------------------ | ------ |
| Correct winner/draw      | 3 pts  |
| + Exact score difference | +1 pt  |
| Incorrect                | 0 pts  |

## 🏆 Leaderboard Titles (Tunisian Theme)

| Rank | Title              | Arabic      |
| ---- | ------------------ | ----------- |
| 1st  | M3alem el Koora 🏆 | معلم الكورة |
| 2nd  | Wazir 👑           | وزير        |
| 3rd  | Elfahim 🧠         | الفاهم      |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── auth/           # Auth endpoints
│   │   ├── admin/          # Admin endpoints
│   │   ├── cron/           # Vercel cron jobs
│   │   └── ...
│   ├── admin/              # Admin panel pages
│   ├── quick-predict/      # Bulk predictions
│   ├── leaderboard/        # Rankings
│   ├── matches/            # Match pages
│   └── ...
├── components/             # React components
│   ├── admin/              # Admin components
│   ├── home/               # Homepage components
│   ├── leaderboard/        # Leaderboard components
│   ├── matches/            # Match components
│   ├── predictions/        # Prediction components
│   └── ui/                 # Base UI components
├── lib/                    # Utilities
│   ├── auth.ts             # NextAuth config
│   ├── email.ts            # Email sending
│   ├── football-api.ts     # API-Football service
│   ├── i18n/               # Translations
│   ├── prisma.ts           # Database client
│   └── utils.ts            # Helper functions
└── __tests__/              # Test files
```

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-32-chars-min"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# SMTP (Brevo)
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM_EMAIL="noreply@yourdomain.com"

# Football API
FOOTBALL_API_KEY="your-api-key"

# Vercel Cron (optional)
CRON_SECRET="your-cron-secret"
```

## 🧪 Testing

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

### Cron Jobs (Auto-Sync)

For automatic score syncing, `vercel.json` is configured:

- Runs every 10 minutes during match hours
- Schedule: `*/10 12-23 * 1-2 *` (Jan-Feb, 12-23 UTC)

> ⚠️ Vercel Free: 1 cron/day | Vercel Pro: Unlimited

## 📝 Scripts

| Command           | Description       |
| ----------------- | ----------------- |
| `npm run dev`     | Start dev server  |
| `npm run build`   | Production build  |
| `npm run start`   | Start production  |
| `npm run test`    | Run tests         |
| `npm run db:push` | Push schema to DB |
| `npm run db:seed` | Seed database     |

## 📄 License

MIT License - Use freely for your projects!

---

Built with ❤️ for African football fans 🏆⚽

**[🎮 Play Now → afcon2025-predictor.vercel.app](https://afcon2025-predictor.vercel.app)**
