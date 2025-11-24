const express = require('express');
const router = express.Router();
const Month = require('../models/Month');

// Get all months
router.get('/', async (req, res) => {
  try {
    const months = await Month.find().populate({
      path: 'courseId',
      populate: {
        path: 'batchId'
      }
    });
    res.json(months);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get month by ID
router.get('/:id', async (req, res) => {
  try {
    const month = await Month.findById(req.params.id).populate({
      path: 'courseId',
      populate: {
        path: 'batchId'
      }
    });
    if (!month) return res.status(404).json({ message: 'Month not found' });
    res.json(month);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create month
router.post('/', async (req, res) => {
  const month = new Month(req.body);
  try {
    const newMonth = await month.save();
    res.status(201).json(newMonth);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update month
router.put('/:id', async (req, res) => {
  try {
    const month = await Month.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!month) return res.status(404).json({ message: 'Month not found' });
    res.json(month);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete month
router.delete('/:id', async (req, res) => {
  try {
    const month = await Month.findByIdAndDelete(req.params.id);
    if (!month) return res.status(404).json({ message: 'Month not found' });
    res.json({ message: 'Month deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
