import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chmod } from 'fs/promises';

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    await chmod(uploadsDir, 0o755);
  }
} catch (error) {
  console.error('Error setting up uploads directory:', error);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Initialize Groq API
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Helper function to read file content
const readFileContent = (filePath) => {
  return fs.readFileSync(filePath, { encoding: 'utf-8' });
};

// Helper function to clean and parse JSON responses
const cleanAndParseJSON = (text) => {
  try {
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (parseError) {
    console.error('Raw response:', text);
    throw new Error('Failed to parse AI response');
  }
};

// Generate interview questions using Groq
const generateQuestionsWithAI = async (jobDescription, resume = null, options, company = null, position = null) => {
  try {
    const technicalCount = Math.round(options.questionCount * (options.technicalQuestionRatio / 100));
    const behavioralCount = options.questionCount - technicalCount;

    let prompt = `As an expert interviewer, generate ${options.questionCount} relevant interview questions based on this job description:

${jobDescription}

${resume ? `\nConsider this candidate's resume for more targeted questions:\n${resume}` : ''}
${company ? `\nTarget Company: ${company}\nTailor the questions to reflect ${company}'s known interview style, culture, and technical expectations. Include questions that ${company} is known to ask in their interviews.` : ''}
${position ? `\nTarget Position: ${position}\nFocus questions on skills and competencies specifically relevant to a ${position} role.` : ''}

Generate questions with the following specifications:
- Difficulty level: ${options.difficulty}
- ${technicalCount} technical questions that require code solutions
- ${behavioralCount} behavioral/experience questions that require voice responses

Important: Return ONLY the JSON array without any markdown formatting or code blocks.

Format the response exactly like this:
[{
  "id": number,
  "text": "question text",
  "type": "voice" or "code",
  "difficulty": "${options.difficulty}",
  "expectedAnswer": "example solution for code questions"
}]`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });

    const text = chatCompletion.choices[0]?.message?.content || '';
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error('Error in generateQuestionsWithAI:', error);
    throw error;
  }
};

// ============================================================
//  ROUTE 1: Generate Questions (WORKING)
// ============================================================
app.post('/api/generate-questions', upload.fields([
  { name: 'jobDescription', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    const jobDescriptionFile = req.files.jobDescription[0];
    const resumeFile = req.files.resume?.[0];
    const options = JSON.parse(req.body.options);
    const company = req.body.company || null;
    const position = req.body.position || null;

    const jobDescription = readFileContent(jobDescriptionFile.path);
    const resume = resumeFile ? readFileContent(resumeFile.path) : null;

    const questions = await generateQuestionsWithAI(jobDescription, resume, options, company, position);

    // Clean up uploaded files
    fs.unlinkSync(jobDescriptionFile.path);
    if (resumeFile) {
      fs.unlinkSync(resumeFile.path);
    }

    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// Evaluate answer using Groq
const evaluateAnswerWithAI = async (question, answer, type, expectedAnswer = null) => {
  try {
    let prompt = `As an expert interviewer, evaluate this ${type} answer for the following interview question:

Question: ${question}

Answer: ${answer}

${type === 'code' ? `Expected solution: ${expectedAnswer}` : ''}

Provide a detailed evaluation in JSON format (without markdown code blocks):
{
  "score": (number between 0-100),
  "feedback": "detailed feedback explaining strengths and areas for improvement",
  "recommendedAnswer": "an example of a strong answer"
}

Important: Return ONLY the JSON object without any markdown formatting or code blocks.

For ${type} answers, evaluate:
${type === 'code' ? `
- Correctness
- Efficiency
- Code style
- Error handling` : `
- Relevance
- Structure
- Specific examples
- Communication clarity`}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });

    const text = chatCompletion.choices[0]?.message?.content || '';
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error('Error in evaluateAnswerWithAI:', error);
    throw error;
  }
};

