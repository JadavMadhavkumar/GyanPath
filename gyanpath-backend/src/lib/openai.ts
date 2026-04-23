import OpenAI from 'openai';
import { config } from '../config';

let openaiInstance: OpenAI | null = null;

/**
 * Get OpenAI instance
 */
export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  return openaiInstance;
}

export default getOpenAI;
