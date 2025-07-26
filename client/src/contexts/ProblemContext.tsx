import React, { createContext, useContext, useState, ReactNode } from 'react';
import { problemService } from '../services/problemService';
import { aiService } from '../services/aiService';

interface TestCase {
  input: string;
  output: string;
  explanation: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  testCases: TestCase[];
  solutionTemplate?: string;
}

interface ValidationResult {
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

interface ProblemContextType {
  currentProblem: Problem | null;
  problems: Problem[];
  loading: boolean;
  error: string | null;
  generateProblem: (topic: string, difficulty: string, category?: string) => Promise<Problem>;
  validateSolution: (problemId: string, solutionCode: string) => Promise<ValidationResult>;
  getHint: (problemId: string, currentAttempt?: number) => Promise<string>;
  getExplanation: (problemId: string, solutionCode?: string) => Promise<any>;
  generateQuiz: (topic: string) => Promise<any>;
  getSupplementaryMaterials: (topic: string, difficulty: string) => Promise<any>;
  setCurrentProblem: (problem: Problem | null) => void;
  clearError: () => void;
}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

export const useProblem = () => {
  const context = useContext(ProblemContext);
  if (context === undefined) {
    throw new Error('useProblem must be used within a ProblemProvider');
  }
  return context;
};

interface ProblemProviderProps {
  children: ReactNode;
}

export const ProblemProvider: React.FC<ProblemProviderProps> = ({ children }) => {
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProblem = async (topic: string, difficulty: string, category?: string): Promise<Problem> => {
    setLoading(true);
    setError(null);
    try {
      const problem = await aiService.generateProblem(topic, difficulty, category);
      setCurrentProblem(problem);
      return problem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate problem';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateSolution = async (problemId: string, solutionCode: string): Promise<ValidationResult> => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiService.validateSolution(problemId, solutionCode);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate solution';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getHint = async (problemId: string, currentAttempt?: number): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const hint = await aiService.getHint(problemId, currentAttempt);
      return hint;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get hint';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getExplanation = async (problemId: string, solutionCode?: string): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const explanation = await aiService.getExplanation(problemId, solutionCode);
      return explanation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get explanation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (topic: string): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const quiz = await aiService.generateQuiz(topic);
      return quiz;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate quiz';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSupplementaryMaterials = async (topic: string, difficulty: string): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const materials = await aiService.getSupplementaryMaterials(topic, difficulty);
      return materials;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get supplementary materials';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: ProblemContextType = {
    currentProblem,
    problems,
    loading,
    error,
    generateProblem,
    validateSolution,
    getHint,
    getExplanation,
    generateQuiz,
    getSupplementaryMaterials,
    setCurrentProblem,
    clearError,
  };

  return (
    <ProblemContext.Provider value={value}>
      {children}
    </ProblemContext.Provider>
  );
}; 