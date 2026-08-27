import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, LayoutGrid, FileText, Bell, Star, Heart } from 'lucide-react';
import { CONTENT_CATEGORIES } from '../lib/constants';
import { MockTest } from '../types';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export function Home() {
  const [featuredTest, setFeaturedTest] = useState<MockTest | null>(null);

  useEffect(() => {
    async function fetchFeaturedTest() {
      try {
        const q = query(
          collection(db, 'mockTests'),
          where('isPublished', '==', true),
          where('isFeaturedPremium', '==', true),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setFeaturedTest({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as MockTest);
        }
      } catch (err) {
        console.error("Error fetching featured test:", err);
      }
    }
    fetchFeaturedTest();
  }, []);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'notes': return <FileText className="w-8 h-8 text-blue-600" />;
      case 'mock-tests': return <BookOpen className="w-8 h-8 text-indigo-600" />;
      case 'study-apps': return <LayoutGrid className="w-8 h-8 text-green-600" />;
      case 'announcements': return <Bell className="w-8 h-8 text-purple-600" />;
      default: return <FileText className="w-8 h-8 text-blue-600" />;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-20 pb-16 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            Your preparation. Your pace. Your goal.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Select what you want to focus on today and start studying efficiently.
          </p>
        </div>
      </section>

      {/* Main Categories Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTENT_CATEGORIES.map(category => (
              <Link
                key={category.id}
                to={`${category.path}/select`}
                className="group flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all text-center"
              >
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(category.id)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.label}</h3>
                <p className="text-sm text-gray-500 flex-grow mb-4">{category.description}</p>
                <span className="inline-flex items-center justify-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  Browse {category.label} <ArrowRight className="ml-1 w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Premium Test Section */}
      {featuredTest && (
        <section className="py-16 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Featured</h2>
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
              
              <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm font-semibold mb-6 border border-yellow-500/30">
                    Premium Test Series
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                    {featuredTest.title}
                  </h3>
                  <p className="text-lg text-indigo-200 mb-6 max-w-2xl">
                    {featuredTest.description}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-300 mb-8">
                    <span className="bg-white/10 px-3 py-1.5 rounded-lg">{featuredTest.exam}</span>
                    <span className="bg-white/10 px-3 py-1.5 rounded-lg">{featuredTest.durationMinutes} Mins</span>
                    <span className="bg-white/10 px-3 py-1.5 rounded-lg">{featuredTest.totalMarks} Marks</span>
                    <span className="bg-white/10 px-3 py-1.5 rounded-lg">-{featuredTest.negativeMarking} Negative</span>
                  </div>
                </div>
                
                <div className="shrink-0 text-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[250px]">
                  <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">Unlock Access</p>
                  <p className="text-4xl font-extrabold text-white mb-6">₹{featuredTest.price}</p>
                  <Link to={`/mock-test/${featuredTest.id}`}>
                    <Button size="lg" className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold text-lg">
                      Attempt Premium Test
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Support Section */}
      <section className="py-20 bg-white text-center border-t border-gray-100">
         <div className="max-w-3xl mx-auto px-4">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Support the Creator</h2>
            <p className="text-lg text-gray-600 mb-8">Your support helps keep the educational resources free and allows us to build better tools for students.</p>
            <Link to="/donate">
              <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white shadow-lg">
                Donate Now
              </Button>
            </Link>
         </div>
      </section>
    </div>
  );
}
