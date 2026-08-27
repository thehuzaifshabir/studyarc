import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MockTest, TestAttempt } from '../../types';
import { useAuthStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle, Clock, Target, AlertTriangle, ArrowRight } from 'lucide-react';

export function MockTestResult() {
  const { testId, attemptId } = useParams<{ testId: string, attemptId: string }>();
  const [test, setTest] = useState<MockTest | null>(null);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadResult() {
      if (!testId || !attemptId || !user) return;
      try {
        const testDoc = await getDoc(doc(db, 'mockTests', testId));
        if (testDoc.exists()) {
          setTest({ id: testDoc.id, ...testDoc.data() } as MockTest);
        }

        const attemptDoc = await getDoc(doc(db, 'testAttempts', attemptId));
        if (attemptDoc.exists()) {
          setAttempt({ id: attemptDoc.id, ...attemptDoc.data() } as TestAttempt);
        }
      } catch (e) {
        console.error("Error loading result:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadResult();
  }, [testId, attemptId, user]);

  if (isLoading) return <div className="p-12 text-center">Loading results...</div>;
  if (!test || !attempt) return <div className="p-12 text-center">Result not found.</div>;

  const totalQuestions = (attempt.totalCorrect || 0) + (attempt.totalIncorrect || 0) + (attempt.totalUnattempted || 0);
  const percentage = test.totalMarks ? ((attempt.score || 0) / test.totalMarks) * 100 : 0;
  const accuracy = (attempt.totalCorrect || 0) + (attempt.totalIncorrect || 0) > 0 
    ? ((attempt.totalCorrect || 0) / ((attempt.totalCorrect || 0) + (attempt.totalIncorrect || 0))) * 100 
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">Test Result</h1>
        <p className="text-gray-500 mt-2">{test.title}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 rounded-full border-8 border-blue-500 flex items-center justify-center mb-4">
            <div>
              <span className="text-4xl font-extrabold text-gray-900">{attempt.score}</span>
              <span className="text-sm text-gray-500 block">/ {test.totalMarks}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Total Score</h3>
          <p className="text-sm text-gray-500 mt-1">{percentage.toFixed(1)}% Percentage</p>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Correct</p>
              <p className="text-2xl font-bold text-gray-900">{attempt.totalCorrect}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-4">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Incorrect</p>
              <p className="text-2xl font-bold text-gray-900">{attempt.totalIncorrect}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-4">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{accuracy.toFixed(1)}%</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Time Taken</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor((attempt.timeSpentSeconds || 0) / 60)}m {(attempt.timeSpentSeconds || 0) % 60}s
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Analysis</h3>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Review your answers, see explanations, and identify your weak areas.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="outline" size="lg" className="px-8">
            View Analytics
          </Button>
          <Link to={`/dashboard`}>
            <Button size="lg" className="px-8 flex items-center">
              Back to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
