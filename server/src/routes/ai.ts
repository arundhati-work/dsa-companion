import express from 'express';
import { 
  generateProblem, 
  validateSolution, 
  getHint, 
  getExplanation, 
  generateQuiz,
  getSupplementaryMaterials 
} from '../controllers/aiController';

const router = express.Router();

// POST /api/ai/generate-problem - Generate a new problem based on user preferences
router.post('/generate-problem', generateProblem);

// POST /api/ai/validate-solution - Validate user's solution
router.post('/validate-solution', validateSolution);

// POST /api/ai/hint - Get a hint for the current problem
router.post('/hint', getHint);

// POST /api/ai/explanation - Get detailed explanation
router.post('/explanation', getExplanation);

// POST /api/ai/quiz - Generate quiz questions
router.post('/quiz', generateQuiz);

// POST /api/ai/supplementary - Get supplementary learning materials
router.post('/supplementary', getSupplementaryMaterials);

export default router; 