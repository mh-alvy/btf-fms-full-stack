require('dotenv').config();
const mongoose = require('mongoose');
const Batch = require('../models/Batch');
const Course = require('../models/Course');
const Month = require('../models/Month');

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Create test batches
    const batch1 = new Batch({ name: 'Science Batch 2024', isActive: true });
    const batch2 = new Batch({ name: 'Commerce Batch 2024', isActive: true });
    await batch1.save();
    await batch2.save();
    console.log('Created test batches');

    // Create test courses
    const course1 = new Course({
      name: 'Physics',
      batchId: batch1._id,
      monthlyFee: 1500,
      description: 'Physics course for science students',
      isActive: true
    });

    const course2 = new Course({
      name: 'Mathematics',
      batchId: batch1._id,
      monthlyFee: 1200,
      description: 'Mathematics course for science students',
      isActive: true
    });

    const course3 = new Course({
      name: 'Accounting',
      batchId: batch2._id,
      monthlyFee: 1000,
      description: 'Accounting course for commerce students',
      isActive: true
    });

    await course1.save();
    await course2.save();
    await course3.save();
    console.log('Created test courses');

    // Create test months
    const month1 = new Month({
      name: 'January 2024',
      courseId: course1._id,
      monthNumber: 1,
      payment: 1500,
      dueDate: new Date('2024-01-31'),
      isActive: true
    });

    const month2 = new Month({
      name: 'February 2024',
      courseId: course2._id,
      monthNumber: 2,
      payment: 1200,
      dueDate: new Date('2024-02-29'),
      isActive: true
    });

    const month3 = new Month({
      name: 'March 2024',
      courseId: course3._id,
      monthNumber: 3,
      payment: 1000,
      dueDate: new Date('2024-03-31'),
      isActive: true
    });

    await month1.save();
    await month2.save();
    await month3.save();
    console.log('Created test months');

    console.log('Test data created successfully!');
    console.log(`
Test Data Summary:
- Batches: Science Batch 2024, Commerce Batch 2024
- Courses: Physics (Science), Mathematics (Science), Accounting (Commerce)
- Months: January 2024 (Physics), February 2024 (Mathematics), March 2024 (Accounting)
`);

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
createTestData();