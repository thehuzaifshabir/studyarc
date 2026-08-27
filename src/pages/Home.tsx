import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, FileText, CheckCircle2, Star } from 'lucide-react';

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-indigo-100 opacity-50 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
            New Target JEE 2025 Batch Live
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
            Prepare <span className="text-blue-600">Smarter.</span> <br className="hidden md:block"/> Practice <span className="text-indigo-600">Harder.</span> Crack it.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Everything you need for your JEE and NEET preparation in one place. Free resources, real mock tests, and focused preparation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/mock-tests" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center">
              Start Free Mock Test
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/study-material" className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-800 font-bold rounded-xl text-lg transition-all shadow-sm hover:bg-gray-50 flex items-center justify-center">
              Explore Materials
            </Link>
          </div>
        </div>
      </section>

      {/* Features/Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Materials</h3>
              <p className="text-gray-600">Curated notes, mind maps, and previous year question banks organized by chapter.</p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real Exam Environment</h3>
              <p className="text-gray-600">Practice with the exact interface used in NTA exams. Build stamina and time management.</p>
            </div>
            <div className="flex flex-col items-center p-6 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">Identify weak areas instantly. Topic-wise accuracy and time-spent analysis to improve your score.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 bg-gray-900 text-white text-center">
         <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join thousands of students cracking their dream exams</h2>
            <p className="text-xl text-gray-400 mb-10">Stop searching for materials. Start studying effectively.</p>
            <Link to="/register" className="inline-flex px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg transition-colors shadow-lg">
              Create Free Account
            </Link>
         </div>
      </section>
    </div>
  );
}
