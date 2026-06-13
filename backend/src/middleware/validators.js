const { body, validationResult } = require('express-validator');

// ── Helper: run after validation rules ──────────────────
// If any rule fails, returns 400 with all error messages
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// ── Register validation rules ────────────────────────────
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),                // lowercases and cleans the email

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  validate,
];

// ── Login validation rules ───────────────────────────────
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  validate,
];

// ── Product validation rules ─────────────────────────────
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 150 }).withMessage('Name cannot exceed 150 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ gt: 0 }).withMessage('Price must be a positive number'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  validate,
];

// ── Cart validation rules ────────────────────────────────
const validateCartItem = [
  body('product_id')
    .notEmpty().withMessage('product_id is required')
    .isInt({ gt: 0 }).withMessage('product_id must be a positive integer'),

  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),

  validate,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateCartItem,
};