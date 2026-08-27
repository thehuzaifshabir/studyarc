import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { StudyMaterial } from '../../types';
import { useAuthStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { BookOpen, CheckCircle, Download, FileText, Lock, Unlock } from 'lucide-react';

export function MaterialDetail() {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDetails() {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'studyMaterials', id));
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as StudyMaterial;
          setMaterial(data);

          if (data.isFree) {
            setHasAccess(true);
          } else if (user) {
            const entitlementRef = doc(db, 'entitlements', `${user.uid}_${id}`);
            const entDoc = await getDoc(entitlementRef);
            if (entDoc.exists()) {
              setHasAccess(true);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching material:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetails();
  }, [id, user]);

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: material?.price,
          productId: material?.id,
          productType: 'study_material',
          userId: user.uid
        })
      });
      const data = await res.json();
      
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderId,
          paymentId: 'pay_demo456',
          status: 'success',
          userId: user.uid,
          productId: material?.id,
          productType: 'study_material',
          amount: material?.price
        })
      });
      
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setHasAccess(true);
        alert("Payment successful! You can now download the material.");
      }
    } catch (e) {
      console.error("Payment error", e);
    }
  };

  if (isLoading) return <div className="p-12 text-center">Loading...</div>;
  if (!material) return <div className="p-12 text-center">Material not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-start md:space-x-8">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <div className="aspect-[3/4] bg-white rounded-xl shadow-md border border-gray-200 flex items-center justify-center p-6">
              {material.thumbnailUrl ? (
                <img src={material.thumbnailUrl} alt={material.title} className="w-full h-full object-contain" />
              ) : (
                <BookOpen className="w-24 h-24 text-gray-300" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {material.category}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {material.exam} {material.subject}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{material.title}</h1>
            <p className="text-gray-600 text-lg mb-6">{material.description}</p>
            
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-200">
              <div className="flex flex-col">
                <span className="text-gray-400 font-medium text-xs uppercase tracking-wider">Price</span>
                <span className="font-semibold text-2xl text-gray-900 mt-1">
                  {material.isFree ? <span className="text-green-600">Free</span> : `₹${material.price}`}
                </span>
              </div>
              
              {!hasAccess ? (
                <Button size="lg" className="px-8 shadow-md hover:-translate-y-0.5 transition-transform" onClick={handleBuy}>
                  <Lock className="w-4 h-4 mr-2" /> Buy Now
                </Button>
              ) : (
                <Button size="lg" className="px-8 bg-green-600 hover:bg-green-700 shadow-md">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
