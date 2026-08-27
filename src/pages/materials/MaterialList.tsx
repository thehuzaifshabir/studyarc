import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { StudyMaterial } from '../../types';
import { Button } from '../../components/ui/Button';
import { BookOpen, FileText, Lock, Unlock, Download } from 'lucide-react';

export function MaterialList() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const q = query(collection(db, 'studyMaterials'), where('isPublished', '==', true));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StudyMaterial[];
        setMaterials(fetched);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMaterials();
  }, []);

  if (isLoading) {
    return <div className="p-12 text-center">Loading materials...</div>;
  }

  const filteredMaterials = filter === 'All' ? materials : materials.filter(m => m.subject === filter);
  const subjects = ['All', ...Array.from(new Set(materials.map(m => m.subject).filter(Boolean)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Study Material</h1>
        <p className="mt-4 text-xl text-gray-500">High-quality notes, formula sheets, and question banks.</p>
      </div>

      <div className="flex justify-center mb-8 space-x-2 overflow-x-auto pb-4">
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

      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No materials available</h3>
          <p className="mt-2 text-gray-500">Check back later for new study resources.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {material.category || 'Notes'}
                  </span>
                  {material.isFree ? (
                    <span className="inline-flex items-center text-sm font-medium text-green-600">
                      <Unlock className="w-4 h-4 mr-1" /> Free
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm font-medium text-gray-600">
                      <Lock className="w-4 h-4 mr-1" /> ₹{material.price}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{material.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{material.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                  <div className="flex items-center font-medium">
                    {material.exam} • {material.subject}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Link to={`/study-material/${material.id}`} className="block">
                  <Button className="w-full" variant={material.isFree ? 'outline' : 'default'}>
                    {material.isFree ? <><Download className="w-4 h-4 mr-2" /> Get Free</> : 'View Details'}
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
