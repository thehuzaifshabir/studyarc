import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../lib/store';
import { MockTest, Question, TestAttempt, TestAnswer } from '../../types';
import { Button } from '../../components/ui/Button';
import { Clock, Loader2, Flag, ChevronLeft, ChevronRight, Check, AlertTriangle, LayoutGrid, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ExamInterface() {
  const { testId, attemptId } = useParams<{ testId: string, attemptId: string }>();
  const [test, setTest] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, TestAnswer>>({});
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTestData() {
      if (!testId || !attemptId || !user) return;
      try {
        // Load test details
        const testDoc = await getDoc(doc(db, 'mockTests', testId));
        if (!testDoc.exists()) throw new Error("Test not found");
        const testData = { id: testDoc.id, ...testDoc.data() } as MockTest;
        setTest(testData);

        // Load attempt
        const attemptDoc = await getDoc(doc(db, 'testAttempts', attemptId));
        if (!attemptDoc.exists()) throw new Error("Attempt not found");
        const attemptData = { id: attemptDoc.id, ...attemptDoc.data() } as TestAttempt;
        
        if (attemptData.status !== 'in_progress') {
          navigate(`/test/${testId}/result/${attemptId}`);
          return;
        }
        
        setAttempt(attemptData);

        // Load questions
        const questionsSnap = await getDocs(collection(db, 'mockTests', testId, 'questions'));
        const qs = questionsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Question[];
        setQuestions(qs);

        // Initialize answers state locally (or fetch existing from firestore if resuming)
        // For simplicity, starting fresh or assuming no previous answers stored
        const initialAnswers: Record<string, TestAnswer> = {};
        qs.forEach((q, idx) => {
          initialAnswers[q.id] = {
            id: `${attemptId}_${q.id}`,
            attemptId,
            questionId: q.id,
            selectedOptionIndex: -1,
            status: idx === 0 ? 'not_answered' : 'not_visited',
            timeSpentSeconds: 0
          };
        });
        
        // Try to fetch existing answers if returning
        const answersSnap = await getDocs(collection(db, 'testAttempts', attemptId, 'answers'));
        answersSnap.docs.forEach(doc => {
          const ans = doc.data() as TestAnswer;
          initialAnswers[ans.questionId] = { ...initialAnswers[ans.questionId], ...ans };
        });
        
        setAnswers(initialAnswers);

        // Calculate time left
        const startTime = new Date(attemptData.startTime).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const totalSeconds = testData.durationMinutes * 60;
        const remaining = Math.max(0, totalSeconds - elapsedSeconds);
        setTimeLeft(remaining);

      } catch (e) {
        console.error("Error loading test:", e);
        alert("Error loading test. Redirecting to dashboard.");
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    }
    loadTestData();
  }, [testId, attemptId, user, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || isSubmitting) return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      // Also update time spent on current question
      if (questions[currentIndex]) {
        const qId = questions[currentIndex].id;
        setAnswers(prev => ({
          ...prev,
          [qId]: {
            ...prev[qId],
            timeSpentSeconds: prev[qId].timeSpentSeconds + 1
          }
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting, currentIndex, questions]);

  const saveAnswerToDb = async (qId: string, answerData: TestAnswer) => {
    if (!attemptId) return;
    try {
      await setDoc(doc(db, 'testAttempts', attemptId, 'answers', answerData.id), answerData);
      await updateDoc(doc(db, 'testAttempts', attemptId), {
        lastActivityTime: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to save answer to DB", e);
    }
  };

  const updateQuestionStatus = (newStatus: TestAnswer['status'], newOptionIndex?: number) => {
    const qId = questions[currentIndex].id;
    const currentAns = answers[qId];
    
    const updatedAns = {
      ...currentAns,
      status: newStatus,
      selectedOptionIndex: newOptionIndex !== undefined ? newOptionIndex : currentAns.selectedOptionIndex
    };

    setAnswers(prev => ({
      ...prev,
      [qId]: updatedAns
    }));

    saveAnswerToDb(qId, updatedAns);
  };

  const handleSelectOption = (index: number) => {
    updateQuestionStatus('not_answered', index);
  };

  const handleSaveAndNext = () => {
    const currentAns = answers[questions[currentIndex].id];
    if (currentAns.selectedOptionIndex !== -1) {
      updateQuestionStatus('answered');
    } else {
      updateQuestionStatus('not_answered');
    }
    moveToNext();
  };

  const handleMarkForReview = () => {
    const currentAns = answers[questions[currentIndex].id];
    if (currentAns.selectedOptionIndex !== -1) {
      updateQuestionStatus('answered_marked_for_review');
    } else {
      updateQuestionStatus('marked_for_review');
    }
    moveToNext();
  };

  const handleClearResponse = () => {
    updateQuestionStatus('not_answered', -1);
  };

  const moveToNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextQid = questions[currentIndex + 1].id;
      if (answers[nextQid].status === 'not_visited') {
        setAnswers(prev => {
          const updated = { ...prev[nextQid], status: 'not_answered' as const };
          saveAnswerToDb(nextQid, updated);
          return { ...prev, [nextQid]: updated };
        });
      }
      setCurrentIndex(currentIndex + 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    const qId = questions[index].id;
    if (answers[qId].status === 'not_visited') {
      setAnswers(prev => {
        const updated = { ...prev[qId], status: 'not_answered' as const };
        saveAnswerToDb(qId, updated);
        return { ...prev, [qId]: updated };
      });
    }
    setCurrentIndex(index);
  };

  const calculateResults = async () => {
    if (!test || !attempt) return;
    
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnattempted = 0;
    let score = 0;

    questions.forEach(q => {
      const ans = answers[q.id];
      if (ans.status === 'answered' || ans.status === 'answered_marked_for_review') {
        if (ans.selectedOptionIndex === q.correctOptionIndex) {
          totalCorrect++;
          score += q.marks;
        } else {
          totalIncorrect++;
          score -= (q.negativeMarks || 0);
        }
      } else {
        totalUnattempted++;
      }
    });

    return { totalCorrect, totalIncorrect, totalUnattempted, score };
  };

  const handleSubmit = async (isAuto: boolean = false) => {
    setIsSubmitting(true);
    try {
      const results = await calculateResults();
      if (!results || !attemptId || !test) throw new Error("Missing data to submit");

      const timeSpentSeconds = (test.durationMinutes * 60) - (timeLeft || 0);

      await updateDoc(doc(db, 'testAttempts', attemptId), {
        status: isAuto ? 'auto_submitted' : 'completed',
        endTime: new Date().toISOString(),
        score: results.score,
        totalCorrect: results.totalCorrect,
        totalIncorrect: results.totalIncorrect,
        totalUnattempted: results.totalUnattempted,
        timeSpentSeconds
      });

      navigate(`/test/${test.id}/result/${attemptId}`);
    } catch (e) {
      console.error("Submit error", e);
      alert("Failed to submit test. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmit(true);
  };

  if (isLoading || !test || !attempt || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAns = answers[currentQ.id];

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: TestAnswer['status']) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'not_answered': return 'bg-red-500 text-white';
      case 'not_visited': return 'bg-gray-200 text-gray-700';
      case 'marked_for_review': return 'bg-purple-500 text-white';
      case 'answered_marked_for_review': return 'bg-purple-500 text-white border-2 border-green-500';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 md:px-4 py-3 flex flex-wrap gap-3 justify-between items-center shadow-sm z-20 shrink-0 sticky top-0">
        <div className="flex items-center space-x-2 md:space-x-4 max-w-[50%] md:max-w-md">
          <h1 className="text-base md:text-xl font-bold text-gray-900 truncate">{test.title}</h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-6">
          <div className="flex items-center text-sm md:text-lg font-bold bg-gray-100 px-2 md:px-4 py-1.5 md:py-2 rounded-lg">
            <Clock className={cn("w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2", timeLeft !== null && timeLeft < 300 ? "text-red-500 animate-pulse" : "text-gray-600")} />
            <span className={timeLeft !== null && timeLeft < 300 ? "text-red-600" : "text-gray-900"}>
              {timeLeft !== null ? formatTime(timeLeft) : '00:00'}
            </span>
          </div>
          <button 
            className="md:hidden p-2 bg-gray-100 rounded-lg text-gray-700 font-bold" 
            onClick={() => setShowMobilePalette(!showMobilePalette)}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <Button variant="danger" size="sm" className="hidden md:flex" onClick={() => setShowSubmitConfirm(true)}>
            Submit
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Question */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto p-6 lg:p-10">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">Question {currentIndex + 1}</h2>
              <div className="flex space-x-4 text-sm font-medium text-gray-500">
                <span className="text-green-600">+ {currentQ.marks} Marks</span>
                <span className="text-red-600">- {currentQ.negativeMarks || 0} Marks</span>
              </div>
            </div>
            
            <div className="prose max-w-none mb-8 text-gray-800 text-lg">
              {currentQ.text}
            </div>

            {currentQ.imageUrl && (
              <div className="mb-8">
                <img src={currentQ.imageUrl} alt="Question figure" className="max-w-full rounded-lg border border-gray-200 shadow-sm" />
              </div>
            )}

            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => (
                <label 
                  key={idx}
                  className={cn(
                    "flex items-center p-4 border rounded-xl cursor-pointer transition-colors w-full",
                    currentAns.selectedOptionIndex === idx 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                  onClick={() => handleSelectOption(idx)}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors",
                    currentAns.selectedOptionIndex === idx
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300"
                  )}>
                    {currentAns.selectedOptionIndex === idx && <Check className="w-4 h-4" />}
                  </div>
                  <span className="text-gray-800 leading-relaxed">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-gray-50 border-t border-gray-200 p-3 md:p-4 shrink-0 pb-[env(safe-area-inset-bottom)]">
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-4 items-center justify-between">
              <div className="col-span-2 flex justify-between md:space-x-4 md:contents">
                <Button variant="outline" size="sm" onClick={handleMarkForReview} className="bg-white flex-1 md:flex-none justify-center">
                  <Flag className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Mark for Review</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClearResponse} className="flex-1 md:flex-none justify-center">
                  Clear <span className="hidden md:inline">&nbsp;Response</span>
                </Button>
              </div>
              <div className="col-span-2 flex justify-between gap-2 md:space-x-4 md:contents mt-2 md:mt-0">
                <Button 
                  variant="secondary" 
                  className="flex-1 md:flex-none"
                  onClick={() => jumpToQuestion(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <Button onClick={handleSaveAndNext} className="flex-1 md:flex-none text-sm md:text-base">
                  Save & Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
            
            <div className="mt-4 md:hidden">
              <Button variant="danger" className="w-full" onClick={() => setShowSubmitConfirm(true)}>
                Submit Test
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel: Palette (Desktop) & Bottom Sheet (Mobile) */}
        <div className={cn(
          "bg-white border-l border-gray-200 flex flex-col shrink-0 z-30 transition-transform duration-300",
          "md:w-80 md:relative md:translate-y-0 md:flex",
          "fixed inset-x-0 bottom-0 top-[10%] rounded-t-2xl shadow-2xl md:shadow-none md:rounded-none",
          showMobilePalette ? "translate-y-0" : "translate-y-full md:translate-y-0"
        )}>
          {/* Mobile Handle */}
          <div className="md:hidden flex items-center justify-center pt-3 pb-1" onClick={() => setShowMobilePalette(false)}>
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>
          
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm md:text-lg">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-900 truncate max-w-[150px] md:max-w-full">{user?.email}</p>
                <p className="text-[10px] md:text-xs text-gray-500">Candidate</p>
              </div>
            </div>
            <button className="md:hidden p-2 text-gray-500 hover:text-gray-900" onClick={() => setShowMobilePalette(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Question Palette</h3>
            <div className="grid grid-cols-5 md:grid-cols-4 gap-2 md:gap-3">
              {questions.map((q, idx) => {
                const ansStatus = answers[q.id]?.status || 'not_visited';
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      jumpToQuestion(idx);
                      setShowMobilePalette(false);
                    }}
                    className={cn(
                      "aspect-square rounded-lg flex items-center justify-center font-bold text-sm shadow-sm transition-transform hover:scale-105",
                      getStatusColor(ansStatus),
                      currentIndex === idx && "ring-4 ring-blue-300 ring-offset-1"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs">
            <h4 className="font-bold text-gray-900 mb-2">Legend:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center"><div className="w-4 h-4 rounded bg-gray-200 mr-2"></div> Not Visited</div>
              <div className="flex items-center"><div className="w-4 h-4 rounded bg-red-500 mr-2"></div> Not Answered</div>
              <div className="flex items-center"><div className="w-4 h-4 rounded bg-green-500 mr-2"></div> Answered</div>
              <div className="flex items-center"><div className="w-4 h-4 rounded bg-purple-500 mr-2"></div> Review</div>
            </div>
          </div>
        </div>

      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Test?</h3>
            <p className="text-gray-600 mb-6">
              You are about to submit the test. You will not be able to change your answers after submission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={() => setShowSubmitConfirm(false)}>
                Resume Test
              </Button>
              <Button variant="danger" onClick={() => handleSubmit(false)} isLoading={isSubmitting}>
                Confirm Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
