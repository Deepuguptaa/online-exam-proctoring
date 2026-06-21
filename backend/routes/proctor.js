const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ProctorLog = require('../models/ProctorLog');

// Log a violation
router.post('/:examId/log', protect, async (req, res) => {
  try {
    const { type } = req.body;
    let log = await ProctorLog.findOne({
      exam: req.params.examId,
      student: req.user.id
    });

    if (!log) {
      log = await ProctorLog.create({
        exam: req.params.examId,
        student: req.user.id,
        violations: []
      });
    }

    log.violations.push({ type });
    await log.save();

    res.json({ message: 'Violation logged', log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get proctor report (Admin)
router.get('/:examId/report', protect, async (req, res) => {
  try {
    const logs = await ProctorLog.find({ exam: req.params.examId })
      .populate('student', 'name email');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;