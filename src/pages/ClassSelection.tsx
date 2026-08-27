import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { TARGET_CLASSES, CONTENT_CATEGORIES } from '../lib/constants';
import { ArrowLeft } from 'lucide-react';

export function ClassSelection() {
  const { category } = useParams<{ category: string }>();

  // Validate category
  const validCategory = CONTENT_CATEGORIES.find(c => c.id === category);
  
  if (!validCategory) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Choose your preparation</h1>
        <p className="mt-4 text-xl text-gray-500">
          Select your class and target exam to see the right {validCategory.label.toLowerCase()}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TARGET_CLASSES.map((cls) => (
          <Link
            key={cls.id}
            to={`/${category}/${cls.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {cls.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
