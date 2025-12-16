import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found via process.env.API_KEY");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a professional job description based on title and basic keywords.
 */
export const generateJobDescription = async (title: string, keywords: string, companyName: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Erro: API Key não configurada. Por favor, escreva a descrição manualmente.";

  try {
    const prompt = `
      Atue como um recrutador experiente de RH.
      Escreva uma descrição de vaga de emprego atraente e profissional para o cargo de "${title}" na empresa "${companyName}".
      
      Inclua as seguintes seções:
      1. Sobre a oportunidade (intro cativante)
      2. Responsabilidades (lista com bullets)
      3. Requisitos (baseado nestas palavras-chave: ${keywords})
      
      Mantenha o tom profissional mas convidativo. Formate a resposta em Markdown simples.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a descrição.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao gerar descrição com IA. Tente novamente mais tarde.";
  }
};

/**
 * Analyzes a candidate match for a specific job (Mock functionality using AI for demo).
 */
export const analyzeCandidateMatch = async (candidateSkills: string[], jobRequirements: string[]): Promise<{ score: number; reason: string }> => {
    const ai = getAiClient();
    // Fallback if no API key
    if (!ai) return { score: 75, reason: "Análise de IA indisponível (Mock: Compatibilidade baseada em palavras-chave)." };

    try {
        const prompt = `
            Compare as seguintes habilidades de um candidato com os requisitos da vaga e dê uma nota de 0 a 100 de compatibilidade e uma justificativa breve (máximo 1 frase).
            
            Habilidades do Candidato: ${candidateSkills.join(', ')}
            Requisitos da Vaga: ${jobRequirements.join(', ')}
            
            Responda APENAS em JSON no formato: { "score": number, "reason": "string" }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const text = response.text || "{}";
        return JSON.parse(text);

    } catch (error) {
        return { score: 0, reason: "Erro na análise." };
    }
}