
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectInfo, Room, PriceItem } from "../types";

/**
 * Generates a cover letter for the quote.
 * Tasks involving basic text generation use 'gemini-3-flash-preview'.
 */
export const generateQuoteCoverLetter = async (
  projectInfo: ProjectInfo,
  rooms: Room[],
  totalPrice: number,
  priceBook: PriceItem[]
): Promise<string> => {
  try {
    // Initialiseer de AI vlak voor gebruik om de meest actuele API-sleutel te pakken
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let workSummary = "";
    rooms.forEach(room => {
      if (room.tasks.length > 0) {
        workSummary += `\nRuimte: ${room.name}\n`;
        room.tasks.forEach(task => {
          const priceItem = priceBook.find(p => p.id === task.priceItemId);
          if (priceItem) {
            workSummary += `- ${priceItem.name}: ${task.quantity} ${priceItem.unit}\n`;
          }
        });
      }
    });

    const prompt = `
      Je bent een professionele aannemer bij een bedrijf dat werkt met Microsoft Dynamics. 
      Schrijf een korte, zakelijke begeleidende brief voor klant ${projectInfo.clientName}.
      Referentie: ${projectInfo.workNumber}.
      Adres: ${projectInfo.address}.
      Totaalbedrag: €${totalPrice.toFixed(2)}.
      Focus op professionaliteit en de geplande werkzaamheden: ${workSummary}.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    // Directly access .text property as per @google/genai guidelines
    return response.text || "Kon geen tekst genereren.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Brief generator tijdelijk niet beschikbaar. Controleer of de API_KEY in Netlify is ingesteld.";
  }
};

/**
 * Converts input text or image to a list of PriceItems.
 * Tasks involving advanced reasoning and JSON extraction use 'gemini-3-pro-preview'.
 */
export const convertInputToPriceItems = async (textInput: string, imageBase64?: string): Promise<PriceItem[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Extraheer bouw-items naar JSON: ${textInput}`;
    let contents: any;
    
    if (imageBase64) {
      const data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      const imagePart = { inlineData: { mimeType: "image/jpeg", data } };
      const textPart = { text: prompt };
      contents = { parts: [imagePart, textPart] };
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING },
              name: { type: Type.STRING },
              unit: { type: Type.STRING },
              priceLabor: { type: Type.NUMBER },
              priceMaterial: { type: Type.NUMBER },
              vatLabor: { type: Type.STRING },
              vatMaterial: { type: Type.STRING }
            },
            required: ["id", "category", "name", "unit", "priceLabor", "priceMaterial", "vatLabor", "vatMaterial"]
          }
        }
      }
    });
    // Directly access .text property as per @google/genai guidelines
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Analyse Error:", error);
    throw new Error("AI Analyse mislukt.");
  }
};
