import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MockTest } from '../../types';
import { Clock, FileText, Lock, Unlock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function MockTestList() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTests() {
      try {
        const q = query(collection(db, 'mockTests'), where('isPublished', '==', true));
        const querySnapshot = await getDocs(q);
        const fetchedTests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MockTest[];
        setTests(fetchedTests);
      } catch (error) {
        console.error("Error fetching mock tests:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTests();
  }, []);

  if (isLoading) {
    return <div className="p-12 text-center">Loading tests...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Mock Tests</h1>
        <p className="mt-4 text-xl text-gray-500">Practice with real exam interfaces and detailed analytics.</p>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No mock tests available</h3>
          <p className="mt-2 text-gray-500">Check back later for new tests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tests.map((test) => (
            <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {test.exam || 'General'}
                  </span>
                  {test.isFree ? (
                    <span className="inline-flex items-center text-sm font-medium text-green-600">
                      <Unlock className="w-4 h-4 mr-1" /> Free
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm font-medium text-gray-600">
                      <Lock className="w-4 h-4 mr-1" /> ₹{test.price}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{test.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{test.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    {test.durationMinutes} mins
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1 text-gray-400" />
                    {test.totalMarks} Marks
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Link to={`/mock-tests/${test.id}`} className="block">
                  <Button className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
