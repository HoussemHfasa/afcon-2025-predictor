import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// AFCON 2025 Teams - All 24 qualified teams
const teams = [
  // Group A
  { name: "Morocco", shortName: "MAR", country: "Morocco", group: "A", flagUrl: "https://flagcdn.com/w160/ma.png" },
  { name: "Mali", shortName: "MLI", country: "Mali", group: "A", flagUrl: "https://flagcdn.com/w160/ml.png" },
  { name: "Zambia", shortName: "ZAM", country: "Zambia", group: "A", flagUrl: "https://flagcdn.com/w160/zm.png" },
  { name: "Comoros", shortName: "COM", country: "Comoros", group: "A", flagUrl: "https://flagcdn.com/w160/km.png" },
  
  // Group B
  { name: "Egypt", shortName: "EGY", country: "Egypt", group: "B", flagUrl: "https://flagcdn.com/w160/eg.png" },
  { name: "South Africa", shortName: "RSA", country: "South Africa", group: "B", flagUrl: "https://flagcdn.com/w160/za.png" },
  { name: "Angola", shortName: "ANG", country: "Angola", group: "B", flagUrl: "https://flagcdn.com/w160/ao.png" },
  { name: "Zimbabwe", shortName: "ZIM", country: "Zimbabwe", group: "B", flagUrl: "https://flagcdn.com/w160/zw.png" },
  
  // Group C
  { name: "Nigeria", shortName: "NGR", country: "Nigeria", group: "C", flagUrl: "https://flagcdn.com/w160/ng.png" },
  { name: "Tunisia", shortName: "TUN", country: "Tunisia", group: "C", flagUrl: "https://flagcdn.com/w160/tn.png" },
  { name: "Uganda", shortName: "UGA", country: "Uganda", group: "C", flagUrl: "https://flagcdn.com/w160/ug.png" },
  { name: "Tanzania", shortName: "TAN", country: "Tanzania", group: "C", flagUrl: "https://flagcdn.com/w160/tz.png" },
  
  // Group D
  { name: "Senegal", shortName: "SEN", country: "Senegal", group: "D", flagUrl: "https://flagcdn.com/w160/sn.png" },
  { name: "DR Congo", shortName: "COD", country: "DR Congo", group: "D", flagUrl: "https://flagcdn.com/w160/cd.png" },
  { name: "Benin", shortName: "BEN", country: "Benin", group: "D", flagUrl: "https://flagcdn.com/w160/bj.png" },
  { name: "Botswana", shortName: "BOT", country: "Botswana", group: "D", flagUrl: "https://flagcdn.com/w160/bw.png" },
  
  // Group E
  { name: "Algeria", shortName: "ALG", country: "Algeria", group: "E", flagUrl: "https://flagcdn.com/w160/dz.png" },
  { name: "Burkina Faso", shortName: "BFA", country: "Burkina Faso", group: "E", flagUrl: "https://flagcdn.com/w160/bf.png" },
  { name: "Equatorial Guinea", shortName: "EQG", country: "Equatorial Guinea", group: "E", flagUrl: "https://flagcdn.com/w160/gq.png" },
  { name: "Sudan", shortName: "SDN", country: "Sudan", group: "E", flagUrl: "https://flagcdn.com/w160/sd.png" },
  
  // Group F
  { name: "Ivory Coast", shortName: "CIV", country: "Ivory Coast", group: "F", flagUrl: "https://flagcdn.com/w160/ci.png" },
  { name: "Cameroon", shortName: "CMR", country: "Cameroon", group: "F", flagUrl: "https://flagcdn.com/w160/cm.png" },
  { name: "Gabon", shortName: "GAB", country: "Gabon", group: "F", flagUrl: "https://flagcdn.com/w160/ga.png" },
  { name: "Mozambique", shortName: "MOZ", country: "Mozambique", group: "F", flagUrl: "https://flagcdn.com/w160/mz.png" },
];

// Morocco venues for AFCON 2025 - Official stadium names
const venues = [
  "Prince Moulay Abdellah Stadium, Rabat",      // 0 - Main stadium (68,700) - Opening & Final
  "Stade Mohammed V, Casablanca",               // 1 - (45,000)
  "Grand Stade de Marrakech, Marrakesh",        // 2 - (45,000)
  "Adrar Stadium, Agadir",                       // 3 - (45,000)
  "Complexe Sportif de Fès, Fez",               // 4 - (45,000)
  "Ibn Batouta Stadium, Tangier",               // 5 - (75,600) - Largest in Morocco
];

