export enum AppView {
  HOME = 'HOME',
  STORY = 'STORY',
  QUIZ = 'QUIZ',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
}

export interface VocabularyWord {
  word: string;
  definition: string;
  exampleSentence: string;
  pronunciation: string; // Phonetic or simple spelling
}

export interface StoryResponse {
  title: string;
  content: string;
  vocabulary: VocabularyWord[];
  summary: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation: string;
}

export interface QuizResponse {
  topic: string;
  questions: QuizQuestion[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  corrections?: string; // Optional field for corrected text if the user made mistakes
}