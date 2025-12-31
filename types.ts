export enum AppView {
  HOME = 'HOME',
  STORY = 'STORY',
  QUIZ = 'QUIZ',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
  LISTENING = 'LISTENING',
  GARDEN = 'GARDEN',
  VOCAB = 'VOCAB',
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

// Gamification Types
export interface Plant {
    id: number;
    stage: 0 | 1 | 2 | 3 | 4; // 0: Empty, 1: Seed, 2: Sprout, 3: Flower, 4: Fruit
    type: 'apple' | 'sunflower' | 'cactus';
    waterLevel: number; // Current water in this stage
    waterNeeded: number; // Water needed to advance to next stage
}

export interface UserResources {
    waterDrops: number;
    stars: number;
}

export interface RewardCard {
    id: string;
    title: string;
    cost: number;
    icon: string;
    color: string;
}
