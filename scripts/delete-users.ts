import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteNonAdminUsers() {
  console.log('🗑️ Deleting all non-admin users...');
  
  // First delete predictions (foreign key constraint)
  const deletedPredictions = await prisma.prediction.deleteMany({
    where: {
      user: {
        isAdmin: false
      }
    }
  });
  console.log(`   Deleted ${deletedPredictions.count} predictions`);
  
  // Then delete non-admin users
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      isAdmin: false
    }
  });
  console.log(`   Deleted ${deletedUsers.count} non-admin users`);
  
  // Show remaining admin
  const admins = await prisma.user.findMany({
    where: { isAdmin: true },
    select: { username: true, email: true }
  });
  console.log('\n✅ Remaining admin users:');
  admins.forEach(admin => {
    console.log(`   - ${admin.username} (${admin.email})`);
  });
  
  await prisma.$disconnect();
}

deleteNonAdminUsers()
  .catch(console.error);
