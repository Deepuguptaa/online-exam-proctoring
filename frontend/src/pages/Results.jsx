import { useLocation, useNavigate } from 'react-router-dom';

function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate('/dashboard');
    return null;
  }

  const { score, totalMarks, passed, submission } = state;
  const percentage = Math.round((score / totalMarks) * 100);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">

        {/* Result Icon */}
        <div className={`text-6xl mb-4`}>
          {passed ? '🎉' : '😔'}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          {passed ? 'Congratulations!' : 'Better Luck Next Time!'}
        </h1>
        <p className="text-gray-500 mb-6">
          {passed ? 'You passed the exam!' : 'You did not pass this time.'}
        </p>

        {/* Score Circle */}
        <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center mx-auto mb-6 border-8
          ${passed ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50'}`}>
          <span className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>
            {percentage}%
          </span>
          <span className="text-xs text-gray-500">Score</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-blue-600">{score}</p>
            <p className="text-xs text-gray-500">Your Score</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-gray-700">{totalMarks}</p>
            <p className="text-xs text-gray-500">Total Marks</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>
              {passed ? 'PASS' : 'FAIL'}
            </p>
            <p className="text-xs text-gray-500">Result</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

export default Results;