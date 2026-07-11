const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/generate-questions', protect, adminOnly, async (req, res) => {
  try {
    const { subject, numQuestions, difficulty } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: `Generate exactly ${numQuestions} multiple choice questions for subject: "${subject}". Difficulty: ${difficulty}.
Return ONLY a valid JSON array, no extra text, no markdown, no explanation.
Each object must have:
- "questionText": string
- "options": array of exactly 4 strings
- "correctAnswer": number (0-3, index of correct option)
- "marks": number (10)

Example: [{"questionText":"What is...","options":["A","B","C","D"],"correctAnswer":0,"marks":10}]`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API error');
    }

    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(clean);

    res.json({ questions });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'AI se questions generate nahi hue', error: error.message });
  }
});

module.exports = router;