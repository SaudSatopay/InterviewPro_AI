import axios from 'axios';

interface Question {
  id: number;
  text: string;
  type: 'voice' | 'code';
  expectedAnswer?: string;
}

interface InterviewOptions {
  questionCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  technicalQuestionRatio: number;
}

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

// Generate questions based on job description and optional resume
export const generateQuestions = async (
  jobDescription: string,
  resume: string | null,
  options: InterviewOptions,
  company?: string,
  position?: string
): Promise<Question[]> => {
  try {
    const formData = new FormData();
    formData.append('jobDescription', new File([jobDescription], 'jobDescription.txt', { type: 'text/plain' }));

    if (resume) {
      formData.append('resume', new File([resume], 'resume.txt', { type: 'text/plain' }));
    }

    formData.append('options', JSON.stringify(options));

    if (company) {
      formData.append('company', company);
    }
    if (position) {
      formData.append('position', position);
    }

    const response = await axios.post(`${API_URL}/api/generate-questions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 1800000,
    });

    return response.data.questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate interview questions');
  }
};

export interface EvaluationResult {
  score: number;
  feedback: string;
  recommendedAnswer: string;
}

interface Answer {
  questionId: number;
  text: string;
  evaluation?: EvaluationResult;
}

// Evaluate a single answer using AI
export const evaluateAnswer = async (
  question: string,
  answer: string,
  type: 'voice' | 'code',
  expectedAnswer?: string
): Promise<EvaluationResult> => {
  try {
    const response = await axios.post(`${API_URL}/api/evaluate-answer`, {
      question,
      answer,
      type,
      expectedAnswer,
    }, {
      timeout: 1800000,
    });

    if (!response.data) {
      throw new Error('No evaluation data received');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Evaluation API error:', error.response?.data || error.message);
    } else {
      console.error('Error evaluating answer:', error);
    }
    throw new Error('Failed to evaluate answer');
  }
};

// Generate personalized learning path based on interview performance
export const generateLearningPath = async (
  questions: Question[],
  answers: Answer[],
  jobDescription: string
): Promise<string> => {
  try {
    const response = await axios.post(`${API_URL}/api/generate-learning-path`, {
      questions,
      answers,
      jobDescription,
    }, {
      timeout: 1800000,
    });

    return response.data.learningPath;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Learning path API error:', error.response?.data || error.message);
    } else {
      console.error('Error generating learning path:', error);
    }
    throw new Error('Failed to generate learning path');
  }
};