async function main() {
  console.log("🌍 Seeding AFCON 2025 database...\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.prediction.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.predictionTeam.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.user.deleteMany();

  // Create teams
  console.log("Creating teams...");
  const createdTeams: Record<string, string> = {};
  for (const team of teams) {
    const created = await prisma.team.create({ data: team });
    createdTeams[team.shortName] = created.id;
  }
  console.log(`✅ Created ${teams.length} teams`);

  // Create group stage matches with realistic AFCON 2025 schedule
  console.log("Creating matches...");
  
  // AFCON 2025 Schedule (Morocco) - Times in CET (Berlin time, UTC+1)
  // Opening match: Dec 21, 2025 - Morocco vs Comoros
  // Then 2-3 matches per day through the group stage
  
  const matchSchedule = [
    // Day 1 - Dec 21 (Opening Match Only)
    // Morocco vs Comoros - Prince Moulay Abdellah Stadium, Rabat
    { day: 21, time: "21:00", teamA: "MAR", teamB: "COM", group: "A", venue: 0 },
    
    // Day 2 - Dec 22 (3 matches)
    // Mali vs Zambia - Mohammed V Stadium, Casablanca
    { day: 22, time: "15:00", teamA: "MLI", teamB: "ZAM", group: "A", venue: 1 },
    // South Africa vs Angola - Grand Stade de Marrakech
    { day: 22, time: "18:00", teamA: "RSA", teamB: "ANG", group: "B", venue: 2 },
    // Egypt vs Zimbabwe - Adrar Stadium, Agadir
    { day: 22, time: "21:00", teamA: "EGY", teamB: "ZIM", group: "B", venue: 3 },
    
    // Day 3 - Dec 23 (4 matches)
    // DR Congo vs Benin - Complexe Sportif de Fès
    { day: 23, time: "13:30", teamA: "COD", teamB: "BEN", group: "D", venue: 4 },
    // Senegal vs Botswana - Ibn Batouta Stadium, Tangier
    { day: 23, time: "16:00", teamA: "SEN", teamB: "BOT", group: "D", venue: 5 },
    // Nigeria vs Tanzania - Complexe Sportif de Fès
    { day: 23, time: "18:30", teamA: "NGR", teamB: "TAN", group: "C", venue: 4 },
    // Tunisia vs Uganda - Prince Moulay Abdellah Stadium, Rabat
    { day: 23, time: "21:00", teamA: "TUN", teamB: "UGA", group: "C", venue: 0 },
    
    // Day 4 - Dec 24 (4 matches)
    // Burkina Faso vs Equatorial Guinea - Mohammed V Stadium, Casablanca
    { day: 24, time: "13:30", teamA: "BFA", teamB: "EQG", group: "E", venue: 1 },
    // Algeria vs Sudan - Prince Moulay Abdellah Stadium, Rabat
    { day: 24, time: "16:00", teamA: "ALG", teamB: "SDN", group: "E", venue: 0 },
    // Ivory Coast vs Mozambique - Grand Stade de Marrakech
    { day: 24, time: "18:30", teamA: "CIV", teamB: "MOZ", group: "F", venue: 2 },
    // Cameroon vs Gabon - Adrar Stadium, Agadir
    { day: 24, time: "21:00", teamA: "CMR", teamB: "GAB", group: "F", venue: 3 },
    
    // Day 5 - Dec 26 (Match Day 2 - Group A & B) (4 matches)
    // Angola vs Zimbabwe - Grand Stade de Marrakech
    { day: 26, time: "13:30", teamA: "ANG", teamB: "ZIM", group: "B", venue: 2 },
    // Egypt vs South Africa - Adrar Stadium, Agadir
    { day: 26, time: "16:00", teamA: "EGY", teamB: "RSA", group: "B", venue: 3 },
    // Zambia vs Comoros - Mohammed V Stadium, Casablanca
    { day: 26, time: "18:30", teamA: "ZAM", teamB: "COM", group: "A", venue: 1 },
    // Morocco vs Mali - Prince Moulay Abdellah Stadium, Rabat
    { day: 26, time: "21:00", teamA: "MAR", teamB: "MLI", group: "A", venue: 0 },
    
    // Day 6 - Dec 27 (Match Day 2 - Group C & D) (4 matches)
    // Benin vs Botswana - Prince Moulay Abdellah Stadium, Rabat
    { day: 27, time: "13:30", teamA: "BEN", teamB: "BOT", group: "D", venue: 0 },
    // Senegal vs DR Congo - Ibn Batouta Stadium, Tangier
    { day: 27, time: "16:00", teamA: "SEN", teamB: "COD", group: "D", venue: 5 },
    // Tanzania vs Uganda - Mohammed V Stadium, Casablanca
    { day: 27, time: "18:30", teamA: "TAN", teamB: "UGA", group: "C", venue: 1 },
    // Nigeria vs Tunisia - Complexe Sportif de Fès
    { day: 27, time: "21:00", teamA: "NGR", teamB: "TUN", group: "C", venue: 4 },
    
    // Day 7 - Dec 28 (Match Day 2 - Group E & F) (4 matches)
    // Equatorial Guinea vs Sudan - Complexe Sportif de Fès
    { day: 28, time: "13:30", teamA: "EQG", teamB: "SDN", group: "E", venue: 4 },
    // Algeria vs Burkina Faso - Prince Moulay Abdellah Stadium, Rabat
    { day: 28, time: "16:00", teamA: "ALG", teamB: "BFA", group: "E", venue: 0 },
    // Gabon vs Mozambique - Adrar Stadium, Agadir
    { day: 28, time: "18:30", teamA: "GAB", teamB: "MOZ", group: "F", venue: 3 },
    // Ivory Coast vs Cameroon - Grand Stade de Marrakech
    { day: 28, time: "21:00", teamA: "CIV", teamB: "CMR", group: "F", venue: 2 },
    
    // Day 8 - Dec 30 (Match Day 3 - Group A & B) (4 matches)
    // Comoros vs Mali - Mohammed V Stadium, Casablanca
    { day: 30, time: "18:00", teamA: "COM", teamB: "MLI", group: "A", venue: 1 },
    // Zambia vs Morocco - Prince Moulay Abdellah Stadium, Rabat
    { day: 30, time: "18:00", teamA: "ZAM", teamB: "MAR", group: "A", venue: 0 },
    // Zimbabwe vs South Africa - Grand Stade de Marrakech
    { day: 30, time: "21:00", teamA: "ZIM", teamB: "RSA", group: "B", venue: 2 },
    // Angola vs Egypt - Adrar Stadium, Agadir
    { day: 30, time: "21:00", teamA: "ANG", teamB: "EGY", group: "B", venue: 3 },
    
    // Day 9 - Dec 31 (Match Day 3 - Group C & D) (4 matches)
    // Uganda vs Nigeria - Complexe Sportif de Fès
    { day: 31, time: "18:00", teamA: "UGA", teamB: "NGR", group: "C", venue: 4 },
    // Tanzania vs Tunisia - Prince Moulay Abdellah Stadium, Rabat
    { day: 31, time: "18:00", teamA: "TAN", teamB: "TUN", group: "C", venue: 0 },
    // Botswana vs Senegal - Ibn Batouta Stadium, Tangier
    { day: 31, time: "21:00", teamA: "BOT", teamB: "SEN", group: "D", venue: 5 },
    // Benin vs DR Congo - Mohammed V Stadium, Casablanca
    { day: 31, time: "21:00", teamA: "BEN", teamB: "COD", group: "D", venue: 1 },
    
    // Day 10 - Jan 1 (Match Day 3 - Group E & F) (4 matches)
    // Sudan vs Burkina Faso - Complexe Sportif de Fès
    { day: 32, time: "18:00", teamA: "SDN", teamB: "BFA", group: "E", venue: 4 },
    // Equatorial Guinea vs Algeria - Prince Moulay Abdellah Stadium, Rabat
    { day: 32, time: "18:00", teamA: "EQG", teamB: "ALG", group: "E", venue: 0 },
    // Mozambique vs Ivory Coast - Grand Stade de Marrakech
    { day: 32, time: "21:00", teamA: "MOZ", teamB: "CIV", group: "F", venue: 2 },
    // Gabon vs Cameroon - Adrar Stadium, Agadir
    { day: 32, time: "21:00", teamA: "GAB", teamB: "CMR", group: "F", venue: 3 },
  ];

  const groupMatches: Array<{
    teamAId: string;
    teamBId: string;
    matchDate: Date;
    venue: string;
    stage: "GROUP";
    groupName: string;
    matchNumber: number;
  }> = [];

  let matchNumber = 1;
  
  for (const match of matchSchedule) {
    const [hours, minutes] = match.time.split(":").map(Number);
    
    // Calculate the date (day 32 = Jan 1, day 33 = Jan 2, etc.)
    let matchDate: Date;
    if (match.day <= 31) {
      matchDate = new Date(2025, 11, match.day, hours, minutes, 0); // December 2025
    } else {
      matchDate = new Date(2026, 0, match.day - 31, hours, minutes, 0); // January 2026
    }
    
    groupMatches.push({
      teamAId: createdTeams[match.teamA],
      teamBId: createdTeams[match.teamB],
      matchDate,
      venue: venues[match.venue],
      stage: "GROUP",
      groupName: match.group,
      matchNumber: matchNumber++,
    });
  }

  for (const match of groupMatches) {
    await prisma.match.create({ data: match });
  }
  console.log(`✅ Created ${groupMatches.length} group stage matches`);

  // Create achievements
  console.log("Creating achievements...");
  const achievements = [
    { name: "First Prediction", description: "Make your first prediction", category: "milestone", points: 5, condition: JSON.stringify({ type: "predictions_count", value: 1 }) },
    { name: "Getting Started", description: "Make 10 predictions", category: "milestone", points: 10, condition: JSON.stringify({ type: "predictions_count", value: 10 }) },
    { name: "Dedicated Predictor", description: "Make 25 predictions", category: "milestone", points: 25, condition: JSON.stringify({ type: "predictions_count", value: 25 }) },
    { name: "Prediction Master", description: "Make 50 predictions", category: "milestone", points: 50, condition: JSON.stringify({ type: "predictions_count", value: 50 }) },
    { name: "First Win", description: "Get your first correct prediction", category: "prediction", points: 5, condition: JSON.stringify({ type: "correct_count", value: 1 }) },
    { name: "Sharp Eye", description: "Get 10 correct predictions", category: "prediction", points: 15, condition: JSON.stringify({ type: "correct_count", value: 10 }) },
    { name: "Fortune Teller", description: "Get 25 correct predictions", category: "prediction", points: 30, condition: JSON.stringify({ type: "correct_count", value: 25 }) },
    { name: "Hot Streak", description: "Get 3 correct predictions in a row", category: "streak", points: 10, condition: JSON.stringify({ type: "streak", value: 3 }) },
    { name: "On Fire", description: "Get 5 correct predictions in a row", category: "streak", points: 25, condition: JSON.stringify({ type: "streak", value: 5 }) },
    { name: "Unstoppable", description: "Get 10 correct predictions in a row", category: "streak", points: 50, condition: JSON.stringify({ type: "streak", value: 10 }) },
    { name: "Perfect Score", description: "Predict exact score difference bonus", category: "prediction", points: 15, condition: JSON.stringify({ type: "bonus_count", value: 1 }) },
    { name: "Score Master", description: "Get 5 exact score difference bonuses", category: "prediction", points: 40, condition: JSON.stringify({ type: "bonus_count", value: 5 }) },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.create({ data: achievement });
  }
  console.log(`✅ Created ${achievements.length} achievements`);

  // Create admin user
  // ⚠️ IMPORTANT: Change these credentials in production!
  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash("ChangeMe123!", 12);
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      username: "admin",
      passwordHash: adminPassword,
      isAdmin: true,
      isVerified: true,
    },
  });
  console.log("✅ Created admin user (admin@example.com / ChangeMe123!)");

  // Create sample users for testing
  console.log("Creating sample users...");
  const testPassword = await bcrypt.hash("TestUser123!", 12);
  const sampleUsers = [
    { email: "player1@example.com", username: "MoroccoFan", totalPoints: 45, correctPredictions: 12, totalPredictions: 18 },
    { email: "player2@example.com", username: "EgyptLegend", totalPoints: 38, correctPredictions: 10, totalPredictions: 16 },
    { email: "player3@example.com", username: "NigeriaEagle", totalPoints: 42, correctPredictions: 11, totalPredictions: 17 },
    { email: "player4@example.com", username: "SenegalLion", totalPoints: 35, correctPredictions: 9, totalPredictions: 15 },
    { email: "player5@example.com", username: "IvoryHero", totalPoints: 30, correctPredictions: 8, totalPredictions: 14 },
  ];

  for (const user of sampleUsers) {
    await prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        passwordHash: testPassword,
        isVerified: true,
        totalPoints: user.totalPoints,
        correctPredictions: user.correctPredictions,
        totalPredictions: user.totalPredictions,
      },
    });
  }
  console.log(`✅ Created ${sampleUsers.length} sample users`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📝 Login credentials:");
  console.log("   Admin: admin@example.com / ChangeMe123!");
  console.log("   Test user: player1@example.com / TestUser123!");
  console.log("\n⚠️  IMPORTANT: Change default passwords before deploying to production!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
