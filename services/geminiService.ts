
import { GoogleGenAI, Type } from "@google/genai";
import type { FaqItem } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const faqSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "A pergunta frequente sobre o produto."
      },
      answer: {
        type: Type.STRING,
        description: "A resposta clara e concisa para a pergunta."
      },
    },
    required: ["question", "answer"],
  },
};

export const generateFaqsFromImage = async (base64Image: string, mimeType: string): Promise<FaqItem[]> => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: `Analise a imagem deste produto. Imagine que esta imagem será usada em um anúncio de marketplace. Crie uma lista de exatamente 40 perguntas frequentes (FAQs) com respostas detalhadas e úteis que um cliente em potencial faria sobre este produto. As perguntas devem cobrir especificações, uso, manutenção, compatibilidade, garantia e outros detalhes relevantes. As respostas devem ser claras, concisas e escritas de forma profissional e amigável.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: faqSchema,
        temperature: 0.5,
      }
    });

    const jsonText = response.text.trim();
    const faqs = JSON.parse(jsonText);

    if (!Array.isArray(faqs) || faqs.length === 0) {
      throw new Error('A resposta da API não continha um array de FAQs válido.');
    }

    return faqs as FaqItem[];

  } catch (error) {
    console.error("Erro ao gerar FAQs:", error);
    throw new Error('Falha ao comunicar com a API do Gemini. Verifique o console para mais detalhes.');
  }
};
