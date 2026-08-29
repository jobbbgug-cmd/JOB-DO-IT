require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected');

    // ลบผู้ใช้เก่า (ถ้ามี)
    await User.deleteOne({ email: 'jobbbgug@gmail.com' });

    // สร้าง admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'jobbbgug@gmail.com',
      password: '0811886786',
      role: 'admin',
      department: 'Administration',
    });

    await adminUser.save();

    console.log('✅ Admin user created:');
    console.log(`   Email: jobbbgug@gmail.com`);
    console.log(`   Password: 0811886786`);
    console.log(`   Role: admin`);

    // สร้าง test users
    const testUsers = [
      {
        name: 'Dev User',
        email: 'dev@example.com',
        password: '123456',
        role: 'dev',
        department: 'Development',
      },
      {
        name: 'Tester User',
        email: 'tester@example.com',
        password: '123456',
        role: 'tester',
        department: 'QA',
      },
    ];

    for (const userData of testUsers) {
      await User.deleteOne({ email: userData.email });
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created: ${userData.email} (${userData.role})`);
    }

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
