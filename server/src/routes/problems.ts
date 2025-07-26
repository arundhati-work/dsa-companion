import express from 'express';
import { getProblems, getProblemById, createProblem, updateProblem, deleteProblem } from '../controllers/problemController';

const router = express.Router();

// GET /api/problems - Get all problems with optional filters
router.get('/', getProblems);

// GET /api/problems/:id - Get a specific problem
router.get('/:id', getProblemById);

// POST /api/problems - Create a new problem
router.post('/', createProblem);

// PUT /api/problems/:id - Update a problem
router.put('/:id', updateProblem);

// DELETE /api/problems/:id - Delete a problem
router.delete('/:id', deleteProblem);

export default router; 