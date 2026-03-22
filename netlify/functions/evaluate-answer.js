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
    const { question, answer, type, expectedAnswer } = JSON.parse(event.body);

    const prompt = `As an expert interviewer, evaluate this ${type} answer for the following interview question:

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
    const evaluation = cleanAndParseJSON(text);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluation),
    };
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to evaluate answer' }),
    };
  }
};
