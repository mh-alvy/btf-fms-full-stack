require('dotenv').config();
const mongoose = require('mongoose');
const Batch = require('../models/Batch');
const Course = require('../models/Course');

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Create test batches
    const batch1 = await Batch.findOneAndUpdate(
      { name: 'Morning Batch' },
      { 
        name: 'Morning Batch',
        description: 'Morning batch for early learners',
        startTime: '08:00',
        endTime: '12:00',
        isActive: true
      },
      { upsert: true, new: true }
    );

    const batch2 = await Batch.findOneAndUpdate(
      { name: 'Evening Batch' },
      { 
        name: 'Evening Batch',
        description: 'Evening batch for working professionals',
        startTime: '18:00',
        endTime: '22:00',
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('Created test batches');

    // Create test courses
    await Course.findOneAndUpdate(
      { name: 'JavaScript Fundamentals' },
      {
        name: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        batchId: batch1._id,
        duration: 6,
        fee: 5000,
        isActive: true
      },
      { upsert: true, new: true }
    );

    await Course.findOneAndUpdate(
      { name: 'React Development' },
      {
        name: 'React Development',
        description: 'Advanced React development course',
        batchId: batch1._id,
        duration: 8,
        fee: 8000,
        isActive: true
      },
      { upsert: true, new: true }
    );

    await Course.findOneAndUpdate(
      { name: 'Node.js Backend' },
      {
        name: 'Node.js Backend',
        description: 'Server-side development with Node.js',
        batchId: batch2._id,
        duration: 10,
        fee: 10000,
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('Created test courses');
    console.log('Test data created successfully!');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
createTestData();