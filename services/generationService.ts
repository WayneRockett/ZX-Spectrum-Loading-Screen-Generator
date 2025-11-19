
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SPECTRUM_PALETTE_HEX } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Custom error class for API quota exceeded
export class QuotaExceededError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QuotaExceededError';
    }
}

const GEMINI_PROMPT_REWRITER_PROMPT = `
You are an expert prompt engineer for a text-to-image AI. Your task is to rewrite a user's simple description into a detailed, artistic prompt that will generate an image in the style of a 1980s ZX Spectrum loading screen.

Follow these rules strictly:
1.  The art style must be described as: '8-bit pixel art, chunky pixels, retro video game loading screen, no anti-aliasing, no modern shading, clean lines, dithered shading'.
2.  The prompt MUST explicitly command the AI to use ONLY the following 15-color palette, listing the hex codes: ZX Spectrum palette (${SPECTRUM_PALETTE_HEX.join(', ')}).
3.  Expand upon the user's concept with evocative details fitting a classic 80s computer game theme (e.g., fantasy, sci-fi, sports). Think of game developers like Ultimate Play the Game, Ocean, or Imagine Software.
4.  The final output should be ONLY the rewritten prompt, with no additional commentary or explanation.

User's description:
"{USER_PROMPT}"
`;

export async function rewritePrompt(userPrompt: string): Promise<string> {
    const prompt = GEMINI_PROMPT_REWRITER_PROMPT.replace('{USER_PROMPT}', userPrompt);

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error: any) {
        // Check if it's a 429 error (quota exceeded)
        if (error?.error?.code === 429 || error?.status === 429 || 
            (error?.message && error.message.includes('quota')) ||
            (error?.message && error.message.includes('RESOURCE_EXHAUSTED'))) {
            throw new QuotaExceededError('API quota exceeded. Please try again later.');
        }
        throw error;
    }
}

export async function generateImage(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '4:3',
            },
        });

        const base64ImageBytes: string | undefined = response.generatedImages[0]?.image.imageBytes;

        if (!base64ImageBytes) {
            throw new Error("Image generation failed, no image data received.");
        }
        
        return base64ImageBytes;
    } catch (error: any) {
        // Check if it's a 429 error (quota exceeded)
        if (error?.error?.code === 429 || error?.status === 429 || 
            (error?.message && error.message.includes('quota')) ||
            (error?.message && error.message.includes('RESOURCE_EXHAUSTED'))) {
            throw new QuotaExceededError('API quota exceeded. Please try again later.');
        }
        throw error;
    }
}
