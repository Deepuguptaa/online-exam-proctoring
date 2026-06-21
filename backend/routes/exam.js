const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createExam,
  getAllExams,
  addQuestion,
  getExamWithQuestions,
  submitExam
} = require('../controllers/examController');

router.post('/', protect, adminOnly, createExam);
router.get('/', protect, getAllExams);
router.post('/:examId/questions', protect, adminOnly, addQuestion);
router.get('/:examId', protect, getExamWithQuestions);
router.post('/:examId/submit', protect, submitExam);

module.exports = router;