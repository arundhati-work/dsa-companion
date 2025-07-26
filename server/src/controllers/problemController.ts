import { Request, Response } from 'express';
import { db } from '../utils/database';
import { v4 as uuidv4 } from 'uuid';

// Helper function to promisify database operations
const dbAll = (query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

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

export const getProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { difficulty, category, limit = '50', offset = '0' } = req.query;
    
    let query = 'SELECT * FROM problems WHERE 1=1';
    const params: any[] = [];
    
    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));
    
    const rows = await dbAll(query, params);
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getProblemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const row = await dbGet('SELECT * FROM problems WHERE id = ?', [id]);
    
    if (!row) {
      res.status(404).json({ success: false, error: 'Problem not found' });
      return;
    }
    
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const createProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, difficulty, category, testCases, solutionTemplate } = req.body;
    
    if (!title || !description || !difficulty || !category || !testCases) {
      res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
      return;
    }
    
    const id = uuidv4();
    const testCasesJson = JSON.stringify(testCases);
    
    await dbRun(
      'INSERT INTO problems (id, title, description, difficulty, category, test_cases, solution_template) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, difficulty, category, testCasesJson, solutionTemplate || null]
    );
    
    res.status(201).json({
      success: true,
      data: { id, title, description, difficulty, category }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const updateProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, category, testCases, solutionTemplate } = req.body;
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description) {
      updates.push('description = ?');
      params.push(description);
    }
    if (difficulty) {
      updates.push('difficulty = ?');
      params.push(difficulty);
    }
    if (category) {
      updates.push('category = ?');
      params.push(category);
    }
    if (testCases) {
      updates.push('test_cases = ?');
      params.push(JSON.stringify(testCases));
    }
    if (solutionTemplate !== undefined) {
      updates.push('solution_template = ?');
      params.push(solutionTemplate);
    }
    
    if (updates.length === 0) {
      res.status(400).json({ success: false, error: 'No fields to update' });
      return;
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const query = `UPDATE problems SET ${updates.join(', ')} WHERE id = ?`;
    
    const result = await dbRun(query, params);
    
    if (result.changes === 0) {
      res.status(404).json({ success: false, error: 'Problem not found' });
      return;
    }
    
    res.json({ success: true, message: 'Problem updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const deleteProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await dbRun('DELETE FROM problems WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      res.status(404).json({ success: false, error: 'Problem not found' });
      return;
    }
    
    res.json({ success: true, message: 'Problem deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
}; 