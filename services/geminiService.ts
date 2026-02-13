
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Always use the standard initialization format with named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDynamicDreamInterpretation = async (userPrompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Berikan tafsir mimpi untuk: "${userPrompt}". 
      Format dalam JSON dengan struktur: 
      {
        "judul": "string",
        "ringkasan": "string",
        "tafsir_positif": "string",
        "tafsir_negatif": "string",
        "angka": "string (3 angka unik)",
        "kategori": "string"
      }
      Bahasa: Indonesia. Nuansa: Mistis, Bijak, Berwibawa.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            judul: { type: Type.STRING },
            ringkasan: { type: Type.STRING },
            tafsir_positif: { type: Type.STRING },
            tafsir_negatif: { type: Type.STRING },
            angka: { type: Type.STRING },
            kategori: { type: Type.STRING }
          },
          required: ["judul", "ringkasan", "tafsir_positif", "tafsir_negatif", "angka", "kategori"]
        }
      }
    });

    // Fix: response.text is a getter property, do not call as a function
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const getDailyZodiacFortune = async (zodiac: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Berikan ramalan harian untuk zodiak ${zodiac}. 
      Format JSON: { "deskripsi": "...", "cinta": "...", "karir": "...", "keuangan": "..." }. 
      Bahasa: Indonesia. Singkat dan menarik.`,
      config: {
        responseMimeType: "application/json",
        // Fix: Added responseSchema for more reliable structured output
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deskripsi: { type: Type.STRING },
            cinta: { type: Type.STRING },
            karir: { type: Type.STRING },
            keuangan: { type: Type.STRING }
          },
          required: ["deskripsi", "cinta", "karir", "keuangan"]
        }
      }
    });
    // Fix: response.text is a getter property
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error (Zodiac):", error);
    return null;
  }
};
