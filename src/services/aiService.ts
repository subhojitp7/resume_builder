import { useSettingsStore } from '../store/useSettingsStore';

type ModelProvider = 'openai' | 'gemini' | 'claude';

export interface AIResponse {
  content: string;
  error?: string;
}

export interface AIFile {
  mimeType: string;
  data: string; // base64 string
}

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, delay = 1500): Promise<Response> => {
  try {
    const res = await fetch(url, options);
    // Retry on 503 Service Unavailable / High Demand or 429 Too Many Requests
    if ((res.status === 503 || res.status === 429) && retries > 0) {
      console.warn(`Gemini API returned ${res.status}. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      console.warn(`Fetch error occurred. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw err;
  }
};

export const generateCompletion = async (
  prompt: string, 
  provider: ModelProvider = 'openai', 
  systemPrompt?: string,
  file?: AIFile
): Promise<AIResponse> => {
  const { openAiKey, geminiKey, claudeKey } = useSettingsStore.getState();

  try {
    if (provider === 'openai') {
      if (!openAiKey) throw new Error('OpenAI API Key is missing');
      
      const response = await fetch('/api/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) throw new Error(`OpenAI Error: ${response.statusText}`);
      const data = await response.json();
      return { content: data.choices[0].message.content };
    }

    if (provider === 'gemini') {
      if (!geminiKey) throw new Error('Google Gemini API Key is missing');

      const parts: any[] = [{ text: prompt }];
      if (file) {
        parts.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.data
          }
        });
      }

      // Using Gemini 3.5 Flash
      const response = await fetchWithRetry(`/api/gemini/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
          contents: [{ parts }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error (${response.status} ${response.statusText}): ${errText}`);
      }
      
      const data = await response.json();
      return { content: data.candidates[0].content.parts[0].text };
    }

    if (provider === 'claude') {
      if (!claudeKey) throw new Error('Claude API Key is missing');
      
      const response = await fetch('/api/anthropic/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) throw new Error(`Claude Error: ${response.statusText}`);
      const data = await response.json();
      return { content: data.content[0].text };
    }

    throw new Error('Unsupported provider');
  } catch (err: any) {
    console.error('AI Service Error:', err);
    return { content: '', error: err.message || 'An unknown error occurred' };
  }
};
