import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function list() {
  try {
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
    // Note: listModels is often an async iteration or a direct call depending on version
    // In newer SDKs it might be under a specific client, but let's try the standard method
    const result = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).listModels();
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Error listing models:', e.message);
  }
}
list();
