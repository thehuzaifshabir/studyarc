export interface User {
  uid: string;
  name?: string;
  email: string;
  role: 'student' | 'admin' | 'superadmin';
  class?: string;
  targetExam?: string;
  preferredSubjects?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  category?: string;
  subject?: string;
  exam?: string;
  class?: string;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockTest {
  id: string;
  title: string;
  description: string;
  exam?: string;
  subject?: string;
  class?: string;
  durationMinutes: number;
  totalMarks?: number;
  negativeMarking?: number;
  instructions?: string;
  price: number;
  isFree: boolean;
  maxAttempts?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  testId: string;
  text: string;
  imageUrl?: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  marks: number;
  negativeMarks?: number;
  subject?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  status: 'in_progress' | 'completed' | 'auto_submitted';
  startTime: string;
  endTime?: string;
  lastActivityTime: string;
  score?: number;
  totalCorrect?: number;
  totalIncorrect?: number;
  totalUnattempted?: number;
  timeSpentSeconds?: number;
}

export interface TestAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionIndex: number; // -1 for unanswered
  status: 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_marked_for_review';
  timeSpentSeconds: number;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productType: 'study_material' | 'mock_test' | 'app' | 'donation';
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  gatewayReferenceId?: string;
  createdAt: string;
}

export interface AppProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  logoUrl?: string;
  platform?: string;
  version?: string;
  downloadUrl?: string;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  userId?: string;
  name?: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
}
