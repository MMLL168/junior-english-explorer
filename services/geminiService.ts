import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StoryResponse, QuizResponse, VocabularyWord, QuizQuestion, ChatMessage } from "../types";

// 取得 API Key 的函式
const getApiKey = () => {
  // 1. 嘗試從 Vite 環境變數讀取
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
    return (import.meta as any).env.VITE_API_KEY;
  }
  
  // 2. 嘗試從標準 Node 環境變數讀取
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }

  // 3. 【直接貼上金鑰】
  // 請將你在 Google Cloud 複製的 "AIza..." 開頭金鑰貼在下方單引號中
  // 記得：一定要先在 Google Cloud Console 設定「網站限制」保護這把鑰匙！
  const HARDCODED_KEY = 'AIzaSyD3wuxXWX31_m3YlVp9qviRS2oLlCGnOEs'; // <--- 請貼在這裡，例如 'AIzaSyQr...'
  
  return HARDCODED_KEY;
};

const apiKey = getApiKey();

// 檢查金鑰是否存在，若不存在給予清楚的錯誤提示
if (!apiKey) {
  console.error("❌ API Key 遺失！請打開 services/geminiService.ts 並填入你的 Google Cloud API Key。");
  alert("⚠️ 尚未設定 API Key！\n請打開 services/geminiService.ts 檔案，將你的金鑰填入 HARDCODED_KEY 欄位中。");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' }); // 防止空值報錯，讓 UI 可以顯示錯誤訊息

// Schemas for structured output

const vocabularySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    definition: { type: Type.STRING, description: "Simple definition in English suitable for a 12 year old" },
    exampleSentence: { type: Type.STRING },
    pronunciation: { type: Type.STRING, description: "Simple phonetic guide" }
  },
  required: ["word", "definition", "exampleSentence", "pronunciation"]
};

const storySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    content: { type: Type.STRING, description: "A story about 200-300 words long. CEFR Level A2/B1." },
    summary: { type: Type.STRING, description: "One sentence summary." },
    vocabulary: {
      type: Type.ARRAY,
      items: vocabularySchema
    }
  },
  required: ["title", "content", "summary", "vocabulary"]
};

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER },
    question: { type: Type.STRING },
    options: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Array of 4 possible answers"
    },
    correctAnswerIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct answer" },
    explanation: { type: Type.STRING, description: "Explanation in Traditional Chinese (繁體中文) explaining why the answer is correct." }
  },
  required: ["id", "question", "options", "correctAnswerIndex", "explanation"]
};

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: questionSchema
    }
  },
  required: ["topic", "questions"]
};

// Service Methods

export const generateStory = async (topic: string): Promise<StoryResponse> => {
  const modelId = "gemini-3-flash-preview";
  if (!apiKey) throw new Error("API Key missing");

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Write a fun, engaging short story for a 6th grade student (approx 11-12 years old) about: ${topic}. 
      
      Pedagogical Requirements:
      1. English Level: CEFR A2/B1 (Intermediate for kids).
      2. Length: 150-250 words.
      3. Grammar Focus: Include clear examples of Past Simple and Present Perfect tenses appropriately.
      4. Tone: Encouraging, exciting, and educational.
      5. Vocabulary: Highlight 5 key words that are useful for this age group.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: storySchema,
        systemInstruction: "You are an expert ESL teacher with 30 years of experience teaching 5th-7th graders. You create materials that are easy to read but educational."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as StoryResponse;
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
};

export const generateQuiz = async (topic: string): Promise<QuizResponse> => {
  const modelId = "gemini-3-flash-preview";
  if (!apiKey) throw new Error("API Key missing");

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Create a 5-question multiple choice vocabulary and grammar quiz for 6th graders based on the topic: ${topic}.
      
      Requirements:
      1. Difficulty: Mixed (2 easy, 2 medium, 1 hard).
      2. Explanations: MUST be in Traditional Chinese (繁體中文) and very clear.
      3. Focus: Test understanding of context and grammar usage.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        systemInstruction: "You are a helpful quiz master for kids in Taiwan. Keep questions clear in English, but explanations in Traditional Chinese."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as QuizResponse;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

export const correctSentence = async (sentence: string): Promise<string> => {
    const modelId = "gemini-3-flash-preview";
    if (!apiKey) throw new Error("API Key missing");
    
    const response = await ai.models.generateContent({
        model: modelId,
        contents: `The student wrote: "${sentence}". 
        1. Identify any grammar or vocabulary mistakes.
        2. Explain the mistake gently in Traditional Chinese (繁體中文).
        3. Provide the corrected sentence in English.
        4. Suggest a "Better Native Way" to say it if applicable.
        5. Keep it short and encouraging.`,
        config: {
            systemInstruction: "You are a kind, supportive English tutor for kids in Taiwan. You use Traditional Chinese to explain grammar concepts clearly."
        }
    });
    
    return response.text || "Good job! 做得好！";
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    const modelId = "gemini-3-flash-preview";
    if (!apiKey) throw new Error("API Key missing");
    
    // Construct simplified history
    let promptContext = history.map(h => `${h.role === 'user' ? 'Student' : 'Teacher'}: ${h.text}`).join('\n');
    promptContext += `\nStudent: ${newMessage}`;

    const response = await ai.models.generateContent({
        model: modelId,
        contents: `Previous conversation:\n${promptContext}\n\nRespond as the Teacher.`,
        config: {
            systemInstruction: `You are "Mr. Gemini", a fun and patient English teacher with 30 years of experience.
            Target Audience: Taiwanese students (Grades 5-7, approx 11-13 years old).
            
            Core Rules:
            1. Response Length: Short! (1-3 sentences max). Don't lecture.
            2. Level: CEFR A2 (Simple words, clear grammar).
            3. Engagement: ALWAYS end with a simple question to keep the student talking.
            4. Correction: Do not strictly correct grammar unless it blocks understanding. Instead, use "Recasting" (repeat their idea back to them correctly).
               Example: 
               Student: "I go park yesterday."
               Teacher: "Oh, you went to the park yesterday? That sounds fun! What did you do there?"
            
            Role Play Mode:
            If the conversation seems to be a role-play (e.g., ordering food, asking directions), stay in character but keep the language simple.`
        }
    });

    return response.text || "I'm listening...";
}