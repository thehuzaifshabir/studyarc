import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Announcement } from '../../types';
import { ClassNavigationTabs } from '../../components/ClassNavigationTabs';
import { ClassSelector } from '../../components/ClassSelector';

export function AnnouncementsList() {
  const { classId } = useParams<{ classId: string }>();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      if (!classId) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'announcements'),
          where('isPublished', '==', true),
          where('targetCategories', 'array-contains', classId),
          // orderBy('createdAt', 'desc') // Requires composite index, handle on client if not available
        );
        const snapshot = await getDocs(q);
        
        let fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        
        // Try falling back to 'all' if no results or just append 'all' results
        const qAll = query(
          collection(db, 'announcements'),
          where('isPublished', '==', true),
          where('targetCategories', 'array-contains', 'all')
        );
        const snapshotAll = await getDocs(qAll);
        const allFetched = snapshotAll.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        
        // Merge and deduplicate
        const merged = [...fetched, ...allFetched];
        const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
        
        // Sort by date manually
        unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setAnnouncements(unique);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
      setLoading(false);
    }
    fetchAnnouncements();
  }, [classId]);

  if (!classId) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-1 text-gray-500">Stay updated with the latest news</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <ClassSelector currentClassId={classId} category="announcements" />
        </div>
      </div>

      <ClassNavigationTabs currentClassId={classId} />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">No Announcements Found</h3>
          <p className="mt-1 text-gray-500">There are no announcements for this class right now.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">{ann.title}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-4 text-gray-700 whitespace-pre-wrap">{ann.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
