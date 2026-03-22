import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const cleanAndParseJSON = (text) => {
  const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanText);
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '' };
  }

  try {
    const { role, skills, level, timeframe, additionalNotes } = JSON.parse(event.body);

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

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ roadmap }),
    };
  } catch (error) {
    console.error('Error generating preparation roadmap:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to generate preparation roadmap' }),
    };
  }
};
