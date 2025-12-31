export enum AppView {
  HOME = 'HOME',
  STORY = 'STORY',
  QUIZ = 'QUIZ',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
  LISTENING = 'LISTENING',
}

export interface VocabularyWord {
  word: string;
  definition: string;
  chineseDefinition: string;
  exampleSentence: string;
  chineseExample: string; // Added Chinese translation for the example sentence
  pronunciation: string;
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

export interface ListeningQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
}

export interface ListeningChallenge {
    topic: string;
    script: string; // The text to be spoken
    questions: ListeningQuestion[];
    difficulty: string;
}
