import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TrafficComparisonInfo } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY de Gemini no encontrada. Asegúrate de que la variable de entorno process.env.API_KEY está configurada.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const parseGeminiResponse = (responseText: string): TrafficComparisonInfo[] => {
    let jsonStr = responseText.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }
    
    try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
            // Se podría añadir una validación más estricta aquí para asegurar la estructura de los objetos
            return parsed;
        }
        console.error("Fallo al parsear la respuesta de Gemini: El JSON no es un array.", responseText);
        return [];
    } catch (e) {
        console.error("Fallo al parsear la respuesta JSON de Gemini:", e);
        console.error("Respuesta recibida:", responseText);
        return [];
    }
};

export const getTrafficInfo = async (origin: string, destination: string): Promise<TrafficComparisonInfo[]> => {
    const prompt = `
      Actúa como un sistema experto de análisis de tráfico en tiempo real para Madrid, España.
      Para la ruta desde el origen "${origin}" hasta el destino "${destination}", proporciona un análisis comparativo del tráfico utilizando las principales vías de circunvalación: M-30, M-40 y M-45, además de la ruta óptima recomendada por defecto.

      Basa tu respuesta en datos de tráfico simulados de fuentes públicas y en tiempo real como la DGT, el Ayuntamiento de Madrid, Google Maps y Waze para la hora actual.

      Devuelve la información en un formato JSON estricto. No incluyas explicaciones, markdown, ni ningún texto fuera del objeto JSON.

      La estructura del JSON debe ser un array de objetos, donde cada objeto representa una opción de ruta:
      [
        {
          "via": "string (ej. 'Ruta Óptima', 'Vía M-30', 'Vía M-40', 'Vía M-45')",
          "estimatedTime": "string (ej. '35 minutos')",
          "distance": "string (ej. '25 km')",
          "incidents": ["string (descripción de la incidencia 1)"],
          "detailedExplanation": "string (descripción detallada y paso a paso de la ruta, ej: 'Toma la Av. de Oporto hacia la A-42, luego coge la salida hacia la M-30...')"
        }
      ]

      - Incluye siempre la "Ruta Óptima", que puede coincidir o no con una de las vías de circunvalación.
      - Incluye un objeto para cada una de las vías M-30, M-40 y M-45 solo si son alternativas lógicas y razonables para el trayecto. Si una vía no es una alternativa viable (por ejemplo, usar la M-45 para un viaje corto dentro del centro), omite ese objeto del array.
      - Si no hay incidencias en una ruta, devuelve un array vacío para "incidents".
      - La "detailedExplanation" debe ser una guía clara y concisa para el conductor.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const parsedData = parseGeminiResponse(response.text);
        return parsedData;

    } catch (error) {
        console.error("Error al contactar con la API de Gemini:", error);
        return [];
    }
};
