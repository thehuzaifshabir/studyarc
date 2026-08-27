import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MockTest, Question, StudyMaterial, AppProduct } from '../../types';

export async function runClientSeed() {
  console.log("Starting DB seed via client SDK...");
  
  // 1. Seed Mock Tests
  const mockTests: MockTest[] = [
    {
      id: 'test-jee-physics-01',
      title: 'JEE Physics Chapter Test: Mechanics',
      description: 'Test your understanding of Kinematics and Laws of Motion. Curated for JEE Main level.',
      exam: 'JEE Main',
      subject: 'Physics',
      class: 'Class 11',
      durationMinutes: 30,
      totalMarks: 12,
      negativeMarking: 1,
      instructions: 'Each correct answer carries 4 marks. 1 mark will be deducted for each incorrect answer.',
      price: 0,
      isFree: true,
      maxAttempts: 3,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'test-neet-bio-full-01',
      title: 'NEET Biology Full Syllabus Mock Test',
      description: 'Comprehensive NEET Biology mock test covering Botany and Zoology as per NTA pattern.',
      exam: 'NEET',
      subject: 'Biology',
      class: 'Class 12',
      durationMinutes: 60,
      totalMarks: 360,
      negativeMarking: 1,
      instructions: 'Each correct answer carries 4 marks. 1 mark will be deducted for each incorrect answer.',
      price: 99,
      isFree: false,
      maxAttempts: 5,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  for (const test of mockTests) {
    await setDoc(doc(db, 'mockTests', test.id), test);
  }

  // 2. Seed Questions for JEE Physics Test
  const physicsQuestions: Question[] = [
    {
      id: 'q-phys-01',
      testId: 'test-jee-physics-01',
      text: 'A particle moves in a straight line with a constant acceleration. It changes its velocity from 10 ms⁻¹ to 20 ms⁻¹ while passing through a distance 135 m in t seconds. The value of t is:',
      options: ['12', '9', '10', '1.8'],
      correctOptionIndex: 1,
      explanation: 'Using v² - u² = 2as, we get a = (400 - 100) / (2 * 135) = 300 / 270 = 10/9 ms⁻². Then using v = u + at, t = (20 - 10) / (10/9) = 9 seconds.',
      marks: 4,
      negativeMarks: 1,
      subject: 'Physics',
      topic: 'Kinematics',
      difficulty: 'medium',
      createdAt: new Date().toISOString()
    },
    {
      id: 'q-phys-02',
      testId: 'test-jee-physics-01',
      text: 'A block of mass m is placed on a smooth inclined plane of inclination θ. The inclined plane is accelerated horizontally so that the block does not slide down. The acceleration of the inclined plane is:',
      options: ['g sinθ', 'g cosθ', 'g tanθ', 'g cotθ'],
      correctOptionIndex: 2,
      explanation: 'For the block to remain stationary relative to the incline, the pseudo force ma cosθ up the incline must balance the component of weight mg sinθ down the incline. So ma cosθ = mg sinθ => a = g tanθ.',
      marks: 4,
      negativeMarks: 1,
      subject: 'Physics',
      topic: 'Laws of Motion',
      difficulty: 'hard',
      createdAt: new Date().toISOString()
    },
    {
      id: 'q-phys-03',
      testId: 'test-jee-physics-01',
      text: 'A ball is thrown vertically upwards with a velocity of 20 m/s from the top of a multistorey building. The height of the point from where the ball is thrown is 25 m from the ground. How high will the ball rise from its point of projection? (Take g = 10 m/s²)',
      options: ['10 m', '15 m', '20 m', '25 m'],
      correctOptionIndex: 2,
      explanation: 'Using v² = u² + 2as. Final velocity at highest point is 0. 0 = (20)² - 2 * 10 * h => h = 400 / 20 = 20 m.',
      marks: 4,
      negativeMarks: 1,
      subject: 'Physics',
      topic: 'Kinematics',
      difficulty: 'easy',
      createdAt: new Date().toISOString()
    }
  ];

  for (const q of physicsQuestions) {
    await setDoc(doc(db, 'mockTests', q.testId, 'questions', q.id), q);
  }

  // 3. Seed Study Materials
  const materials: StudyMaterial[] = [
    {
      id: 'mat-jee-math-formulas',
      title: 'JEE Mathematics Master Formula Sheet',
      slug: 'jee-mathematics-master-formula-sheet',
      description: 'A comprehensive collection of all mathematical formulas required for JEE Main and Advanced. Includes Calculus, Algebra, Coordinate Geometry, and Vectors.',
      category: 'Formula Book',
      subject: 'Mathematics',
      exam: 'JEE',
      class: 'Class 12',
      price: 0,
      isFree: true,
      isPublished: true,
      isFeatured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mat-neet-bio-ncert',
      title: 'NCERT Biology Line-by-Line Revision',
      slug: 'ncert-biology-line-by-line',
      description: 'High-yield revision notes extracted directly from NCERT Biology. Perfect for last-month NEET preparation.',
      category: 'Revision Notes',
      subject: 'Biology',
      exam: 'NEET',
      class: 'Class 12',
      price: 149,
      isFree: false,
      isPublished: true,
      isFeatured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  for (const mat of materials) {
    await setDoc(doc(db, 'studyMaterials', mat.id), mat);
  }

  // 4. Seed Apps
  const apps: AppProduct[] = [
    {
      id: 'app-pomodoro',
      title: 'EduSphere Study Timer',
      slug: 'edusphere-study-timer',
      description: 'A focused pomodoro timer with exam-specific study blocks and analytics.',
      platform: 'Android',
      version: '1.0.2',
      price: 0,
      isFree: true,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'app-formula-vault',
      title: 'Physics Formula Vault Premium',
      slug: 'physics-formula-vault-premium',
      description: 'Interactive flashcards and formulas for JEE/NEET Physics. Works offline.',
      platform: 'Android / iOS',
      version: '2.1.0',
      price: 99,
      isFree: false,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  for (const app of apps) {
    await setDoc(doc(db, 'apps', app.id), app);
  }

  console.log("Seeding complete!");
}
