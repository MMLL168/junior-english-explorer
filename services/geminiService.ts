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
      The English level should be CEFR A2/B1. 
      Include 5 interesting vocabulary words highlighted in the story.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: storySchema,
        systemInstruction: "You are an expert ESL teacher for children. You create engaging, age-appropriate content that is educational but fun."
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
      Important: The 'explanation' field must be in Traditional Chinese (繁體中文) to help the student understand.`,
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
    
    // We want a text response here, not JSON, to make it conversational
    const response = await ai.models.generateContent({
        model: modelId,
        contents: `The student wrote: "${sentence}". 
        1. If there are grammar mistakes, explain them gently in Traditional Chinese (繁體中文) so the student understands.
        2. Provide the corrected sentence in English.
        3. If it's perfect, give a compliment in English and Chinese!
        Keep the tone encouraging and friendly.`,
        config: {
            systemInstruction: "You are a kind, supportive English tutor for kids in Taiwan. You use Traditional Chinese to explain grammar concepts clearly."
        }
    });
    
    return response.text || "Good job! 做得好！";
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    const modelId = "gemini-3-flash-preview";
    if (!apiKey) throw new Error("API Key missing");
    
    // Construct simplified history for the prompt
    let promptContext = history.map(h => `${h.role === 'user' ? 'Student' : 'Teacher'}: ${h.text}`).join('\n');
    promptContext += `\nStudent: ${newMessage}`;

    const response = await ai.models.generateContent({
        model: modelId,
        contents: `Previous conversation:\n${promptContext}\n\nRespond as the Teacher.`,
        config: {
            systemInstruction: `You are a friendly, enthusiastic English conversation partner for a shy Taiwanese junior high student (approx. 12 years old). 
            Your goal is to build their confidence.
            
            Rules:
            1. Keep your responses SHORT (1-2 sentences max).
            2. Use simple vocabulary (A1/A2 level).
            3. Always end with a simple question to keep the conversation going.
            4. If the student makes a mistake, just reply with the correct natural phrasing in your response, do not explicitly correct them (e.g., if they say "I go park yesterday", you say "Oh, you went to the park yesterday? That sounds fun! Who did you go with?").
            5. Be very encouraging.`
        }
    });

    return response.text || "I'm listening...";
}