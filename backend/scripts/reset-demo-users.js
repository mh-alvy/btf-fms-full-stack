require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function resetDemoUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Remove existing demo users
    const demoUsernames = ['admin', 'manager', 'developer'];
    await User.deleteMany({ username: { $in: demoUsernames } });
    console.log('Removed existing demo users');

    // Create new demo users
    const demoUsers = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Administrator',
        isActive: true
      },
      {
        username: 'manager',
        password: 'manager123',
        role: 'manager',
        name: 'Manager',
        isActive: true
      },
      {
        username: 'developer',
        password: 'dev123',
        role: 'developer',
        name: 'Developer',
        isActive: true
      }
    ];

    for (const userData of demoUsers) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword
      });

      await user.save();
      console.log(`Created demo user: ${userData.username}`);
    }

    console.log('Demo users reset successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Manager: manager / manager123');
    console.log('Developer: developer / dev123');

  } catch (error) {
    console.error('Error resetting demo users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
resetDemoUsers();
