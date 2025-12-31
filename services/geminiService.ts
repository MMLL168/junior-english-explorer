import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { StoryResponse, QuizResponse, VocabularyWord, QuizQuestion, ChatMessage, ListeningChallenge } from "../types";

// Key for local storage
export const STORAGE_KEY = 'JE_GEMINI_API_KEY';

// 取得 API Key 的函式 (動態取得)
const getApiKey = () => {
  // 1. 優先從瀏覽器 LocalStorage 讀取 (這是給 GitHub Pages 使用的最佳解法)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  }

  // 2. 嘗試從 Vite 環境變數讀取 (本地開發用)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
    return (import.meta as any).env.VITE_API_KEY;
  }
  
  return '';
};

// 儲存 Key 到 LocalStorage
export const saveApiKeyToStorage = (key: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, key.trim());
        // 強制重新整理頁面以套用新 Key
        window.location.reload();
    }
}

// 清除 Key
export const removeApiKeyFromStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }
}

// 檢查是否有 Key
export const hasValidKey = () => {
    return !!getApiKey();
}

// 設定安全性閥值
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// Switch to Gemini 3.0 Flash
const MODEL_NAME = "gemini-3-flash-preview";

// 動態建立 AI 實例 (避免 Key 更新後還用舊的)
const getAIClient = () => {
    const key = getApiKey();
    if (!key) {
        throw new Error("API Key 未設定。請點擊右上角的設定按鈕輸入金鑰。");
    }
    return new GoogleGenAI({ apiKey: key });
};

// 新增：驗證 API Key 是否有效
export const verifyApiKey = async (key: string): Promise<boolean> => {
    try {
        const ai = new GoogleGenAI({ apiKey: key });
        // 嘗試產生一個極短的回應來測試連線
        await ai.models.generateContent({
            model: MODEL_NAME,
            contents: "Hi",
        });
        return true;
    } catch (error) {
        console.error("API Verification Failed:", error);
        return false;
    }
};

const handleApiError = (error: any) => {
  console.error("Gemini API Error Detail:", error);
  const msg = error.message || '';
  
  if (msg.includes('API key') || msg.includes('403')) {
    // 如果 Key 無效，自動清除，讓使用者重新輸入
    // removeApiKeyFromStorage(); // Optional: 自動登出
    throw new Error("API Key 無效或已被 Google 封鎖。請確認您的金鑰是否正確，或是否不小心外洩了。");
  } else if (msg.includes('429')) {
    throw new Error("目前使用人數過多 (Quota Exceeded)，請休息 30 秒後再試。");
  } else if (msg.includes('404')) {
    throw new Error(`找不到模型 (${MODEL_NAME})。您的 Key 可能不支援此模型。`);
  } else if (msg.includes('SAFETY') || msg.includes('blocked')) {
    throw new Error("內容被 AI 安全系統阻擋，請嘗試較溫和的主題。");
  } else if (msg.includes('fetch failed')) {
    throw new Error("網路連線失敗。請檢查網路狀況。");
  } else {
    throw new Error(`連線錯誤: ${msg.substring(0, 80)}...`);
  }
};

// --- Service Methods ---

export const generateStory = async (topic: string): Promise<StoryResponse> => {
  try {
    const ai = getAIClient();
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
        // @ts-ignore
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                summary: { type: Type.STRING },
                vocabulary: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        definition: { type: Type.STRING },
                        chineseDefinition: { type: Type.STRING },
                        exampleSentence: { type: Type.STRING },
                        chineseExample: { type: Type.STRING },
                        pronunciation: { type: Type.STRING }
                    }
                }
                }
            }
        },
        systemInstruction: "You are an expert ESL teacher.",
        safetySettings: safetySettings,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as StoryResponse;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const generateQuiz = async (topic: string): Promise<QuizResponse> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Create a 5-question multiple choice quiz about: ${topic}.
      Requirements: Mixed difficulty, clear English, Traditional Chinese explanations.`,
      config: {
        responseMimeType: "application/json",
        // @ts-ignore
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                topic: { type: Type.STRING },
                questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswerIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING }
                    }
                }
                }
            }
        },
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
    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `The student wrote: "${sentence}". Identify mistakes, explain in Traditional Chinese, and provide a corrected version. Be encouraging.`,
            config: {
                safetySettings: safetySettings,
            }
        });
        return response.text || "Good job!";
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    try {
        const ai = getAIClient();
        let promptContext = history.map(h => `${h.role === 'user' ? 'Student' : 'Teacher'}: ${h.text}`).join('\n');
        promptContext += `\nStudent: ${newMessage}`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Previous conversation:\n${promptContext}\n\nRespond as the Teacher (Mr. Gemini). Keep it short (1-2 sentences), encouraging, CEFR A2 level.`,
            config: {
                safetySettings: safetySettings,
            }
        });
        return response.text || "...";
    } catch (error) {
        handleApiError(error);
        throw error;
    }
}

export const generateListeningChallenge = async (topic: string): Promise<ListeningChallenge> => {
    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Create a listening comprehension script and quiz for Grade 6-7 students about: ${topic}.
            
            Requirements:
            1. Script: A monologue or dialogue (approx 100-150 words). CEFR A2/B1 level. Natural spoken English style.
            2. Questions: 3 multiple choice questions based on the script.
            3. Explanation: Traditional Chinese explanations.`,
            config: {
                responseMimeType: "application/json",
                // @ts-ignore
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topic: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                        script: { type: Type.STRING },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    correctAnswerIndex: { type: Type.INTEGER },
                                    explanation: { type: Type.STRING }
                                }
                            }
                        }
                    }
                },
                safetySettings: safetySettings,
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("No response from AI");
        return JSON.parse(text) as ListeningChallenge;
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const generateVocabularyList = async (level: string): Promise<VocabularyWord[]> => {
    try {
        const ai = getAIClient();
        let prompt = "";
        
        if (level === '1000') {
            prompt = "Pick 5 distinct, useful English words from the standard 'Basic 1000 English Words' list (CEFR A1/A2). Suitable for elementary students.";
        } else if (level === '2000') {
            prompt = "Pick 5 distinct, useful English words from the '2000 Common English Words' list (CEFR A2/B1). Suitable for junior high students.";
        } else {
            prompt = "Pick 5 distinct, challenging English words from the '3000 Common English Words' list (CEFR B1). Suitable for advanced junior high students.";
        }

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `${prompt}
            
            Output Requirements:
            Provide a JSON array containing 5 vocabulary objects.
            Each object must have: word, definition (simple English), chineseDefinition, exampleSentence (simple), chineseExample, pronunciation (IPA).`,
            config: {
                responseMimeType: "application/json",
                // @ts-ignore
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            word: { type: Type.STRING },
                            definition: { type: Type.STRING },
                            chineseDefinition: { type: Type.STRING },
                            exampleSentence: { type: Type.STRING },
                            chineseExample: { type: Type.STRING },
                            pronunciation: { type: Type.STRING }
                        }
                    }
                },
                safetySettings: safetySettings,
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        return JSON.parse(text) as VocabularyWord[];
    } catch (error) {
        handleApiError(error);
        throw error;
    }
}
