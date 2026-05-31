# Resume AI Builder ✦

An intelligent, AI-powered Resume Builder that uses Google's Gemini API to analyze your profile, extract data from existing resumes, and provide high-impact ATS recommendations tailored to specific job descriptions. 

Built with React, Vite, TypeScript, and Monaco Editor for a seamless LaTeX compilation workflow.

## 🚀 Features

* **Master Profile:** A central hub (single source of truth) for your personal information, skills, education, experience, and projects. 
* **AI Parsing Engine:** Upload your existing PDF resume or paste plain text. The AI automatically parses and structures your details into the Master Profile.
* **Learning Journal:** A daily log to record your accomplishments, new skills, and milestones. The AI uses this context when tailoring your resume.
* **Job Match Analyzer:** Paste a job link or description. The AI engine evaluates your current LaTeX resume to generate an ATS Match Score, identifies missing keywords, and recommends highly specific bullet points to add based on your Master Profile and Learning Journal.
* **LaTeX Workspace:** A clean, VS-Code style editor (powered by Monaco) to tweak your LaTeX source code and compile the final PDF.
* **Local Persistence:** All your profile data, logs, and ATS history are safely stored in your browser's local storage.

## 🧠 Model Architecture & AI Integration

This application leverages the **Gemini 2.5 Flash** model via the new `@google/genai` SDK. The AI integration is structured around a "Multi-Agent" pattern located in `src/services/resumeAgents.ts`.

### 1. Data Parsing Agent (`parseResumeText`)
* **Input:** Raw text or Base64 encoded PDF data.
* **Function:** Uses Gemini 2.5 Flash's multimodal capabilities to read the document and extract structured JSON matching the application's internal data models (`Education`, `Experience`, `Project`, etc.).
* **Prompting:** Forces strict JSON output schema to ensure predictable UI updates.

### 2. ATS Scoring Agent (`scoreATS`)
* **Input:** The user's current LaTeX source code and a target Job Description.
* **Function:** Acts as an Applicant Tracking System. It calculates a match score (0-100), identifies missing keywords from the job description, and provides actionable feedback on formatting and content.

### 3. Recommendation Engine (`recommendChanges`)
* **Input:** The user's clean Master Profile data, raw Learning Journal logs, and the target Job Description.
* **Function:** This is the core intelligence of the app. Instead of blindly overriding the user's carefully crafted LaTeX code, this agent acts as an advisor. It analyzes the user's unformatted history (profile + journal) against the job requirements and outputs:
  * Missing technical skills to highlight.
  * Highly specific, quantifiable bullet points tailored *exactly* to what the employer is looking for.
  * General strategic advice.

## 🛠️ Technology Stack

* **Frontend Framework:** React 18 with Vite
* **Language:** TypeScript
* **State Management:** Zustand (with `persist` middleware for LocalStorage)
* **Styling:** Vanilla CSS with custom glassmorphism design system
* **Icons:** Lucide React
* **Editor:** `@monaco-editor/react`
* **AI API:** `@google/genai` (Gemini)

## 📦 Getting Started

1. **Clone the repository**
2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`
3. **Configure API Key:**
   Create a `.env` file in the root directory and add your Gemini API key:
   \`\`\`env
   VITE_GEMINI_API_KEY=your_api_key_here
   \`\`\`
4. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`
5. **Open your browser** to \`http://localhost:5173\`
