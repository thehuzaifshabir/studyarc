import React from 'react';
import { useAuthStore } from '../lib/store';
import { BookOpen, Clock, Settings, ShoppingBag, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { appUser } = useAuthStore();

  const stats = [
    { name: 'Mock Tests Attempted', value: '0', icon: Clock, color: 'bg-blue-500' },
    { name: 'Materials Purchased', value: '0', icon: BookOpen, color: 'bg-indigo-500' },
    { name: 'Apps Downloaded', value: '0', icon: LayoutGrid, color: 'bg-purple-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {appUser?.name?.split(' ')[0] || 'Student'}!</h1>
          <p className="text-gray-600 mt-1">Here is an overview of your progress.</p>
        </div>
        <Link to="/dashboard/profile" className="p-2 text-gray-400 hover:text-gray-500 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-200">
          <Settings className="h-5 w-5" />
        </Link>
      </div>

      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 gap-4 md:gap-6 mb-8 snap-x">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center min-w-[240px] md:min-w-0 snap-start">
              <div className={`p-3 rounded-lg ${stat.color} text-white mr-4 shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Tests</h2>
            <Link to="/dashboard/tests" className="text-sm font-medium text-blue-600 hover:text-blue-500">View all</Link>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">You haven't attempted any tests yet.</p>
              <Link to="/mock-tests" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                Browse Mock Tests <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* My Materials */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">My Study Materials</h2>
            <Link to="/dashboard/materials" className="text-sm font-medium text-blue-600 hover:text-blue-500">View all</Link>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">Your purchased materials will appear here.</p>
              <Link to="/study-material" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                Browse Materials <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
