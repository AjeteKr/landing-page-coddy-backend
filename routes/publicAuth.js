import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateRequest, isValidEmail, isValidPassword, sanitizeInput } from '../middleware/validation.js';
import { supabaseService } from '../config/supabase.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken, verifyToken } from '../utils/jwt.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * User login endpoint (supports both main app and non-login users)
 */
router.post('/login', validateRequest(['email', 'password']), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!supabaseService) {
    return res.status(503).json({
      status: 'error',
      code: 503,
      message: 'Database service not configured. Please add Supabase credentials.'
    });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Invalid email format'
    });
  }

  // Prevent timing attacks with consistent response time
  const startTime = Date.now();

  try {
    // Fetch user from database
    const { data: user, error: userError } = await supabaseService
      .from('users')
      .select('id, email, password, role, name, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      // Simulate password check time to prevent user enumeration
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, 1000 - elapsed);
      await new Promise(resolve => setTimeout(resolve, delay));

      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        status: 'error',
        code: 403,
        message: 'Account is disabled. Contact support.'
      });
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      type: 'auth'
    });

    // Update last login timestamp
    await supabaseService
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Login failed. Please try again later.'
    });
  }
}));

/**
 * POST /api/auth/register
 * User registration endpoint (for public/non-login users)
 */
router.post('/register', validateRequest(['email', 'password', 'name']), asyncHandler(async (req, res) => {
  const { email: rawEmail, password, name: rawName } = req.body;

  if (!supabaseService) {
    return res.status(503).json({
      status: 'error',
      code: 503,
      message: 'Database service not configured. Please add Supabase credentials.'
    });
  }

  // Sanitize inputs
  const email = sanitizeInput(rawEmail).toLowerCase();
  const name = sanitizeInput(rawName);

  // Validate inputs
  if (!isValidEmail(email)) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Invalid email format'
    });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Password must be at least 8 characters with uppercase, number, and special character'
    });
  }

  if (name.length < 3 || name.length > 100) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Name must be between 3 and 100 characters'
    });
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabaseService
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        code: 409,
        message: 'Email already registered. Please use another email or login.'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const { data: newUser, error: insertError } = await supabaseService
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        role: 'student', // Default role for new registrations
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select('id, email, name, role')
      .single();

    if (insertError) {
      console.error('User creation error:', insertError);
      throw insertError;
    }

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      type: 'auth'
    });

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Registration failed. Please try again later.'
    });
  }
}));

/**
 * POST /api/auth/verify-token
 * Verify if a token is valid
 */
router.post('/verify-token', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Token is required'
    });
  }

  try {
    const decoded = verifyToken(token);
    res.status(200).json({
      status: 'success',
      data: {
        valid: true,
        user: decoded
      }
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      code: 401,
      message: error.message || 'Invalid or expired token'
    });
  }
}));

export default router;
