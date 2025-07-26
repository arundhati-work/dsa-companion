import express from 'express';
import { register, login, getProfile, updateProfile, deleteAccount } from '../controllers/userController';

const router = express.Router();

// POST /api/users/register - Register a new user
router.post('/register', register);

// POST /api/users/login - Login user
router.post('/login', login);

// GET /api/users/profile - Get user profile
router.get('/profile', getProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', updateProfile);

// DELETE /api/users/account - Delete user account
router.delete('/account', deleteAccount);

export default router; 