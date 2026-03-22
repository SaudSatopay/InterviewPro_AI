import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Question {
  id: number;
  text: string;
  type: 'voice' | 'code';
  expectedAnswer?: string;
}

interface Answer {
  questionId: number;
  text: string;
  evaluation?: {
    score: number;
    feedback: string;
    recommendedAnswer: string;
  };
}

interface InterviewData {
  jobDescription: string | null;
  resume: string | null;
  company: string;
  position: string;
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  isComplete: boolean;
  overallScore: number | null;
  recommendedTopics: string[];
  readyForInterview: boolean | null;
}

interface InterviewContextType {
  interviewData: InterviewData;
  setJobDescription: (jobDescription: string) => void;
  setResume: (resume: string | null) => void;
  setCompany: (company: string) => void;
  setPosition: (position: string) => void;
  setQuestions: (questions: Question[]) => void;
  addAnswer: (answer: Answer) => void;
  setCurrentQuestionIndex: (index: number) => void;
  completeInterview: (score: number, topics: string[], ready: boolean) => void;
  resetInterview: () => void;
}

const initialState: InterviewData = {
  jobDescription: null,
  resume: null,
  company: '',
  position: '',
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  isComplete: false,
  overallScore: null,
  recommendedTopics: [],
  readyForInterview: null,
};

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const InterviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [interviewData, setInterviewData] = useState<InterviewData>(initialState);

  const setJobDescription = (jobDescription: string) => {
    setInterviewData(prev => ({ ...prev, jobDescription }));
  };

  const setResume = (resume: string | null) => {
    setInterviewData(prev => ({ ...prev, resume }));
  };

  const setCompany = (company: string) => {
    setInterviewData(prev => ({ ...prev, company }));
  };

  const setPosition = (position: string) => {
    setInterviewData(prev => ({ ...prev, position }));
  };

  const setQuestions = (questions: Question[]) => {
    setInterviewData(prev => ({ ...prev, questions }));
  };

  const addAnswer = (answer: Answer) => {
    setInterviewData(prev => ({
      ...prev,
      answers: [...prev.answers, answer],
    }));
  };

  const setCurrentQuestionIndex = (index: number) => {
    setInterviewData(prev => ({ ...prev, currentQuestionIndex: index }));
  };

  const completeInterview = (score: number, topics: string[], ready: boolean) => {
    setInterviewData(prev => ({
      ...prev,
      isComplete: true,
      overallScore: score,
      recommendedTopics: topics,
      readyForInterview: ready,
    }));
  };

  const resetInterview = () => {
    setInterviewData(initialState);
  };

  const value = {
    interviewData,
    setJobDescription,
    setResume,
    setCompany,
    setPosition,
    setQuestions,
    addAnswer,
    setCurrentQuestionIndex,
    completeInterview,
    resetInterview,
  };

  return <InterviewContext.Provider value={value}>{children}</InterviewContext.Provider>;
};

export const useInterview = (): InterviewContextType => {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};
