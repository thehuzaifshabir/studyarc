import React, { useState, useEffect } from 'react';
import { runClientSeed } from './seedData';
import { Button } from '../../components/ui/Button';
import { db } from '../../lib/firebase';
import { doc, updateDoc, collection, getDocs, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import { useAuthStore } from '../../lib/store';
import { Database, ShieldAlert, LayoutDashboard, Settings, Megaphone, FileText, LayoutGrid, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { TargetAudienceSelector } from '../../components/TargetAudienceSelector';
import { MockTest, Question, Announcement, StudyMaterial, AppProduct } from '../../types';
import { cn } from '../../lib/utils';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'settings' | 'announcements' | 'notes' | 'apps' | 'tests'>('settings');
  const [isSeeding, setIsSeeding] = useState(false);
  const { user } = useAuthStore();
  
  // Content Lists
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>([]);
  const [notesList, setNotesList] = useState<StudyMaterial[]>([]);
  const [appsList, setAppsList] = useState<AppProduct[]>([]);

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

  // Tests State
  const [selectedCategoriesTest, setSelectedCategoriesTest] = useState<string[]>(['all']);
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [testDuration, setTestDuration] = useState(60);
  const [testPrice, setTestPrice] = useState(0);
  const [testIsFree, setTestIsFree] = useState(true);
  const [testIsPremiumFeatured, setTestIsPremiumFeatured] = useState(false);
  const [testQuestions, setTestQuestions] = useState<Partial<Question>[]>([
    { id: '1', text: '', options: ['', '', '', ''], correctOptionIndex: 0, marks: 4, negativeMarks: 1 }
  ]);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  // Featured Test State
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [featuredTestId, setFeaturedTestId] = useState('');
  const [featuredComingSoon, setFeaturedComingSoon] = useState(false);
  const [isUpdatingFeatured, setIsUpdatingFeatured] = useState(false);

  const fetchAllContent = async () => {
    try {
      const [testsSnap, annSnap, notesSnap, appsSnap] = await Promise.all([
        getDocs(query(collection(db, 'mockTests'))),
        getDocs(query(collection(db, 'announcements'))),
        getDocs(query(collection(db, 'studyMaterials'))),
        getDocs(query(collection(db, 'apps')))
      ]);
      
      const tests = testsSnap.docs.map(d => ({ id: d.id, ...d.data() } as MockTest));
      setMockTests(tests);
      const featured = tests.find(t => t.isFeaturedPremium);
      if (featured) {
        setFeaturedTestId(featured.id);
        setFeaturedComingSoon(!!featured.isComingSoon);
      }
      
      setAnnouncementsList(annSnap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
      setNotesList(notesSnap.docs.map(d => ({ id: d.id, ...d.data() } as StudyMaterial)));
      setAppsList(appsSnap.docs.map(d => ({ id: d.id, ...d.data() } as AppProduct)));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  const handleDelete = async (collectionName: string, docId: string) => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, collectionName, docId));
      alert("Item deleted successfully!");
      fetchAllContent();
    } catch (e) {
      console.error(e);
      alert("Failed to delete item. Ensure you have admin rights in Firestore rules.");
    }
  };

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
      fetchAllContent();
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
      fetchAllContent();
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
      fetchAllContent();
    } catch (error) {
      console.error(error);
      alert("Failed to create app");
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const addTestQuestion = () => {
    setTestQuestions([...testQuestions, {
      id: Date.now().toString(),
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      marks: 4,
      negativeMarks: 1
    }]);
  };

  const removeTestQuestion = (index: number) => {
    if (testQuestions.length <= 1) return;
    const newQs = [...testQuestions];
    newQs.splice(index, 1);
    setTestQuestions(newQs);
  };

  const updateTestQuestion = (index: number, field: keyof Question, value: any) => {
    const newQs = [...testQuestions];
    newQs[index] = { ...newQs[index], [field]: value };
    setTestQuestions(newQs);
  };

  const updateTestOption = (qIndex: number, optIndex: number, value: string) => {
    const newQs = [...testQuestions];
    const options = [...(newQs[qIndex].options || [])];
    options[optIndex] = value;
    newQs[qIndex].options = options;
    setTestQuestions(newQs);
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle || !testDesc) return alert("Please provide title and description");
    if (testQuestions.some(q => !q.text || q.options?.some(opt => !opt))) {
      return alert("Please fill all questions and options");
    }
    
    setIsSubmittingTest(true);
    try {
      const testRef = await addDoc(collection(db, 'mockTests'), {
        title: testTitle,
        description: testDesc,
        durationMinutes: testDuration,
        targetCategories: selectedCategoriesTest,
        price: testIsFree ? 0 : testPrice,
        isFree: testIsFree,
        isFeaturedPremium: testIsPremiumFeatured,
        totalMarks: testQuestions.reduce((acc, q) => acc + (q.marks || 4), 0),
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      for (const q of testQuestions) {
        await addDoc(collection(db, 'mockTests', testRef.id, 'questions'), {
          testId: testRef.id,
          text: q.text,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          marks: q.marks || 4,
          negativeMarks: q.negativeMarks || 1,
          createdAt: new Date().toISOString()
        });
      }

      alert("Mock Test created successfully!");
      setTestTitle('');
      setTestDesc('');
      setTestPrice(0);
      setTestIsFree(true);
      setTestIsPremiumFeatured(false);
      setTestDuration(60);
      setTestQuestions([{ id: '1', text: '', options: ['', '', '', ''], correctOptionIndex: 0, marks: 4, negativeMarks: 1 }]);
      fetchAllContent();
    } catch (error) {
      console.error(error);
      alert("Failed to create test");
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const handleUpdateFeaturedTest = async () => {
    setIsUpdatingFeatured(true);
    try {
      // Unset previous featured
      const prevFeatured = mockTests.find(t => t.isFeaturedPremium);
      if (prevFeatured) {
        await updateDoc(doc(db, 'mockTests', prevFeatured.id), {
          isFeaturedPremium: false,
          isComingSoon: false
        });
      }
      
      // Set new featured
      if (featuredTestId) {
        await updateDoc(doc(db, 'mockTests', featuredTestId), {
          isFeaturedPremium: true,
          isComingSoon: featuredComingSoon
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

      <div className="mb-8 border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-6 md:space-x-8 min-w-max">
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
          <button
            onClick={() => setActiveTab('tests')}
            className={cn("whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center", activeTab === 'tests' ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Add Mock Test
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Manage Announcements</h2>
            <div className="space-y-4">
              {announcementsList.map(ann => (
                <div key={ann.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(ann.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete('announcements', ann.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {announcementsList.length === 0 && <p className="text-sm text-gray-500">No announcements found.</p>}
            </div>
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Manage Notes</h2>
            <div className="space-y-4">
              {notesList.map(note => (
                <div key={note.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{note.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete('studyMaterials', note.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {notesList.length === 0 && <p className="text-sm text-gray-500">No notes found.</p>}
            </div>
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Manage Apps</h2>
            <div className="space-y-4">
              {appsList.map(app => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete('apps', app.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {appsList.length === 0 && <p className="text-sm text-gray-500">No apps found.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-blue-600" />
              Create CBT Mock Test
            </h2>
            <form onSubmit={handleCreateTest} className="space-y-8">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Test Title *</label>
                    <input 
                      type="text" 
                      value={testTitle}
                      onChange={e => setTestTitle(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description *</label>
                    <textarea 
                      value={testDesc}
                      onChange={e => setTestDesc(e.target.value)}
                      rows={2} 
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (Minutes) *</label>
                    <input 
                      type="number" 
                      value={testDuration}
                      onChange={e => setTestDuration(Number(e.target.value))}
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pricing *</label>
                    <div className="mt-1 flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input type="radio" checked={testIsFree} onChange={() => setTestIsFree(true)} className="form-radio text-blue-600" />
                        <span className="ml-2 text-sm text-gray-700">Free</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="radio" checked={!testIsFree} onChange={() => setTestIsFree(false)} className="form-radio text-blue-600" />
                        <span className="ml-2 text-sm text-gray-700">Premium</span>
                      </label>
                      {!testIsFree && (
                        <input 
                          type="number" 
                          value={testPrice}
                          onChange={e => setTestPrice(Number(e.target.value))}
                          placeholder="Price (₹)"
                          className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" 
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                {!testIsFree && (
                  <div className="flex items-center">
                    <input
                      id="isFeaturedPremium"
                      type="checkbox"
                      checked={testIsPremiumFeatured}
                      onChange={e => setTestIsPremiumFeatured(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isFeaturedPremium" className="ml-2 block text-sm text-gray-900">
                      Feature on homepage (Premium Mock Test section)
                    </label>
                  </div>
                )}
                
                <div className="pt-2">
                  <TargetAudienceSelector 
                    selectedCategories={selectedCategoriesTest} 
                    onChange={setSelectedCategoriesTest} 
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Questions ({testQuestions.length})</h3>
                </div>
                
                <div className="space-y-6">
                  {testQuestions.map((q, qIndex) => (
                    <div key={q.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg relative">
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <button type="button" onClick={() => removeTestQuestion(qIndex)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-4">Question {qIndex + 1}</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <textarea 
                            value={q.text}
                            onChange={e => updateTestQuestion(qIndex, 'text', e.target.value)}
                            placeholder="Type question here..."
                            rows={2} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-blue-200">
                          {q.options?.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                name={`correct-${q.id}`} 
                                checked={q.correctOptionIndex === optIndex}
                                onChange={() => updateTestQuestion(qIndex, 'correctOptionIndex', optIndex)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                              <input 
                                type="text"
                                value={opt}
                                onChange={e => updateTestOption(qIndex, optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                required
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 max-w-xs pt-2">
                           <div>
                             <label className="block text-xs font-medium text-gray-700">Marks</label>
                             <input type="number" value={q.marks} onChange={e => updateTestQuestion(qIndex, 'marks', Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" />
                           </div>
                           <div>
                             <label className="block text-xs font-medium text-gray-700">Negative Marks</label>
                             <input type="number" value={q.negativeMarks} onChange={e => updateTestQuestion(qIndex, 'negativeMarks', Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" />
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button type="button" variant="outline" onClick={addTestQuestion} className="w-full border-dashed border-2">
                  <Plus className="w-4 h-4 mr-2" /> Add Another Question
                </Button>
              </div>

              <div className="pt-6 border-t">
                <Button type="submit" isLoading={isSubmittingTest} className="w-full md:w-auto">
                  Publish CBT Mock Test
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Manage Tests</h2>
            <div className="space-y-4">
              {mockTests.map(test => (
                <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{test.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(test.createdAt).toLocaleDateString()} • {test.durationMinutes} mins</p>
                  </div>
                  <button onClick={() => handleDelete('mockTests', test.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {mockTests.length === 0 && <p className="text-sm text-gray-500">No tests found.</p>}
            </div>
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
              
              <div className="flex items-center">
                <input
                  id="featured-coming-soon"
                  type="checkbox"
                  checked={featuredComingSoon}
                  onChange={(e) => setFeaturedComingSoon(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured-coming-soon" className="ml-2 block text-sm text-gray-900">
                  Mark as "Coming Soon"
                </label>
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