// Generate learning path using Groq
const generateLearningPathWithAI = async (questions, answers, jobDescription) => {
  try {
    const performanceAnalysis = answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      return {
        questionType: question?.type,
        score: answer.evaluation?.score || 0,
        feedback: answer.evaluation?.feedback || ''
      };
    });

    let prompt = `As a technical career mentor, create a detailed learning path based on this interview performance:

Job Description:
${jobDescription}

Performance Analysis:
${JSON.stringify(performanceAnalysis, null, 2)}

Create a comprehensive learning path that includes:

1. CURRENT SKILL LEVEL
- Analyze current technical proficiency
- Identify strengths and weaknesses
- Overall skill assessment

2. LEARNING OBJECTIVES
- Short-term goals (1-2 months)
- Medium-term goals (3-6 months)
- Long-term goals (6-12 months)

3. RECOMMENDED RESOURCES
- Online courses (with specific platform recommendations)
- Books and documentation
- Practice platforms
- Project ideas

4. DETAILED STUDY PLAN
- Week-by-week breakdown for the first month
- Monthly milestones
- Practical exercises and projects

5. PROGRESS TRACKING
- Key milestones to track progress
- Suggested practice assessments
- Interview preparation checkpoints

Format the response in Markdown for better readability.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });

    return chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating learning path:', error);
    throw error;
  }
};

// ============================================================
//  ROUTE 2: Evaluate Answer
// ============================================================
app.post('/api/evaluate-answer', async (req, res) => {
  try {
    const { question, answer, type, expectedAnswer } = req.body;
    const evaluation = await evaluateAnswerWithAI(question, answer, type, expectedAnswer);
    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({
      error: 'Failed to evaluate answer',
      details: error.message,
    });
  }
});

// ============================================================
//  ROUTE 3: Generate Preparation Roadmap
// ============================================================
app.post('/api/generate-preparation', async (req, res) => {
  try {
    const { role, skills, level, timeframe, additionalNotes } = req.body;

    const prompt = `You are an expert career coach and interview preparation specialist. Create a detailed, structured interview preparation roadmap based on the following:

Role: ${role}
Key Skills: ${skills}
Experience Level: ${level}
Time Until Interview: ${timeframe}
${additionalNotes ? `Additional Context: ${additionalNotes}` : ''}

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "overview": "A 2-3 sentence summary of the preparation strategy",
  "topics": [
    {
      "name": "Topic name",
      "priority": "high" or "medium" or "low",
      "description": "What to study and why it matters for this role",
      "resources": ["Specific resource 1", "Specific resource 2"],
      "estimatedHours": number
    }
  ],
  "weeklyPlan": [
    {
      "week": 1,
      "focus": "Main focus area for this week",
      "tasks": ["Specific task 1", "Specific task 2", "Specific task 3"]
    }
  ],
  "tips": ["Practical interview tip 1", "Practical interview tip 2"]
}

Generate 5-8 topics, a weekly plan that fits the timeframe "${timeframe}", and 5-6 actionable tips. Tailor everything specifically to the ${level} level and the ${role} role.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096,
    });

    const text = chatCompletion.choices[0]?.message?.content || '';
    const roadmap = cleanAndParseJSON(text);
    res.json({ roadmap });
  } catch (error) {
    console.error('Error generating preparation roadmap:', error);
    res.status(500).json({ error: 'Failed to generate preparation roadmap' });
  }
});

// ============================================================
//  ROUTE 4: Generate Learning Path
// ============================================================
app.post('/api/generate-learning-path', async (req, res) => {
  try {
    const { questions, answers, jobDescription } = req.body;
    const learningPath = await generateLearningPathWithAI(questions, answers, jobDescription);
    res.json({ learningPath });
  } catch (error) {
    console.error('Error generating learning path:', error);
    res.status(500).json({ error: 'Failed to generate learning path' });
  }
});

// Set timeout to 30 minutes
app.use((req, res, next) => {
  res.setTimeout(1800000, () => {
    console.log('Request has timed out.');
    res.status(408).send('Request has timed out');
  });
  next();
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('');
  console.log('=== INTERVIEWPRO AI - v1.0 ===');
  console.log('');
  console.log('  ENDPOINTS:');
  console.log('    POST /api/generate-questions');
  console.log('    POST /api/evaluate-answer');
  console.log('    POST /api/generate-preparation');
  console.log('    POST /api/generate-learning-path');
  console.log('');
});
server.timeout = 1800000;

export default app;
