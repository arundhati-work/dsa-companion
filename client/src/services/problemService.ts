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
  createdAt: string;
  updatedAt: string;
}

export interface ProblemsResponse {
  data: Problem[];
  pagination: {
    limit: number;
    offset: number;
  };
}

export const problemService = {
  async getProblems(params?: {
    difficulty?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<ProblemsResponse> {
    const response = await api.get('/problems', { params });
    return response.data;
  },

  async getProblemById(id: string): Promise<Problem> {
    const response = await api.get(`/problems/${id}`);
    return response.data.data;
  },

  async createProblem(data: {
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
  }): Promise<Problem> {
    const response = await api.post('/problems', data);
    return response.data.data;
  },

  async updateProblem(id: string, data: Partial<{
    title: string;
    description: string;
    difficulty: string;
    category: string;
    testCases: Array<{
      input: string;
      output: string;
      explanation: string;
    }>;
    solutionTemplate: string;
  }>): Promise<void> {
    await api.put(`/problems/${id}`, data);
  },

  async deleteProblem(id: string): Promise<void> {
    await api.delete(`/problems/${id}`);
  },
}; 