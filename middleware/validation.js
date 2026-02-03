import validator from 'validator';

/**
 * Content Type Validation Middleware
 */
export const validateContent = (req, res, next) => {
  // Only validate POST, PUT requests with body
  if (['POST', 'PUT'].includes(req.method)) {
    const contentType = req.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Content-Type must be application/json'
      });
    }
  }
  next();
};

/**
 * Input Sanitization
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters and trim
  return validator.escape(input.trim());
};

/**
 * Email validation
 */
export const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Password validation - At least 8 chars, uppercase, number, special char
 */
export const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Request validation middleware factory
 */
export const validateRequest = (requiredFields = []) => {
  return (req, res, next) => {
    const errors = [];

    requiredFields.forEach(field => {
      if (!req.body[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};
