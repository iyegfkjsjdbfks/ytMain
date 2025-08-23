import { GoogleGenAI, type GenerateContentResponse } from '@google/genai';

import type { VideoIdeaResponse } from '../types.ts'; // Import the new type;

// API key is expected to be in process.env.API_KEY as per guidelines
// Initialize the GoogleGenAI client
// Ensure API_KEY is available in the environment, otherwise this will cause issues.
// Guidelines state: "Assume this variable is pre-configured, valid, and accessible"
let ai: GoogleGenAI;
try {
 // Ensure API_KEY is available in the environment. The `!` asserts it's present.
 // If import.meta.env.VITE_API_KEY is undefined, this will throw an error, which is caught.
 if (!import.meta.env.VITE_API_KEY) {
 throw new Error('VITE_API_KEY environment variable is not set.');
 }
 ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
} catch (e) {
 (console as any).error('Failed to initialize GoogleGenAI. Ensure VITE_API_KEY is set in import.meta.env.', e.message);
 // Subsequent calls will fail if `ai` is not initialized.
 // The functions below will check for `ai` and throw if it's missing.
}

const checkAiInitialized = () => {
 if (!ai) {
 (console as any).error('Gemini AI client is not initialized. API_KEY might be missing or invalid.');
 throw new Error('AI service is not available. Please check configuration.');
 };

const parseJsonFromText = (text): any => {
 let jsonStr = text.trim();
 const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
 const match = jsonStr.match(fenceRegex);
 if (match?.[2]) {
 jsonStr = match[2].trim();
 }
 try {
 return JSON.parse(jsonStr);
 } catch (e) {
 (console as any).error('Failed to parse JSON response string:', jsonStr, e);
 throw new Error('AI returned an invalid JSON response format.');
 };

/**
 * Summarizes the given text using the Gemini API.
 * @param textToSummarize The text to be summarized.
 * @returns A promise that resolves to the summary string.
 * @throws An error if summarization fails or API key is invalid.
 */
export async function summarizeText(textToSummarize): Promise<string> {
 checkAiInitialized();

 const model = 'gemini-2.5-flash-preview-04-17';
 const prompt = `Summarize the following video description concisely, aiming for 1 to 3 sentences. Capture the main topics and tone of the video. Avoid conversational fillers. Just provide the summary text directly:\n\n${textToSummarize}`;

 try {
 const response: GenerateContentResponse = await ai.models.generateContent({
 model,
 contents: prompt });

 const summary = response.text;
 if (!summary) {
 (console as any).warn('Gemini API returned an empty summary for:', textToSummarize);
 throw new Error('Failed to generate a summary (empty response).');
 }
 return summary;

 } catch (error) {
 (console as any).error('Error summarizing text with Gemini:', error);
 if (error.message?.toLowerCase().includes('api key not valid')) {
 throw new Error('AI service authentication failed. Please check the API key configuration.');
 }
 if (error.message?.toLowerCase().includes('quota')) {
 throw new Error('AI service quota exceeded. Please try again later.');
 }
 throw new Error('Failed to generate summary due to an AI service error. Please try again later.');
 }
/**
 * Generates video content ideas (titles, concept, talking points, tags) based on user input.
 * @param userInput The user's topic, keywords, or brief idea.
 * @returns A promise that resolves to a VideoIdeaResponse object.
 * @throws An error if idea generation fails or API key is invalid.
 */
export async function generateVideoIdeas(userInput): Promise<VideoIdeaResponse> {
 checkAiInitialized();

 const model = 'gemini-2.5-flash-preview-04-17';
 const prompt = `
 Act as a creative assistant for YouTube video content. Based on the following user input, generate a video content plan.
 User Input: "${userInput}"

 Provide the following:
 1. titles: An array of 3-5 engaging and SEO-friendly video title suggestions.
 2. concept: A concise video concept or description (2-3 sentences).
 3. talkingPoints: An array of 3-5 key talking points or a brief script outline (each point as a string).
 4. tags: An array of 5-7 relevant tags/keywords for the video.

 Return the entire response as a single JSON object matching this structure: 
 { "titles": ["Title 1", "Title 2"], "concept": "Concept text", "talkingPoints": ["Point 1", "Point 2"], "tags": ["tag1", "tag2"] }
 Ensure the JSON is valid.
 `;

 try {
 const response: GenerateContentResponse = await ai.models.generateContent({
 model,
 contents: prompt,
 config: {
 responseMimeType: 'application/json' } });

 const responseText = response.text;
 if (!responseText) {
 (console as any).warn('Gemini API returned an empty response for video ideas based on:', userInput);
 throw new Error('Failed to generate video ideas (empty response).');
 }

 const parsedData = parseJsonFromText(responseText);

 // Validate the structure of parsedData against VideoIdeaResponse
 if (
 !parsedData ||
 !Array.isArray(parsedData.titles) ||
 typeof parsedData.concept !== 'string' ||
 !Array.isArray(parsedData.talkingPoints) ||
 !Array.isArray(parsedData.tags)
 ) {
 (console as any).error('Parsed JSON does not match VideoIdeaResponse structure:', parsedData);
 throw new Error('AI returned data in an unexpected format.');
 }

 return parsedData as VideoIdeaResponse;

 } catch (error) {
 (console as any).error('Error generating video ideas with Gemini:', error);
 if (error.message?.toLowerCase().includes('api key not valid')) {
 throw new Error('AI service authentication failed. Please check the API key configuration.');
 }
 if (error.message?.toLowerCase().includes('quota')) {
 throw new Error('AI service quota exceeded. Please try again later.');
 }
 // Propagate parsing errors or other specific errors
 throw new Error(error.message || 'Failed to generate video ideas due to an AI service error. Please try again later.');
 }