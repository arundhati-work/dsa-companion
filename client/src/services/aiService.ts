import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  testCases: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  solutionTemplate?: string;
}

export interface ValidationResult {
  isCorrect: boolean;
  passedTests: number;
  totalTests: number;
  errors: string[];
  suggestions: string[];
  timeComplexity: string;
  spaceComplexity: string;
  canBeOptimized: boolean;
  optimizationHints: string[];
}

export interface HintResponse {
  hint: string;
  hintLevel: 'subtle' | 'moderate' | 'detailed';
  nextStep: string;
}

export const aiService = {
  async generateProblem(topic: string, difficulty: string, category?: string): Promise<Problem> {
    const response = await api.post('/ai/generate-problem', {
      topic,
      difficulty,
      category,
    });
    return response.data.data;
  },

  async validateSolution(problemId: string, solutionCode: string, language?: string): Promise<ValidationResult> {
    const response = await api.post('/ai/validate-solution', {
      problemId,
      solutionCode,
      language: language || 'javascript',
    });
    return response.data.data;
  },

  async getHint(problemId: string, currentAttempt?: number): Promise<string> {
    const response = await api.post('/ai/hint', {
      problemId,
      currentAttempt,
    });
    return response.data.data.hint;
  },

  async getExplanation(problemId: string, solutionCode?: string): Promise<any> {
    const response = await api.post('/ai/explanation', {
      problemId,
      solutionCode,
    });
    return response.data.data;
  },

  async generateQuiz(topic: string): Promise<any> {
    const response = await api.post('/ai/quiz', {
      topic,
    });
    return response.data.data;
  },

  async getSupplementaryMaterials(topic: string, difficulty: string): Promise<any> {
    const response = await api.post('/ai/supplementary', {
      topic,
      difficulty,
    });
    return response.data.data;
  },
}; 