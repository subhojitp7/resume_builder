import { generateCompletion } from './aiService';

export const parseResumeText = async (
  rawText: string, 
  provider: 'openai' | 'gemini' | 'claude' = 'openai',
  file?: { mimeType: string; data: string }
) => {
  const systemPrompt = `You are an expert resume parser. Extract the following information from the provided text and return ONLY valid JSON.
Format required:
{
  "personalInfo": { "name": "", "email": "", "phone": "" },
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "skills": ["skill1", "skill2"],
  "experience": [{ "title": "", "company": "", "duration": "", "description": ["bullet point 1", "bullet point 2"] }],
  "projects": [{ "title": "", "description": ["bullet 1", "bullet 2"], "link": "" }],
  "achievements": ["achievement 1", "achievement 2"]
}`;

  return await generateCompletion(rawText, provider, systemPrompt, file);
};

export const synthesizeResume = async (
  profileData: any, 
  dailyLogs: string[], 
  jobDescription: string, 
  provider: 'openai' | 'gemini' | 'claude' = 'openai'
) => {
  const systemPrompt = `You are an expert Resume Writer optimizing for ATS systems.
Your task is to take the user's base Profile Data and their Continuous Learning Daily Logs, and synthesize them into highly impactful bullet points tailored specifically to the provided Job Description.
Use the STAR method (Situation, Task, Action, Result).
Output the result in a clean LaTeX format suitable for rendering a standard one-page resume.`;

  const prompt = `
=== JOB DESCRIPTION ===
${jobDescription}

=== USER PROFILE ===
${JSON.stringify(profileData, null, 2)}

=== DAILY LOGS (Recent Accomplishments) ===
${dailyLogs.join('\\n- ')}

Please generate the LaTeX resume source code. Do not wrap it in markdown code blocks, just return the raw LaTeX.
  `;

  return await generateCompletion(prompt, provider, systemPrompt);
};

export const scoreATS = async (
  latexResume: string, 
  jobDescription: string, 
  provider: 'openai' | 'gemini' | 'claude' = 'claude'
) => {
  const systemPrompt = `You are a strict ATS (Applicant Tracking System) simulator and expert career coach.
Review the provided LaTeX resume against the target Job Description.
Provide:
1. An ATS match score out of 100.
2. Missing keywords.
3. Specific actionable feedback on how to improve the bullet points.

Return your response in JSON format:
{
  "score": 85,
  "missingKeywords": ["Docker", "Kubernetes"],
  "feedback": ["Quantify your results in the second bullet point."]
}
`;

  const prompt = `
=== JOB DESCRIPTION ===
${jobDescription}

=== GENERATED RESUME (LaTeX) ===
${latexResume}
  `;

  return await generateCompletion(prompt, provider, systemPrompt);
};

export const recommendChanges = async (
  profileData: any, 
  dailyLogs: string[], 
  jobDescription: string, 
  provider: 'openai' | 'gemini' | 'claude' = 'gemini'
) => {
  const systemPrompt = `You are an expert Career Coach and Resume Optimizer.
Analyze the provided Job Description against the user's current Profile Data and Journal Logs.
Provide specific, actionable recommendations on what the user should add, remove, or modify in their resume to maximize their chances of getting an interview.
Instead of generating a full resume, provide 3-5 high-impact bullet points they should add to their experience or projects.
Return your response in JSON format:
{
  "generalAdvice": "Brief overall assessment...",
  "recommendedBullets": [
    { "section": "Experience", "role": "Software Engineer", "bullet": "Proposed bullet text..." }
  ],
  "skillsToAdd": ["skill1", "skill2"]
}`;

  const prompt = `
=== JOB DESCRIPTION ===
${jobDescription}

=== USER PROFILE ===
${JSON.stringify(profileData, null, 2)}

=== DAILY LOGS ===
${dailyLogs.join('\\n- ')}
  `;

  return await generateCompletion(prompt, provider, systemPrompt);
};

export const enhanceJournalLog = async (
  rawLog: string, 
  provider: 'openai' | 'gemini' | 'claude' = 'gemini'
) => {
  const systemPrompt = `You are a professional career coach and resume writer.
Your task is to take the user's raw, messy daily work log and enhance it.
Make it sound professional, action-oriented, and impactful, while keeping it concise.
Do not invent facts. Just rewrite it beautifully.
Return ONLY the enhanced text.`;

  return await generateCompletion(rawLog, provider, systemPrompt);
};
