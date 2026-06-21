import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data);
    } catch (err) {
      console.error(err);
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
        <h1 className="text-xl font-bold">ExamPro</h1>
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

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Available Exams</h2>
        <p className="text-gray-500 mb-6">Click on any exam to start</p>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No exams available right now. Check back later!
          </div>
        ) : (
          <div className="grid gap-4">
            {exams.map(exam => (
              <div key={exam._id} className="bg-white rounded-xl shadow p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{exam.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{exam.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>⏱ {exam.duration} mins</span>
                    <span>📝 {exam.totalMarks} marks</span>
                    <span>✅ Pass: {exam.passingMarks} marks</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/exam/${exam._id}`)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap"
                >
                  Start Exam →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;