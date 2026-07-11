import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AIQuestionGenerator from '../components/AIQuestionGenerator';

function AdminPanel() {
  const [exams, setExams] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [examForm, setExamForm] = useState({
    title: '', description: '', duration: '', totalMarks: '', passingMarks: ''
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/exams', examForm);
      setMessage('✅ Exam created successfully!');
      setShowCreateForm(false);
      setExamForm({ title: '', description: '', duration: '', totalMarks: '', passingMarks: '' });
      fetchExams();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating exam');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">ExamPro — Admin Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">👋 {user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">

        {/* Message */}
        {message && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setShowQuestionForm(false); }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            + Create New Exam
          </button>
          <button
            onClick={() => { setShowQuestionForm(!showQuestionForm); setShowCreateForm(false); }}
            className={`px-6 py-2 rounded-lg font-semibold text-white ${showQuestionForm ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            ✍️ / 🤖 Add Question
          </button>
        </div>

        {/* Create Exam Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <h2 className="text-lg font-bold mb-4">Create New Exam</h2>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <input
                type="text"
                placeholder="Exam Title"
                value={examForm.title}
                onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={examForm.description}
                onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Duration (mins)"
                  value={examForm.duration}
                  onChange={(e) => setExamForm({ ...examForm, duration: e.target.value })}
                  required
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Total Marks"
                  value={examForm.totalMarks}
                  onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
                  required
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Passing Marks"
                  value={examForm.passingMarks}
                  onChange={(e) => setExamForm({ ...examForm, passingMarks: e.target.value })}
                  required
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Exam'}
              </button>
            </form>
          </div>
        )}

        {/* AI + Manual Question Form */}
        {showQuestionForm && (
          <div className="bg-white rounded-xl shadow mb-6">
            <AIQuestionGenerator
              exams={exams}
              token={token}
              onQuestionAdded={() => {
                setMessage('✅ Questions successfully add ho gaye!');
                fetchExams();
              }}
            />
          </div>
        )}

        {/* Exams List */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-4">All Exams ({exams.length})</h2>
          {exams.length === 0 ? (
            <p className="text-gray-500">No exams created yet. Click "Create New Exam" to start!</p>
          ) : (
            <div className="space-y-3">
              {exams.map(exam => (
                <div key={exam._id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">{exam.title}</h3>
                    <p className="text-sm text-gray-500">{exam.description}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      <span>⏱ {exam.duration} mins</span>
                      <span>📝 {exam.totalMarks} marks</span>
                      <span>✅ Pass: {exam.passingMarks}</span>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminPanel;