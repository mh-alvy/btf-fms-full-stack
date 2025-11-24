const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { generateInvoiceNumber } = require('../utils/helpers');

// Get all payments
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Filter for payments with discounts
    if (req.query.hasDiscount === 'true') {
      query.discountAmount = { $gt: 0 };
    }
    
    const payments = await Payment.find(query)
      .populate('studentId')
      .populate({
        path: 'months',
        populate: {
          path: 'courseId',
          populate: {
            path: 'batchId'
          }
        }
      })
      .populate({
        path: 'monthPayments.monthId',
        populate: {
          path: 'courseId',
          populate: {
            path: 'batchId'
          }
        }
      });
      
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate invoice number
router.get('/generate-invoice', async (req, res) => {
  try {
    const count = await Payment.countDocuments();
    const invoiceNumber = `INV${String(count + 1).padStart(6, '0')}`;
    res.json({ invoiceNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('studentId').populate('months').populate('monthPayments.monthId');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get paid months for a specific student
router.get('/student/:studentId/paid-months', async (req, res) => {
  try {
    const payments = await Payment.find({ 
      studentId: req.params.studentId 
    }).populate('months').populate('monthPayments.monthId');
    
    // Extract all paid month IDs
    const paidMonthIds = new Set();
    
    payments.forEach(payment => {
      // Check legacy months field
      if (payment.months && payment.months.length > 0) {
        payment.months.forEach(month => {
          if (month && month._id) {
            paidMonthIds.add(month._id.toString());
          }
        });
      }
      
      // Check monthPayments field
      if (payment.monthPayments && payment.monthPayments.length > 0) {
        payment.monthPayments.forEach(monthPayment => {
          if (monthPayment.monthId && monthPayment.monthId._id) {
            paidMonthIds.add(monthPayment.monthId._id.toString());
          }
        });
      }
    });
    
    res.json({
      success: true,
      paidMonthIds: Array.from(paidMonthIds),
      totalPayments: payments.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payment
router.post('/', async (req, res) => {
  try {
    // Generate invoice number if not provided
    if (!req.body.invoiceNumber) {
      req.body.invoiceNumber = await generateInvoiceNumber();
    }
    
    const payment = new Payment(req.body);
    const newPayment = await payment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
