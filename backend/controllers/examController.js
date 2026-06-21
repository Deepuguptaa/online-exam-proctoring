const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Submission = require('../models/Submission');

// Create Exam (Admin only)
exports.createExam = async (req, res) => {
  try {
    const { title, description, duration, totalMarks, passingMarks } = req.body;
    const exam = await Exam.create({
      title,
      description,
      duration,
      totalMarks,
      passingMarks,
      createdBy: req.user.id
    });
    res.status(201).json({ message: 'Exam created successfully', exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Exams
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find({ isActive: true });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Question to Exam (Admin only)
exports.addQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer, marks } = req.body;
    const question = await Question.create({
      exam: req.params.examId,
      questionText,
      options,
      correctAnswer,
      marks
    });
    res.status(201).json({ message: 'Question added successfully', question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Exam with Questions
exports.getExamWithQuestions = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    const questions = await Question.find({ exam: req.params.examId })
      .select('-correctAnswer'); // hide correct answer from student
    res.json({ exam, questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit Exam
exports.submitExam = async (req, res) => {
  try {
    const { answers } = req.body;
    const exam = await Exam.findById(req.params.examId);
    const questions = await Question.find({ exam: req.params.examId });

    // Auto calculate score
    let score = 0;
    answers.forEach(answer => {
      const question = questions.find(q => q._id.toString() === answer.question);
      if (question && question.correctAnswer === answer.selectedAnswer) {
        score += question.marks;
      }
    });

    const passed = score >= exam.passingMarks;

    const submission = await Submission.create({
      exam: req.params.examId,
      student: req.user.id,
      answers,
      score,
      passed
    });

    res.json({
      message: 'Exam submitted successfully',
      score,
      totalMarks: exam.totalMarks,
      passed,
      submission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};