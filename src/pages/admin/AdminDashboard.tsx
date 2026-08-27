import React, { useState } from 'react';
import { runClientSeed } from './seedData';
import { Button } from '../../components/ui/Button';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuthStore } from '../../lib/store';
import { Database, ShieldAlert, LayoutDashboard } from 'lucide-react';

export function AdminDashboard() {
  const [isSeeding, setIsSeeding] = useState(false);
  const { user } = useAuthStore();

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await runClientSeed();
      alert("Database seeded successfully!");
    } catch (error) {
      console.error(error);
      alert("Error seeding database. Make sure you have admin rights in Firestore rules.");
    } finally {
      setIsSeeding(false);
    }
  };

  const makeMeAdmin = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'admin'
      });
      alert("You are now an admin! Please refresh the page to update permissions.");
    } catch (error) {
      console.error(error);
      alert("Failed to update role. You might not have permission.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <LayoutDashboard className="mr-3 h-8 w-8 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500">Manage your educational platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-indigo-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Demo Data Setup</h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            Populate the database with sample mock tests, study materials, and apps. 
            This will overwrite existing documents with the same IDs.
          </p>
          <Button onClick={handleSeed} isLoading={isSeeding} className="w-full sm:w-auto">
            Seed Demo Data
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 bg-red-50">
          <div className="flex items-center mb-4">
            <ShieldAlert className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-xl font-bold text-red-900">Security Override</h2>
          </div>
          <p className="text-red-700 mb-6 text-sm">
            For demo purposes only. Click below to grant yourself admin permissions if you haven't already. 
            (Requires rules to temporarily allow it, or you can do it from Firebase Console).
          </p>
          <Button variant="danger" onClick={makeMeAdmin} className="w-full sm:w-auto">
            Make Me Admin
          </Button>
        </div>
      </div>
      
      <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">More Admin Features</h3>
        <p className="text-gray-500">
          Analytics, User Management, and Product Creation forms would go here in a complete implementation.
        </p>
      </div>
    </div>
  );
}
