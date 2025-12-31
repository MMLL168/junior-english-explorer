import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
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

  // 3. 【直接貼上金鑰】(最簡單的方法)
  // 如果您沒有設定環境變數，請直接將金鑰貼在下方。
  // 申請網址: https://aistudio.google.com/app/apikey
  // ⚠️ 注意：請將下方的 '' 填入您的金鑰，看起來會像 const HARDCODED_KEY = 'AIzaSy...';
  const HARDCODED_KEY = ''; 
  
  return HARDCODED_KEY;
};

const apiKey = getApiKey();

// Debug: 在 Console 印出金鑰狀態 (不會印出完整金鑰，只印前4碼)
if (apiKey) {
    console.log(`✅ API Key loaded: ${apiKey.substring(0, 4)}... (Length: ${apiKey.length})`);
} else {
    console.error("❌ API Key is MISSING or EMPTY.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

// 設定安全性閥值，避免 AI 因為故事內容(如龍、打鬥)而誤判封鎖
// 使用 BLOCK_ONLY_HIGH 代表只有非常嚴重的內容才會被擋
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// 使用更穩定的 Flash Lite 2.0 模型
const MODEL_NAME = "gemini-2.0-flash-lite-preview-02-05";

// Helper to handle API errors specifically
const handleApiError = (error: any) => {
  console.error("Gemini API Error Detail:", error);
  const msg = error.message || '';
  
  if (msg.includes('API key') || msg.includes('403')) {
    throw new Error("API Key 無效或權限不足。請檢查 services/geminiService.ts。");
  } else if (msg.includes('429')) {
    throw new Error("API 使用量已達上限 (Quota Exceeded)，請稍後再試。");
  } else if (msg.includes('404')) {
    throw new Error(`找不到模型 (${MODEL_NAME})。可能此模型在您的地區暫無法使用。`);
  } else if (msg.includes('SAFETY') || msg.includes('blocked')) {
    throw new Error("內容被 AI 安全系統阻擋 (Safety Block)。請嘗試較溫和的主題。");
  } else if (msg.includes('fetch failed')) {
    throw new Error("網路連線失敗。請檢查網路或 VPN 設定。");
  } else {
    throw new Error(`連線錯誤: ${msg.substring(0, 100)}...`);
  }
};

// Schemas for structured output (保持不變)

const vocabularySchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    definition: { type: Type.STRING, description: "Simple definition in English suitable for a 12 year old" },
    chineseDefinition: { type: Type.STRING, description: "Definition in Traditional Chinese (繁體中文). E.g. '神話的' for 'mythical'" },
    exampleSentence: { type: Type.STRING },
    chineseExample: { type: Type.STRING, description: "Translation of the example sentence in Traditional Chinese (繁體中文)" },
    pronunciation: { type: Type.STRING, description: "Simple phonetic guide" }
  },
  required: ["word", "definition", "chineseDefinition", "exampleSentence", "chineseExample", "pronunciation"]
};

const storySchema = {
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

const questionSchema = {
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

const quizSchema = {
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
  if (!apiKey) throw new Error("請先設定 API Key (在 services/geminiService.ts)");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
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
        systemInstruction: "You are an expert ESL teacher with 30 years of experience teaching 5th-7th graders. You create materials that are easy to read but educational.",
        safetySettings: safetySettings, // 加入安全性設定
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI (Content might be blocked or empty)");
    
    return JSON.parse(text) as StoryResponse;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const generateQuiz = async (topic: string): Promise<QuizResponse> => {
  if (!apiKey) throw new Error("請先設定 API Key (在 services/geminiService.ts)");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Create a 5-question multiple choice vocabulary and grammar quiz for 6th graders based on the topic: ${topic}.
      
      Requirements:
      1. Difficulty: Mixed (2 easy, 2 medium, 1 hard).
      2. Explanations: MUST be in Traditional Chinese (繁體中文) and very clear.
      3. Focus: Test understanding of context and grammar usage.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        systemInstruction: "You are a helpful quiz master for kids in Taiwan. Keep questions clear in English, but explanations in Traditional Chinese.",
        safetySettings: safetySettings,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as QuizResponse;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const correctSentence = async (sentence: string): Promise<string> => {
    if (!apiKey) throw new Error("請先設定 API Key (在 services/geminiService.ts)");
    
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `The student wrote: "${sentence}". 
            
            Task:
            1. Identify any grammar or vocabulary mistakes.
            2. If the sentence is perfect, say "Perfect! 寫得太棒了！" and give a thumbs up emoji.
            3. If there are mistakes, explain them gently in Traditional Chinese (繁體中文).
            4. Provide the corrected sentence in English.
            5. Suggest a "Better Native Way" (更道地的說法) to say it.
            
            Tone:
            Use the "Sandwich Method": Praise -> Correction -> Encouragement.
            Use emojis to be friendly (🌟, 👍, 💡).`,
            config: {
                systemInstruction: "You are a kind, supportive English tutor for kids in Taiwan. You always use Traditional Chinese to explain grammar concepts clearly and encouragingly.",
                safetySettings: safetySettings,
            }
        });
        
        return response.text || "Good job! 做得好！";
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    if (!apiKey) throw new Error("請先設定 API Key (在 services/geminiService.ts)");
    
    try {
        // Construct simplified history
        let promptContext = history.map(h => `${h.role === 'user' ? 'Student' : 'Teacher'}: ${h.text}`).join('\n');
        promptContext += `\nStudent: ${newMessage}`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Previous conversation:\n${promptContext}\n\nRespond as the Teacher.`,
            config: {
                systemInstruction: `You are "Mr. Gemini", a fun and patient English teacher with 30 years of experience.
                Target Audience: Taiwanese students (Grades 5-7, approx 11-13 years old).
                
                Core Rules:
                1. Response Length: Short! (1-3 sentences max). Don't lecture.
                2. Level: CEFR A2 (Simple words, clear grammar).
                3. Engagement: ALWAYS end with a simple question to keep the student talking.
                4. Correction Policy: 
                - If the student makes a MAJOR grammar mistake that confuses meaning, gently correct it first.
                - If it's a minor mistake, just "Recast" (repeat their idea back to them correctly) and continue the conversation.
                `,
                safetySettings: safetySettings,
            }
        });

        return response.text || "I'm listening...";
    } catch (error) {
        handleApiError(error);
        throw error;
    }
}
