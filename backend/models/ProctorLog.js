const mongoose = require('mongoose');

const proctorLogSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  violations: [
    {
      type: {
        type: String,
        enum: ['tab_switch', 'face_not_detected', 'multiple_faces', 'fullscreen_exit', 'copy_paste']
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('ProctorLog', proctorLogSchema);