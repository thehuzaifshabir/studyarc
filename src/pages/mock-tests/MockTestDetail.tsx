import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MockTest } from '../../types';
import { useAuthStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export function MockTestDetail() {
  const { id } = useParams<{ id: string }>();
  const [test, setTest] = useState<MockTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTestDetails() {
      if (!id) return;
      try {
        const testDoc = await getDoc(doc(db, 'mockTests', id));
        if (testDoc.exists()) {
          const testData = { id: testDoc.id, ...testDoc.data() } as MockTest;
          setTest(testData);

          if (testData.isFree) {
            setHasAccess(true);
          } else if (user) {
            // Check entitlement
            const entitlementRef = doc(db, 'entitlements', `${user.uid}_${id}`);
            const entDoc = await getDoc(entitlementRef);
            if (entDoc.exists()) {
              setHasAccess(true);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching test details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTestDetails();
  }, [id, user]);

  const handleStartTest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!test || !hasAccess) return;

    setIsStarting(true);
    try {
      // Create test attempt
      const attemptId = `${user.uid}_${test.id}_${Date.now()}`;
      await setDoc(doc(db, 'testAttempts', attemptId), {
        userId: user.uid,
        testId: test.id,
        status: 'in_progress',
        startTime: new Date().toISOString(),
        lastActivityTime: new Date().toISOString(),
      });

      navigate(`/test/${test.id}/attempt/${attemptId}`);
    } catch (error) {
      console.error("Error starting test:", error);
      alert("Could not start test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Implement mock payment flow
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: test?.price,
          productId: test?.id,
          productType: 'mock_test',
          userId: user.uid
        })
      });
      const data = await res.json();
      
      // Auto verify for demo purposes
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderId,
          paymentId: 'pay_demo123',
          status: 'success',
          userId: user.uid,
          productId: test?.id,
          productType: 'mock_test',
          amount: test?.price
        })
      });
      
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setHasAccess(true);
        alert("Payment successful! You can now start the test.");
      }
    } catch (e) {
      console.error("Payment error", e);
    }
  };

  if (isLoading) return <div className="p-12 text-center">Loading...</div>;
  if (!test) return <div className="p-12 text-center">Test not found.</div>;

  if (test.isComingSoon) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
         <div className="bg-yellow-50 rounded-2xl p-12 border border-yellow-200 shadow-sm">
             <h1 className="text-4xl font-extrabold text-yellow-800 mb-4">Coming Soon!</h1>
             <p className="text-lg text-yellow-700">This premium test is currently being prepared and will be available soon.</p>
             <Link to="/">
               <Button className="mt-8 bg-yellow-600 hover:bg-yellow-700">Return Home</Button>
             </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {test.exam}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {test.subject || 'Full Syllabus'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{test.title}</h1>
          <p className="text-gray-600 text-lg mb-6">{test.description}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="flex flex-col">
              <span className="text-gray-400 font-medium text-xs uppercase tracking-wider">Duration</span>
              <span className="font-semibold text-gray-900 mt-1 flex items-center"><Clock className="w-4 h-4 mr-1"/> {test.durationMinutes} mins</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 font-medium text-xs uppercase tracking-wider">Max Marks</span>
              <span className="font-semibold text-gray-900 mt-1">{test.totalMarks}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 font-medium text-xs uppercase tracking-wider">Marking Scheme</span>
              <span className="font-semibold text-gray-900 mt-1">+4 / -{test.negativeMarking}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 font-medium text-xs uppercase tracking-wider">Price</span>
              <span className="font-semibold text-green-600 mt-1">{test.isFree ? 'Free' : `₹${test.price}`}</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Instructions</h3>
          <div className="prose prose-sm text-gray-600 mb-8 whitespace-pre-line">
            {test.instructions || (
              <ul className="space-y-2">
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"/> The test contains multiple choice questions with one correct answer.</li>
                <li className="flex items-start"><AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0"/> There is negative marking. {test.negativeMarking} mark(s) will be deducted for each incorrect answer.</li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"/> You can mark questions for review and return to them later.</li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"/> The test will be automatically submitted when the timer ends.</li>
              </ul>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center border-t border-gray-100 pt-8">
            {!hasAccess ? (
              <Button size="lg" className="w-full sm:w-auto px-12" onClick={handleBuy}>
                Buy Now (₹{test.price})
              </Button>
            ) : (
              <Button size="lg" className="w-full sm:w-auto px-12" onClick={handleStartTest} isLoading={isStarting}>
                Start Test
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
