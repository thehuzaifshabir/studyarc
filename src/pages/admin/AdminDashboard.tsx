import React, { useState, useEffect } from 'react';
import { runClientSeed } from './seedData';
import { Button } from '../../components/ui/Button';
import { db } from '../../lib/firebase';
import { doc, updateDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { useAuthStore } from '../../lib/store';
import { Database, ShieldAlert, LayoutDashboard, Settings, Megaphone, FileText, LayoutGrid } from 'lucide-react';
import { TargetAudienceSelector } from '../../components/TargetAudienceSelector';
import { MockTest } from '../../types';
import { cn } from '../../lib/utils';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'settings' | 'announcements' | 'notes' | 'apps'>('settings');
  const [isSeeding, setIsSeeding] = useState(false);
  const { user } = useAuthStore();
  
  // Announcements State
  const [selectedCategoriesAnn, setSelectedCategoriesAnn] = useState<string[]>(['all']);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [isSubmittingAnn, setIsSubmittingAnn] = useState(false);

  // Notes State
  const [selectedCategoriesNote, setSelectedCategoriesNote] = useState<string[]>(['all']);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDesc, setNoteDesc] = useState('');
  const [noteThumb, setNoteThumb] = useState('');
  const [noteLink, setNoteLink] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Apps State
  const [selectedCategoriesApp, setSelectedCategoriesApp] = useState<string[]>(['all']);
  const [appTitle, setAppTitle] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [appLogo, setAppLogo] = useState('');
  const [appLink, setAppLink] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  // Featured Test State
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [featuredTestId, setFeaturedTestId] = useState('');
  const [isUpdatingFeatured, setIsUpdatingFeatured] = useState(false);

  useEffect(() => {
    async function fetchTests() {
      const q = query(collection(db, 'mockTests'));
      const snapshot = await getDocs(q);
      const tests = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MockTest));
      setMockTests(tests);
      
      const featured = tests.find(t => t.isFeaturedPremium);
      if (featured) setFeaturedTestId(featured.id);
    }
    fetchTests();
  }, []);

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

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return alert("Please fill all fields");
    setIsSubmittingAnn(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        title: annTitle,
        content: annContent,
        targetCategories: selectedCategoriesAnn,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      alert("Announcement created successfully");
      setAnnTitle('');
      setAnnContent('');
    } catch (error) {
      console.error(error);
      alert("Failed to create announcement");
    } finally {
      setIsSubmittingAnn(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteDesc || !noteLink) return alert("Please fill required fields (Title, Description, Link)");
    setIsSubmittingNote(true);
    try {
      await addDoc(collection(db, 'studyMaterials'), {
        title: noteTitle,
        slug: noteTitle.toLowerCase().replace(/\s+/g, '-'),
        description: noteDesc,
        thumbnailUrl: noteThumb || null,
        contentUrl: noteLink,
        targetCategories: selectedCategoriesNote,
        price: 0,
        isFree: true,
        isPublished: true,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      alert("Note created successfully");
      setNoteTitle('');
      setNoteDesc('');
      setNoteThumb('');
      setNoteLink('');
    } catch (error) {
      console.error(error);
      alert("Failed to create note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appTitle || !appDesc || !appLink) return alert("Please fill required fields (Title, Description, Link)");
    setIsSubmittingApp(true);
    try {
      await addDoc(collection(db, 'apps'), {
        title: appTitle,
        slug: appTitle.toLowerCase().replace(/\s+/g, '-'),
        description: appDesc,
        logoUrl: appLogo || null,
        downloadUrl: appLink,
        targetCategories: selectedCategoriesApp,
        price: 0,
        isFree: true,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      alert("App created successfully");
      setAppTitle('');
      setAppDesc('');
      setAppLogo('');
      setAppLink('');
    } catch (error) {
      console.error(error);
      alert("Failed to create app");
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleUpdateFeaturedTest = async () => {
    setIsUpdatingFeatured(true);
    try {
      // Unset previous featured
      const prevFeatured = mockTests.find(t => t.isFeaturedPremium);
      if (prevFeatured) {
        await updateDoc(doc(db, 'mockTests', prevFeatured.id), {
          isFeaturedPremium: false
        });
      }
      
      // Set new featured
      if (featuredTestId) {
        await updateDoc(doc(db, 'mockTests', featuredTestId), {
          isFeaturedPremium: true
        });
        alert("Featured test updated successfully");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update featured test");
    } finally {
      setIsUpdatingFeatured(false);
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

      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={cn("whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center", activeTab === 'settings' ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings & System
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={cn("whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center", activeTab === 'announcements' ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}
          >
            <Megaphone className="w-4 h-4 mr-2" />
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={cn("whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center", activeTab === 'notes' ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}
          >
            <FileText className="w-4 h-4 mr-2" />
            Add Note
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={cn("whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center", activeTab === 'apps' ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Add App
          </button>
        </nav>
      </div>

      {activeTab === 'announcements' && (
        <div className="max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Create Announcement</h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input 
                  type="text" 
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea 
                  value={annContent}
                  onChange={e => setAnnContent(e.target.value)}
                  rows={4} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="pt-2">
                <TargetAudienceSelector 
                  selectedCategories={selectedCategoriesAnn} 
                  onChange={setSelectedCategoriesAnn} 
                />
              </div>
              <Button type="submit" isLoading={isSubmittingAnn}>Publish Announcement</Button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Create Free Note/Material Post</h2>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Post Title *</label>
                <input 
                  type="text" 
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea 
                  value={noteDesc}
                  onChange={e => setNoteDesc(e.target.value)}
                  rows={3} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Thumbnail Image URL (Optional)</label>
                <input 
                  type="url" 
                  value={noteThumb}
                  onChange={e => setNoteThumb(e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content / Drive Link *</label>
                <input 
                  type="url" 
                  value={noteLink}
                  onChange={e => setNoteLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Users will be redirected to this link when they click "Get for Free".</p>
              </div>
              <div className="pt-2">
                <TargetAudienceSelector 
                  selectedCategories={selectedCategoriesNote} 
                  onChange={setSelectedCategoriesNote} 
                />
              </div>
              <Button type="submit" isLoading={isSubmittingNote}>Publish Note Post</Button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'apps' && (
        <div className="max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Create Free App Post</h2>
            <form onSubmit={handleCreateApp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">App Title *</label>
                <input 
                  type="text" 
                  value={appTitle}
                  onChange={e => setAppTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea 
                  value={appDesc}
                  onChange={e => setAppDesc(e.target.value)}
                  rows={3} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo/Thumbnail URL (Optional)</label>
                <input 
                  type="url" 
                  value={appLogo}
                  onChange={e => setAppLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Download / Play Store Link *</label>
                <input 
                  type="url" 
                  value={appLink}
                  onChange={e => setAppLink(e.target.value)}
                  placeholder="https://play.google.com/..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Users will be redirected to this link when they click "Get for Free".</p>
              </div>
              <div className="pt-2">
                <TargetAudienceSelector 
                  selectedCategories={selectedCategoriesApp} 
                  onChange={setSelectedCategoriesApp} 
                />
              </div>
              <Button type="submit" isLoading={isSubmittingApp}>Publish App Post</Button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-500" />
              Homepage Featured Content
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Premium Mock Test</label>
                <select 
                  value={featuredTestId}
                  onChange={e => setFeaturedTestId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {mockTests.map(test => (
                    <option key={test.id} value={test.id}>{test.title}</option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  This test will be prominently displayed on the homepage. Only one test can be featured at a time.
                </p>
              </div>
              <Button onClick={handleUpdateFeaturedTest} isLoading={isUpdatingFeatured}>Update Featured Test</Button>
            </div>
          </div>

          <div className="space-y-8">
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
        </div>
      )}
    </div>
  );
}
