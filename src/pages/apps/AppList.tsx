import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AppProduct } from '../../types';
import { Button } from '../../components/ui/Button';
import { LayoutGrid, Download, Star } from 'lucide-react';

export function AppList() {
  const [apps, setApps] = useState<AppProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const q = query(collection(db, 'apps'), where('isPublished', '==', true));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AppProduct[];
        setApps(fetched);
      } catch (error) {
        console.error("Error fetching apps:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchApps();
  }, []);

  if (isLoading) {
    return <div className="p-12 text-center">Loading apps...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Study Apps & Tools</h1>
        <p className="mt-4 text-xl text-gray-500">Boost your productivity with our custom tools.</p>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <LayoutGrid className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No apps available</h3>
          <p className="mt-2 text-gray-500">Check back later for new study apps.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row p-6">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                  {app.logoUrl ? (
                    <img src={app.logoUrl} alt={app.title} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <LayoutGrid className="w-10 h-10" />
                  )}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{app.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {app.platform}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{app.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-semibold text-lg text-gray-900">
                    {app.isFree ? <span className="text-green-600">Free</span> : `₹${app.price}`}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => alert("Downloading app...")}>
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
