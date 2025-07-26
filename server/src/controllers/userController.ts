import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../utils/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

// Helper function to promisify bcrypt operations
const hashPassword = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 12, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
};

const comparePassword = (password: string, hash: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  console.log('🔧 Server Debug - Register request received');
  console.log('🔧 Server Debug - Request body:', { 
    username: req.body.username, 
    email: req.body.email, 
    password: req.body.password ? '***' : 'missing' 
  });
  console.log('🔧 Server Debug - Request headers:', req.headers);
  
  try {
    const { username, email, password } = req.body;
    
    console.log('🔧 Server Debug - Extracted data:', { username, email, password: password ? '***' : 'missing' });
    
    if (!username || !email || !password) {
      console.log('🔧 Server Debug - Missing required fields');
      res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
      return;
    }
    
    console.log('🔧 Server Debug - Checking if user already exists...');
    // Check if user already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    
    if (existingUser) {
      console.log('🔧 Server Debug - User already exists');
      res.status(400).json({ 
        success: false, 
        error: 'User already exists' 
      });
      return;
    }
    
    console.log('🔧 Server Debug - Hashing password...');
    // Hash password
    const hashedPassword = await hashPassword(password);
    const id = uuidv4();
    
    console.log('🔧 Server Debug - Inserting user into database...');
    await dbRun(
      'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [id, username, email, hashedPassword]
    );
    
    console.log('🔧 Server Debug - Generating JWT token...');
    // Generate JWT token
    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('🔧 Server Debug - Registration successful, sending response');
    res.status(201).json({
      success: true,
      data: {
        user: {
          id,
          username,
          email
        },
        token
      }
    });
  } catch (error) {
    console.error('🔧 Server Debug - Registration error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
      return;
    }
    
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
      return;
    }
    
    // Check password
    const isMatch = await comparePassword(password, user.password_hash);
    
    if (!isMatch) {
      res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
      return;
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    const user = await dbGet('SELECT id, username, email, created_at FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { username, email } = req.body;
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (username) {
      updates.push('username = ?');
      params.push(username);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    
    if (updates.length === 0) {
      res.status(400).json({ success: false, error: 'No fields to update' });
      return;
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(userId);
    
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    await dbRun(query, params);
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    await dbRun('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
}; 