import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { StudyMaterial } from '../../types';
import { Button } from '../../components/ui/Button';
import { BookOpen, FileText, Lock, Unlock, Download } from 'lucide-react';
import { ClassNavigationTabs } from '../../components/ClassNavigationTabs';
import { ClassSelector } from '../../components/ClassSelector';

export function MaterialList() {
  const { classId } = useParams<{ classId: string }>();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function fetchMaterials() {
      if (!classId) return;
      try {
        const q = query(
          collection(db, 'studyMaterials'), 
          where('isPublished', '==', true),
          where('targetCategories', 'array-contains', classId)
        );
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StudyMaterial[];

        const qAll = query(
          collection(db, 'studyMaterials'),
          where('isPublished', '==', true),
          where('targetCategories', 'array-contains', 'all')
        );
        const snapshotAll = await getDocs(qAll);
        const allFetched = snapshotAll.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyMaterial));

        const merged = [...fetched, ...allFetched];
        const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());

        setMaterials(unique);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMaterials();
  }, [classId]);

  if (!classId) return null;

  const filteredMaterials = filter === 'All' ? materials : materials.filter(m => m.subject === filter);
  const subjects = ['All', ...Array.from(new Set(materials.map(m => m.subject).filter(Boolean)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes & Materials</h1>
          <p className="mt-1 text-gray-500">High-quality notes, formula sheets, and question banks.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <ClassSelector currentClassId={classId} category="notes" />
        </div>
      </div>

      <ClassNavigationTabs currentClassId={classId} />

      <div className="flex mb-8 space-x-2 overflow-x-auto pb-4">
        {subjects.map(subject => (
          <button
            key={subject}
            onClick={() => setFilter(subject as string)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === subject 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No materials available</h3>
          <p className="mt-2 text-gray-500">Check back later for new study resources.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                {material.thumbnailUrl ? (
                  <img src={material.thumbnailUrl} alt={material.title} className="w-full h-full object-cover" />
                ) : (
                  <FileText className="w-12 h-12 text-gray-300" />
                )}
                {material.isFree ? (
                  <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm">
                    <Unlock className="w-3 h-3 mr-1" /> Free
                  </span>
                ) : (
                  <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-900 text-white shadow-sm">
                    <Lock className="w-3 h-3 mr-1" /> ₹{material.price}
                  </span>
                )}
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <span className="inline-block text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                  {material.subject || material.category || 'Notes'}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{material.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{material.description}</p>
                
                <div className="mt-auto pt-4 border-t border-gray-100">
                  {material.isFree ? (
                     material.contentUrl ? (
                       <a href={material.contentUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                         <Button className="w-full font-bold">Get for Free</Button>
                       </a>
                     ) : (
                       <Link to={`/study-material/${material.id}`} className="block w-full">
                         <Button className="w-full font-bold">Get for Free</Button>
                       </Link>
                     )
                  ) : (
                     <Link to={`/study-material/${material.id}`} className="block w-full">
                       <Button variant="outline" className="w-full font-bold">View Details (₹{material.price})</Button>
                     </Link>
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
