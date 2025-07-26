import { Request, Response } from 'express';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../utils/database';

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

const getOpenAI = (): OpenAI => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

// Helper function to promisify database operations
const dbGet = (query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (query: string, params: any[] = []): Promise<{ changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
};

export const generateProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, difficulty, category } = req.body;
    
    if (!topic || !difficulty) {
      res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
      return;
    }
    
    const prompt = `Generate a ${difficulty} difficulty Data Structures and Algorithms problem about ${topic}. 
    The response should be in JSON format with the following structure:
    {
      "title": "Problem Title",
      "description": "Detailed problem description with examples",
      "difficulty": "${difficulty}",
      "category": "${category || 'General'}",
      "testCases": [
        {
          "input": "input description",
          "output": "expected output",
          "explanation": "brief explanation"
        }
      ],
      "solutionTemplate": "function solution(input) { // TODO: implement solution }",
      "hints": ["hint 1", "hint 2"],
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)"
    }`;
    
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      res.status(500).json({ success: false, error: 'Failed to generate problem' });
      return;
    }
    
    let problemData;
    try {
      problemData = JSON.parse(response);
    } catch (parseError) {
      res.status(500).json({ success: false, error: 'Invalid problem format generated' });
      return;
    }
    
    // Save to database
    const id = uuidv4();
    const testCasesJson = JSON.stringify(problemData.testCases);
    
    await dbRun(
      'INSERT INTO problems (id, title, description, difficulty, category, test_cases, solution_template) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, problemData.title, problemData.description, problemData.difficulty, problemData.category, testCasesJson, problemData.solutionTemplate]
    );
    
    res.json({
      success: true,
      data: {
        id,
        ...problemData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const validateSolution = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId, solutionCode, language = 'javascript' } = req.body;
    
    if (!problemId || !solutionCode) {
      res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
      return;
    }
    
    // Get problem details
    const problem = await dbGet('SELECT * FROM problems WHERE id = ?', [problemId]);
    
    if (!problem) {
      res.status(404).json({ success: false, error: 'Problem not found' });
      return;
    }
    
    const testCases = JSON.parse(problem.test_cases);
    
    // Create validation prompt
    const prompt = `Validate this ${language} solution for the following problem:
    
    Problem: ${problem.description}
    
    Solution Code:
    ${solutionCode}
    
    Test Cases:
    ${JSON.stringify(testCases, null, 2)}
    
    Please analyze the solution and provide a JSON response with:
    {
      "isCorrect": true/false,
      "passedTests": number,
      "totalTests": number,
      "errors": ["error1", "error2"],
      "suggestions": ["suggestion1", "suggestion2"],
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "canBeOptimized": true/false,
      "optimizationHints": ["hint1", "hint2"]
    }`;
    
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      res.status(500).json({ success: false, error: 'Failed to validate solution' });
      return;
    }
    
    let validationResult;
    try {
      validationResult = JSON.parse(response);
    } catch (parseError) {
      res.status(500).json({ success: false, error: 'Invalid validation response' });
      return;
    }
    
    res.json({
      success: true,
      data: validationResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getHint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId, currentAttempt } = req.body;
    
    if (!problemId) {
      res.status(400).json({ 
        success: false, 
        error: 'Missing problem ID' 
      });
      return;
    }
    
    const problem = await dbGet('SELECT * FROM problems WHERE id = ?', [problemId]);
    
    if (!problem) {
      res.status(404).json({ success: false, error: 'Problem not found' });
      return;
    }
    
    const prompt = `Provide a helpful hint for this problem. This is attempt number ${currentAttempt || 1}, so adjust the hint accordingly:
    
    Problem: ${problem.description}
    Difficulty: ${problem.difficulty}
    Category: ${problem.category}
    
    Provide a JSON response with:
    {
      "hint": "specific hint text",
      "hintLevel": "subtle|moderate|detailed",
      "nextStep": "what the user should try next"
    }`;
    
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      res.status(500).json({ success: false, error: 'Failed to generate hint' });
      return;
    }
    
    let hintData;
    try {
      hintData = JSON.parse(response);
    } catch (parseError) {
      res.status(500).json({ success: false, error: 'Invalid hint response' });
      return;
    }
    
    res.json({
      success: true,
      data: hintData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getExplanation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId, solutionCode } = req.body;
    
    if (!problemId) {
      res.status(400).json({ 
        success: false, 
        error: 'Missing problem ID' 
      });
      return;
    }
    
    const problem = await dbGet('SELECT * FROM problems WHERE id = ?', [problemId]);
    
    if (!problem) {
      res.status(404).json({ success: false, error: 'Problem not found' });
      return;
    }
    
    const prompt = `Provide a detailed explanation for this problem:
    
    Problem: ${problem.description}
    ${solutionCode ? `Solution: ${solutionCode}` : ''}
    
    Provide a JSON response with:
    {
      "explanation": "detailed step-by-step explanation",
      "keyConcepts": ["concept1", "concept2"],
      "algorithm": "algorithm description",
      "timeComplexity": "O(n) explanation",
      "spaceComplexity": "O(1) explanation",
      "examples": ["example1", "example2"]
    }`;
    
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      res.status(500).json({ success: false, error: 'Failed to generate explanation' });
      return;
    }
    
    let explanationData;
    try {
      explanationData = JSON.parse(response);
    } catch (parseError) {
      res.status(500).json({ success: false, error: 'Invalid explanation response' });
      return;
    }
    
    res.json({
      success: true,
      data: explanationData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const generateQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId, topic } = req.body;
    
    const prompt = `Generate a quiz about ${topic || 'Data Structures and Algorithms'} with 5 multiple choice questions. 
    The response should be in JSON format:
    {
      "questions": [
        {
          "question": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0,
          "explanation": "Why this is correct"
        }
      ]
    }`;
    
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      res.status(500).json({ success: false, error: 'Failed to generate quiz' });
      return;
    }
    
    let quizData;
    try {
      quizData = JSON.parse(response);
    } catch (parseError) {
      res.status(500).json({ success: false, error: 'Invalid quiz format' });
      return;
    }
    
    res.json({
      success: true,
      data: quizData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getSupplementaryMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, difficulty } = req.body;
    
    const prompt = `Provide supplementary learning materials for ${topic} at ${difficulty} level. 
    The response should be in JSON format:
    {
      "resources": [
        {
          "type": "article|video|book|practice",
          "title": "Resource title",
          "description": "Brief description",
          "url": "resource URL if applicable",
          "difficulty": "beginner|intermediate|advanced"
        }
      ],
      "keyTakeaways": ["takeaway1", "takeaway2"],
      "nextTopics": ["topic1", "topic2"]
    }`;
    
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      res.status(500).json({ success: false, error: 'Failed to generate materials' });
      return;
    }
    
    let materialsData;
    try {
      materialsData = JSON.parse(response);
    } catch (parseError) {
      res.status(500).json({ success: false, error: 'Invalid materials format' });
      return;
    }
    
    res.json({
      success: true,
      data: materialsData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
}; 