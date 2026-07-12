import { useState } from "react";

const API_URL = "https://online-exam-proctoring-4jp0.onrender.com/api";

export default function AIQuestionGenerator({ exams, token, onQuestionAdded }) {
  const [mode, setMode] = useState(null);
  const [selectedExam, setSelectedExam] = useState("");
  const [subject, setSubject] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [savingAll, setSavingAll] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Manual form state
  const [manualForm, setManualForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    marks: 10,
  });
  const [manualLoading, setManualLoading] = useState(false);

  // --- AI Generate (Backend se) ---
  const generateWithAI = async () => {
    if (!selectedExam || !subject) {
      setErrorMsg("Exam aur Subject dono select karo!");
      return;
    }
    setAiLoading(true);
    setAiQuestions([]);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(`${API_URL}/ai/generate-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, numQuestions, difficulty }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error");
      setAiQuestions(data.questions);
    } catch (err) {
      setErrorMsg("AI se questions generate karne mein error aaya: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // --- Save All AI Questions ---
  const saveAllQuestions = async () => {
    if (!selectedExam || aiQuestions.length === 0) return;
    setSavingAll(true);
    setErrorMsg("");
    try {
      for (const q of aiQuestions) {
        await fetch(`${API_URL}/exams/${selectedExam}/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(q),
        });
      }
      setSuccessMsg(`✅ ${aiQuestions.length} questions successfully save ho gaye!`);
      setAiQuestions([]);
      onQuestionAdded && onQuestionAdded();
    } catch (err) {
      setErrorMsg("Questions save karne mein error aaya.");
    } finally {
      setSavingAll(false);
    }
  };

  // --- Manual Submit ---
  const handleManualSubmit = async () => {
    if (!selectedExam || !manualForm.questionText || manualForm.options.some(o => !o)) {
      setErrorMsg("Sab fields bharo!");
      return;
    }
    setManualLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/exams/${selectedExam}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(manualForm),
      });
      if (res.ok) {
        setSuccessMsg("✅ Question successfully add ho gaya!");
        setManualForm({ questionText: "", options: ["", "", "", ""], correctAnswer: 0, marks: 10 });
        onQuestionAdded && onQuestionAdded();
      } else {
        setErrorMsg("Question save nahi hua.");
      }
    } catch {
      setErrorMsg("Server error. Backend chal raha hai?");
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 700, margin: "0 auto", padding: 24 }}>

      {/* Header */}
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
        ➕ Add Questions
      </h2>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Manual likhkar daalo <strong>ya</strong> AI se automatically generate karwao
      </p>

      {/* Exam Select */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Exam Select Karo *</label>
        <select
          value={selectedExam}
          onChange={e => setSelectedExam(e.target.value)}
          style={inputStyle}
        >
          <option value="">-- Exam chunao --</option>
          {exams.map(ex => (
            <option key={ex._id} value={ex._id}>{ex.title}</option>
          ))}
        </select>
      </div>

      {/* Mode Buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <button
          onClick={() => { setMode("manual"); setSuccessMsg(""); setErrorMsg(""); }}
          style={{
            ...modeBtn,
            background: mode === "manual" ? "#3b82f6" : "#f1f5f9",
            color: mode === "manual" ? "#fff" : "#334155",
          }}
        >
          ✍️ Manual Question
        </button>
        <button
          onClick={() => { setMode("ai"); setSuccessMsg(""); setErrorMsg(""); }}
          style={{
            ...modeBtn,
            background: mode === "ai" ? "#8b5cf6" : "#f1f5f9",
            color: mode === "ai" ? "#fff" : "#334155",
          }}
        >
          🤖 AI Se Generate Karo
        </button>
      </div>

      {/* Success / Error */}
      {successMsg && (
        <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: "#166534" }}>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: "#991b1b" }}>
          {errorMsg}
        </div>
      )}

      {/* ---- MANUAL MODE ---- */}
      {mode === "manual" && (
        <div style={cardStyle}>
          <h3 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>✍️ Manual Question Add Karo</h3>

          <label style={labelStyle}>Question *</label>
          <textarea
            value={manualForm.questionText}
            onChange={e => setManualForm({ ...manualForm, questionText: e.target.value })}
            placeholder="Question likhao..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />

          {["Option 1", "Option 2", "Option 3", "Option 4"].map((label, i) => (
            <div key={i}>
              <label style={labelStyle}>{label} *</label>
              <input
                value={manualForm.options[i]}
                onChange={e => {
                  const opts = [...manualForm.options];
                  opts[i] = e.target.value;
                  setManualForm({ ...manualForm, options: opts });
                }}
                placeholder={label}
                style={inputStyle}
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Correct Answer *</label>
              <select
                value={manualForm.correctAnswer}
                onChange={e => setManualForm({ ...manualForm, correctAnswer: Number(e.target.value) })}
                style={inputStyle}
              >
                {["Option 1", "Option 2", "Option 3", "Option 4"].map((o, i) => (
                  <option key={i} value={i}>{o}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Marks *</label>
              <input
                type="number"
                value={manualForm.marks}
                onChange={e => setManualForm({ ...manualForm, marks: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={manualLoading}
            style={{ ...primaryBtn, background: "#3b82f6", marginTop: 8 }}
          >
            {manualLoading ? "Save ho raha hai..." : "✅ Question Add Karo"}
          </button>
        </div>
      )}

      {/* ---- AI MODE ---- */}
      {mode === "ai" && (
        <div style={cardStyle}>
          <h3 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>🤖 AI Se Questions Generate Karo</h3>

          <label style={labelStyle}>Subject / Topic *</label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Python, JavaScript, React, Math, Science..."
            style={inputStyle}
          />

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Kitne Questions?</label>
              <select value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} style={inputStyle}>
                {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Questions</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={inputStyle}>
                <option value="easy">Easy 🟢</option>
                <option value="medium">Medium 🟡</option>
                <option value="hard">Hard 🔴</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateWithAI}
            disabled={aiLoading}
            style={{ ...primaryBtn, background: "#8b5cf6", marginTop: 8 }}
          >
            {aiLoading ? "⏳ AI generate kar raha hai..." : "🚀 AI Se Generate Karo"}
          </button>

          {/* AI Generated Questions Preview */}
          {aiQuestions.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h4 style={{ fontWeight: 600, color: "#1e293b" }}>
                  ✨ {aiQuestions.length} Questions Generate Ho Gaye!
                </h4>
                <button
                  onClick={saveAllQuestions}
                  disabled={savingAll}
                  style={{ ...primaryBtn, background: "#16a34a", padding: "8px 20px", fontSize: 14, width: "auto" }}
                >
                  {savingAll ? "Save ho raha hai..." : "💾 Sab Save Karo"}
                </button>
              </div>

              {aiQuestions.map((q, i) => (
                <div key={i} style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 12
                }}>
                  <p style={{ fontWeight: 600, color: "#1e293b", marginBottom: 10 }}>
                    Q{i + 1}. {q.questionText}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {q.options.map((opt, j) => (
                      <div key={j} style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 14,
                        background: j === q.correctAnswer ? "#dcfce7" : "#f1f5f9",
                        color: j === q.correctAnswer ? "#166534" : "#475569",
                        border: j === q.correctAnswer ? "1px solid #86efac" : "1px solid #e2e8f0",
                        fontWeight: j === q.correctAnswer ? 600 : 400,
                      }}>
                        {j === q.correctAnswer ? "✅ " : ""}{opt}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Marks: {q.marks}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, marginTop: 14 };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#1e293b", boxSizing: "border-box", outline: "none" };
const cardStyle = { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24, marginBottom: 20 };
const primaryBtn = { padding: "11px 24px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 15, color: "#fff", width: "100%" };
const modeBtn = { flex: 1, padding: "12px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 15, transition: "all 0.2s" };