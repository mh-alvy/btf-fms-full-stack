const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Get all students
router.get('/', async (req, res) => {
  try {
    const { name, studentId } = req.query;
    let query = {};
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    if (studentId) {
      query.studentId = studentId;
    }
    
    const students = await Student.find(query)
      .populate('institutionId')
      .populate('batchId')
      .populate({
        path: 'enrolledCourses.courseId',
        populate: {
          path: 'batchId'
        }
      })
      .populate('enrolledCourses.startingMonthId')
      .populate('enrolledCourses.endingMonthId');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate student ID
router.get('/generate-id', async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const studentId = `STU${String(studentCount + 1).padStart(4, '0')}`;
    res.json({ studentId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('institutionId')
      .populate('batchId')
      .populate({
        path: 'enrolledCourses.courseId',
        populate: {
          path: 'batchId'
        }
      })
      .populate('enrolledCourses.startingMonthId')
      .populate('enrolledCourses.endingMonthId');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by student ID
router.get('/byStudentId/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId })
      .populate('institutionId')
      .populate('batchId')
      .populate({
        path: 'enrolledCourses.courseId',
        populate: {
          path: 'batchId'
        }
      })
      .populate('enrolledCourses.startingMonthId')
      .populate('enrolledCourses.endingMonthId');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create student
router.post('/', async (req, res) => {
  try {
    // Generate student ID automatically
    const studentCount = await Student.countDocuments();
    const studentId = `STU${String(studentCount + 1).padStart(4, '0')}`;
    
    const studentData = {
      ...req.body,
      studentId,
      updatedAt: new Date()
    };
    
    const student = new Student(studentData);
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
