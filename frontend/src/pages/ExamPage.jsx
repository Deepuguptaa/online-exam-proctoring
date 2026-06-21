import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [violations, setViolations] = useState([]);
  const [warningMsg, setWarningMsg] = useState('');
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchExam();
    startProctoring();
    return () => {
      clearInterval(timerRef.current);
      stopCamera();
    };
  }, []);

  const fetchExam = async () => {
    try {
      const res = await api.get(`/exams/${examId}`);
      setExam(res.data.exam);
      setQuestions(res.data.questions);
      setTimeLeft(res.data.exam.duration * 60);
      setLoading(false);
      startTimer(res.data.exam.duration * 60);
    } catch (err) {
      console.error(err);
    }
  };

  const startTimer = (seconds) => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Proctoring ──────────────────────────────────────
  const startProctoring = () => {
    // 1. Tab switch detection
    document.addEventListener('visibilitychange', handleTabSwitch);

    // 2. Fullscreen
    document.documentElement.requestFullscreen?.();
    document.addEventListener('fullscreenchange', handleFullscreenExit);

    // 3. Disable copy paste
    document.addEventListener('copy', blockEvent);
    document.addEventListener('paste', blockEvent);

    // 4. Start webcam
    startCamera();
  };

  const handleTabSwitch = () => {
    if (document.hidden) {
      logViolation('tab_switch');
      showWarning('⚠️ Tab switch detected! This has been recorded.');
    }
  };

  const handleFullscreenExit = () => {
    if (!document.fullscreenElement) {
      logViolation('fullscreen_exit');
      showWarning('⚠️ Fullscreen exit detected! Please stay in fullscreen.');
      document.documentElement.requestFullscreen?.();
    }
  };

  const blockEvent = (e) => {
    e.preventDefault();
    logViolation('copy_paste');
    showWarning('⚠️ Copy/paste is not allowed during exam!');
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      showWarning('⚠️ Camera access denied! Proctoring requires camera.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    document.removeEventListener('visibilitychange', handleTabSwitch);
    document.removeEventListener('fullscreenchange', handleFullscreenExit);
    document.removeEventListener('copy', blockEvent);
    document.removeEventListener('paste', blockEvent);
  };

  const logViolation = async (type) => {
    setViolations(prev => [...prev, type]);
    try {
      await api.post(`/proctor/${examId}/log`, { type });
    } catch (err) {
      console.error(err);
    }
  };

  const showWarning = (msg) => {
    setWarningMsg(msg);
    setTimeout(() => setWarningMsg(''), 4000);
  };
  // ────────────────────────────────────────────────────

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    stopCamera();
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
    try {
      const formattedAnswers = Object.entries(answers).map(([question, selectedAnswer]) => ({
        question,
        selectedAnswer
      }));
      const res = await api.post(`/exams/${examId}/submit`, { answers: formattedAnswers });
      navigate('/results/' + res.data.submission._id, { state: res.data });
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading exam...</p>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const timeColor = timeLeft < 60 ? 'text-red-600' : timeLeft < 300 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Warning Banner */}
      {warningMsg && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-3 font-semibold z-50 text-sm">
          {warningMsg}
        </div>
      )}

      {/* Top Bar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div>
          <h1 className="font-bold text-lg">{exam?.title}</h1>
          <p className="text-xs text-blue-200">{answeredCount}/{questions.length} answered</p>
        </div>
        <div className="flex items-center gap-6">
          {/* Violations count */}
          {violations.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
              ⚠️ {violations.length} violation{violations.length > 1 ? 's' : ''}
            </span>
          )}
          {/* Timer */}
          <div className={`text-2xl font-bold bg-white rounded-lg px-4 py-1 ${timeColor}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          {/* Webcam */}
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-20 h-16 rounded-lg object-cover border-2 border-white"
          />
        </div>
      </nav>

      {/* Questions */}
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {questions.map((q, idx) => (
          <div key={q._id} className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-gray-800">
                Q{idx + 1}. {q.questionText}
              </h3>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full whitespace-nowrap ml-4">
                {q.marks} mark{q.marks > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {q.options.map((option, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => handleAnswer(q._id, optIdx)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition font-medium text-sm
                    ${answers[q._id] === optIdx
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                >
                  {String.fromCharCode(65 + optIdx)}. {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-800">Ready to submit?</p>
            <p className="text-sm text-gray-500">
              {answeredCount}/{questions.length} questions answered
              {answeredCount < questions.length && (
                <span className="text-yellow-600"> — {questions.length - answeredCount} unanswered</span>
              )}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Exam ✓'}
          </button>
        </div>
      </div>

    </div>
  );
}

export default ExamPage;