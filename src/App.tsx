import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthStore } from './lib/store';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { MockTestList } from './pages/mock-tests/MockTestList';
import { MockTestDetail } from './pages/mock-tests/MockTestDetail';
import { ExamInterface } from './pages/mock-tests/ExamInterface';
import { MockTestResult } from './pages/mock-tests/MockTestResult';
import { MaterialList } from './pages/materials/MaterialList';
import { MaterialDetail } from './pages/materials/MaterialDetail';
import { AppList } from './pages/apps/AppList';
import { AnnouncementsList } from './pages/announcements/AnnouncementsList';
import { ClassSelection } from './pages/ClassSelection';
import { Donate } from './pages/Donate';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { User } from './types';

export default function App() {
  const { setUser, setAppUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setAppUser(userDoc.data() as User);
          } else {
            setAppUser(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAppUser, setIsLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          <Route path=":category/select" element={<ClassSelection />} />

          <Route path="study-material/:id" element={<MaterialDetail />} />
          <Route path="notes/:classId" element={<MaterialList />} />
          
          <Route path="mock-test/:id" element={<MockTestDetail />} />
          <Route path="mock-tests/:classId" element={<MockTestList />} />
          <Route path="test/:testId/result/:attemptId" element={<MockTestResult />} />
          
          <Route path="study-apps/:classId" element={<AppList />} />
          
          <Route path="announcements/:classId" element={<AnnouncementsList />} />

          <Route path="donate" element={<Donate />} />
          
          {/* Protected Routes */}
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<div className="p-16 text-center text-2xl font-bold">404 - Not Found</div>} />
        </Route>
        
        {/* Fullscreen exam routes outside standard layout */}
        <Route path="/test/:testId/attempt/:attemptId" element={
          <ProtectedRoute>
            <ExamInterface />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}





