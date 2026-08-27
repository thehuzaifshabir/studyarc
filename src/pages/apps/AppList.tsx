import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AppProduct } from '../../types';
import { Button } from '../../components/ui/Button';
import { LayoutGrid, Download, Star } from 'lucide-react';
import { ClassNavigationTabs } from '../../components/ClassNavigationTabs';
import { ClassSelector } from '../../components/ClassSelector';

export function AppList() {
  const { classId } = useParams<{ classId: string }>();
  const [apps, setApps] = useState<AppProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      if (!classId) return;
      try {
        const q = query(
          collection(db, 'apps'), 
          where('isPublished', '==', true),
          where('targetCategories', 'array-contains', classId)
        );
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AppProduct[];

        const qAll = query(
          collection(db, 'apps'),
          where('isPublished', '==', true),
          where('targetCategories', 'array-contains', 'all')
        );
        const snapshotAll = await getDocs(qAll);
        const allFetched = snapshotAll.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppProduct));

        const merged = [...fetched, ...allFetched];
        const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());

        setApps(unique);
      } catch (error) {
        console.error("Error fetching apps:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchApps();
  }, [classId]);

  if (!classId) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Apps & Tools</h1>
          <p className="mt-1 text-gray-500">Boost your productivity with our custom tools.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <ClassSelector currentClassId={classId} category="study-apps" />
        </div>
      </div>

      <ClassNavigationTabs currentClassId={classId} />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <LayoutGrid className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No apps available</h3>
          <p className="mt-2 text-gray-500">Check back later for new study apps.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                {app.logoUrl ? (
                  <img src={app.logoUrl} alt={app.title} className="w-full h-full object-cover" />
                ) : (
                  <LayoutGrid className="w-12 h-12 text-gray-300" />
                )}
                {app.isFree ? (
                  <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm">
                    Free
                  </span>
                ) : (
                  <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-900 text-white shadow-sm">
                    ₹{app.price}
                  </span>
                )}
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <span className="inline-block text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">
                  {app.platform || 'App Tool'}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{app.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{app.description}</p>
                
                <div className="mt-auto pt-4 border-t border-gray-100">
                  {app.isFree ? (
                     app.downloadUrl ? (
                       <a href={app.downloadUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                         <Button className="w-full font-bold">Get for Free</Button>
                       </a>
                     ) : (
                       <Button className="w-full font-bold" onClick={() => alert("Link not provided")}>Get for Free</Button>
                     )
                  ) : (
                     <Button variant="outline" className="w-full font-bold">Buy App (₹{app.price})</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
