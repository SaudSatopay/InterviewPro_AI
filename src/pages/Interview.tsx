import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Code2, Send, Sparkles, SkipForward, CheckCircle2,
  XCircle, MessageSquare, Loader2, Timer, Flag, AlertCircle
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import { evaluateAnswer } from '../services/aiService';
import VoiceVisualizer from '../components/VoiceVisualizer';

const Interview: React.FC = () => {
  const navigate = useNavigate();
  const {
    interviewData,
    addAnswer,
    setCurrentQuestionIndex,
    completeInterview,
  } = useInterview();

  const { questions, currentQuestionIndex, answers } = interviewData;
  const currentQuestion = questions[currentQuestionIndex];

  const [answerText, setAnswerText] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const hasSpeechSupport = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize speech recognition
  useEffect(() => {
    if (!hasSpeechSupport) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const text = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setTranscript(text);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  // Reset transcript when navigating questions
  useEffect(() => {
    setTranscript('');
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
    }
  }, [currentQuestionIndex]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch {}
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Redirect if no questions
  useEffect(() => {
    if (questions.length === 0) {
      navigate('/');
    }
  }, [questions, navigate]);

  // Timer countdown
  useEffect(() => {
    setTimeLeft(120);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft === 0) {
      if (isListening) stopListening();
      const text = answerText.trim() || transcript.trim();
      if (text) handleSubmit();
    }
  }, [timeLeft]);

  // Helper: get answer status for a question index
  const getStatus = (idx: number) => {
    const answer = answers.find(a => a.questionId === questions[idx]?.id);
    if (!answer) return 'pending';
    if (answer.text === '(Skipped)') return 'skipped';
    return 'answered';
  };

  const isAnswered = (idx: number) => getStatus(idx) !== 'pending';

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || isSubmitting) return;

    // Stop listening if recording
    if (isListening) stopListening();

    // Use transcript for voice questions if no typed text
    const finalAnswer = currentQuestion.type === 'voice'
      ? (answerText.trim() || transcript.trim() || '(No answer provided)')
      : (answerText || '(No answer provided)');

    setIsSubmitting(true);

    let evaluation;
    try {
      evaluation = await evaluateAnswer(
        currentQuestion.text,
        finalAnswer,
        currentQuestion.type,
        currentQuestion.expectedAnswer
      );
    } catch (err) {
      console.error('Evaluation failed:', err);
      evaluation = {
        score: 0,
        feedback: 'AI evaluation failed. Your answer was saved but could not be scored.',
        recommendedAnswer: '',
      };
    }

    addAnswer({
      questionId: currentQuestion.id,
      text: finalAnswer,
      evaluation,
    });

    setIsSubmitting(false);
    setAnswerText('');
    setTranscript('');

    // Auto-advance to next unanswered question, or stay if last
    const nextIdx = findNextUnanswered(currentQuestionIndex);
    if (nextIdx !== null) {
      setCurrentQuestionIndex(nextIdx);
    }
  }, [currentQuestion, answerText, transcript, isSubmitting, isListening, addAnswer, currentQuestionIndex]);

  const handleSkip = () => {
    addAnswer({
      questionId: currentQuestion.id,
      text: '(Skipped)',
      evaluation: {
        score: 0,
        feedback: 'Question was skipped.',
        recommendedAnswer: '',
      },
    });
    setAnswerText('');

    const nextIdx = findNextUnanswered(currentQuestionIndex);
    if (nextIdx !== null) {
      setCurrentQuestionIndex(nextIdx);
    }
  };

  // Find next unanswered question after current index (wraps around)
  const findNextUnanswered = (fromIdx: number): number | null => {
    // Check forward from current
    for (let i = fromIdx + 1; i < questions.length; i++) {
      if (!isAnsweredById(questions[i].id)) return i;
    }
    // Wrap around
    for (let i = 0; i < fromIdx; i++) {
      if (!isAnsweredById(questions[i].id)) return i;
    }
    return null;
  };

  const isAnsweredById = (qId: number): boolean => {
    // Check both existing answers AND the one we just added (answers state may lag)
    return answers.some(a => a.questionId === qId);
  };

  const handleNavigate = (idx: number) => {
    if (isListening) stopListening();
    setAnswerText('');
    setCurrentQuestionIndex(idx);
  };

  const handleFinish = () => {
    const validAnswers = answers.filter(a => a.text !== '(Skipped)' && a.evaluation);
    const totalScore = validAnswers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0);
    const averageScore = validAnswers.length > 0 ? Math.round(totalScore / validAnswers.length) : 0;

    const topics = new Set<string>();
    answers.forEach(a => {
      if ((a.evaluation?.score || 0) < 70) {
        const q = questions.find(q => q.id === a.questionId);
        if (q?.type === 'code') {
          topics.add('Technical coding skills');
          topics.add('Algorithm optimization');
        } else {
          topics.add('Communication skills');
          topics.add('Behavioral question preparation');
        }
      }
    });

    completeInterview(averageScore, Array.from(topics), averageScore >= 70);
    navigate('/report');
  };

  if (!currentQuestion) return null;

  const totalAnswered = answers.filter(a => a.text !== '(Skipped)').length;
  const totalSkipped = answers.filter(a => a.text === '(Skipped)').length;
  const allDone = answers.length >= questions.length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerColor = timeLeft <= 30 ? 'text-red-400' : timeLeft <= 60 ? 'text-yellow-400' : 'text-neon-cyan';

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex gap-5">

        {/* Left: Question Index */}
        <div className="w-56 flex-shrink-0 hidden md:block">
          <div className="glass-card p-4 sticky top-24">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Questions
            </h3>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {questions.map((q, idx) => {
                const status = getStatus(idx);
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => handleNavigate(idx)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-all
                      ${isCurrent
                        ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-white'
                        : 'hover:bg-white/[0.03] border border-transparent text-slate-400 hover:text-slate-300'
                      }`}
                  >
                    {/* Status icon */}
                    {status === 'answered' ? (
                      <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                    ) : status === 'skipped' ? (
                      <XCircle size={14} className="text-red-400 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-neon-cyan flex-shrink-0 shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />
                    )}

                    {/* Label */}
                    <span className="truncate">
                      <span className="font-mono text-[10px] text-slate-600 mr-1">Q{idx + 1}</span>
                      {q.text.slice(0, 40)}{q.text.length > 40 ? '…' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-green-400">
                  <CheckCircle2 size={11} /> Answered
                </span>
                <span className="text-slate-400 font-mono">{totalAnswered}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-red-400">
                  <XCircle size={11} /> Skipped
                </span>
                <span className="text-slate-400 font-mono">{totalSkipped}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  Remaining
                </span>
                <span className="text-slate-400 font-mono">{questions.length - answers.length}</span>
              </div>
            </div>

            {/* Finish button */}
            {allDone && (
              <button
                onClick={handleFinish}
                className="btn-neon w-full mt-4 flex items-center justify-center gap-2 text-xs py-2.5"
              >
                <Flag size={13} />
                View Report
              </button>
            )}
          </div>
        </div>

        {/* Right: Question + Answer */}
        <div className="flex-1 min-w-0">

          {/* Mobile question index (horizontal scroll) */}
          <div className="md:hidden flex items-center gap-1.5 mb-4 overflow-x-auto pb-2 px-1">
            {questions.map((q, idx) => {
              const status = getStatus(idx);
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => handleNavigate(idx)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                    ${status === 'answered'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : status === 'skipped'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : isCurrent
                          ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                          : 'bg-dark-700 text-slate-500 border border-white/5'
                    }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Timer + type badge */}
          <div className="glass-card p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className={`badge ${currentQuestion.type === 'code' ? 'badge-purple' : 'badge-cyan'}`}>
                  {currentQuestion.type === 'code' ? <Code2 size={11} className="mr-1" /> : <Mic size={11} className="mr-1" />}
                  {currentQuestion.type === 'code' ? 'Code' : 'Voice'}
                </div>
                {isAnswered(currentQuestionIndex) && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    getStatus(currentQuestionIndex) === 'answered'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {getStatus(currentQuestionIndex) === 'answered' ? 'Answered' : 'Skipped'}
                  </span>
                )}
              </div>

              <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timerColor}`}>
                <Timer size={18} />
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-dark-600 rounded-full overflow-hidden mt-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-500"
                style={{ width: `${(answers.length / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="glass-card p-6 sm:p-8 mb-4">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={18} className="text-neon-cyan" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-medium">Question</p>
                <h2 className="text-lg text-white font-medium leading-relaxed">
                  {currentQuestion.text}
                </h2>
              </div>
            </div>

            {/* Answer area */}
            {!isAnswered(currentQuestionIndex) ? (
              <div className="mt-6">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {currentQuestion.type === 'code' ? 'Your Code' : 'Your Answer'}
                </label>

                {currentQuestion.type === 'code' ? (
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Write your code solution here..."
                    rows={10}
                    className="w-full p-4 rounded-xl bg-dark-800 border border-white/5 text-slate-200
                      font-mono text-sm leading-relaxed resize-none outline-none
                      focus:border-neon-purple/40 focus:shadow-[0_0_15px_rgba(176,38,255,0.1)]
                      transition-all placeholder:text-slate-600"
                  />
                ) : (
                  <div className="space-y-3">
                    {/* Voice recording section */}
                    {hasSpeechSupport && (
                      <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-dark-800/50 border border-white/5">
                        {/* Mic toggle button */}
                        <button
                          onClick={toggleListening}
                          type="button"
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all
                            ${isListening
                              ? 'bg-red-500/20 border-2 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse'
                              : 'bg-neon-cyan/10 border-2 border-neon-cyan/30 hover:bg-neon-cyan/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            }`}
                        >
                          {isListening ? (
                            <MicOff size={24} className="text-red-400" />
                          ) : (
                            <Mic size={24} className="text-neon-cyan" />
                          )}
                        </button>

                        <span className={`text-xs font-medium ${isListening ? 'text-red-400' : 'text-slate-500'}`}>
                          {isListening ? 'Listening... Click to stop' : 'Click to start recording'}
                        </span>

                        {/* Visualizer */}
                        <VoiceVisualizer isActive={isListening} />

                        {/* Live transcript */}
                        {(transcript || isListening) && (
                          <div className="w-full p-3 rounded-lg bg-dark-700/50 border border-white/5 min-h-[60px]">
                            <p className="text-xs text-slate-500 mb-1">Transcript:</p>
                            <p className={`text-sm leading-relaxed ${transcript ? 'text-slate-300' : 'text-slate-600 italic'}`}>
                              {transcript || 'Your speech will appear here...'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Unsupported browser note */}
                    {!hasSpeechSupport && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                        <AlertCircle size={14} className="text-yellow-400 flex-shrink-0" />
                        <p className="text-xs text-yellow-400/80">
                          Voice recording is not supported in this browser. Please use Chrome or Edge, or type your answer below.
                        </p>
                      </div>
                    )}

                    {/* Text fallback / alternative */}
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">
                        {hasSpeechSupport ? 'Or type your answer' : 'Type your answer'}
                      </p>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your answer here..."
                        rows={3}
                        className="w-full p-3 rounded-xl bg-dark-800 border border-white/5 text-slate-200
                          text-sm leading-relaxed resize-none outline-none
                          focus:border-neon-cyan/40 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]
                          transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={handleSkip}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                      text-slate-500 hover:text-slate-300 hover:bg-dark-600 transition-all"
                  >
                    <SkipForward size={16} />
                    Skip
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={(!answerText.trim() && !transcript.trim()) || isSubmitting}
                    className="btn-neon flex items-center gap-2 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Answer
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Show saved answer for already-answered questions */
              <div className="mt-6 p-4 rounded-xl bg-dark-700/50 border border-white/5">
                {getStatus(currentQuestionIndex) === 'answered' ? (() => {
                  const ans = answers.find(a => a.questionId === currentQuestion.id);
                  const score = ans?.evaluation?.score || 0;
                  const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-green-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> Your Answer
                        </p>
                        {score > 0 && (
                          <span className={`text-sm font-bold font-mono ${scoreColor}`}>{score}/100</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {ans?.text}
                      </p>
                      {ans?.evaluation?.feedback && ans.evaluation.score > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <p className="text-xs text-slate-500 mb-1">AI Feedback:</p>
                          <p className="text-xs text-slate-400 leading-relaxed">{ans.evaluation.feedback}</p>
                        </div>
                      )}
                    </>
                  );
                })() : (
                  <p className="text-sm text-red-400 italic flex items-center gap-2">
                    <XCircle size={14} /> This question was skipped
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Mobile: finish button */}
          {allDone && (
            <div className="md:hidden text-center">
              <button
                onClick={handleFinish}
                className="btn-neon inline-flex items-center gap-2 text-sm"
              >
                <Sparkles size={16} />
                View Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;
