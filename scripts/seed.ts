import connectDB from '@/lib/db';
import User from '@/lib/models/User';

async function seed() {
  try {
    await connectDB();

    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
      },
      {
        name: 'Dev User',
        email: 'dev@test.com',
        password: 'password123',
        role: 'dev',
      },
      {
        name: 'Tester User',
        email: 'tester@test.com',
        password: 'password123',
        role: 'tester',
      },
    ];

    for (const userData of testUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`⏭️  User already exists: ${userData.email}`);
      }
    }

    console.log('✅ Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
