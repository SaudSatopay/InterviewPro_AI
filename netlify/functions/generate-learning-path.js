import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '' };
  }

  try {
    const { questions, answers, jobDescription } = JSON.parse(event.body);

    const performanceAnalysis = answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      return {
        questionType: question?.type,
        score: answer.evaluation?.score || 0,
        feedback: answer.evaluation?.feedback || ''
      };
    });

    const prompt = `As a technical career mentor, create a detailed learning path based on this interview performance:

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

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ learningPath: chatCompletion.choices[0]?.message?.content || '' }),
    };
  } catch (error) {
    console.error('Error generating learning path:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to generate learning path' }),
    };
  }
};
