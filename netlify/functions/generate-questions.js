import Groq from 'groq-sdk';
import busboy from 'busboy';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const cleanAndParseJSON = (text) => {
  const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanText);
};

const parseMultipart = (event) => {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = {};
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];

    const bb = busboy({ headers: { 'content-type': contentType } });

    bb.on('file', (name, file, info) => {
      let data = '';
      file.on('data', (chunk) => { data += chunk.toString(); });
      file.on('end', () => { files[name] = data; });
    });

    bb.on('field', (name, val) => { fields[name] = val; });

    bb.on('finish', () => resolve({ fields, files }));
    bb.on('error', reject);

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body);
    bb.end(body);
  });
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '' };
  }

  try {
    const { fields, files } = await parseMultipart(event);
    const jobDescription = files.jobDescription || '';
    const resume = files.resume || null;
    const options = JSON.parse(fields.options);
    const company = fields.company || null;
    const position = fields.position || null;

    const technicalCount = Math.round(options.questionCount * (options.technicalQuestionRatio / 100));
    const behavioralCount = options.questionCount - technicalCount;

    const prompt = `As an expert interviewer, generate ${options.questionCount} relevant interview questions based on this job description:

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
    const questions = cleanAndParseJSON(text);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions }),
    };
  } catch (error) {
    console.error('Error generating questions:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to generate questions' }),
    };
  }
};
