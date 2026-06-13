const express = require('express')
const router = express.Router()
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController')
const { protect, adminOnly } = require('../middleware/auth')
const { validateProduct } = require('../middleware/validators')
const asyncHandler = require('../utils/asyncHandler')

// Public routes
router.get('/', asyncHandler(getAllProducts))
router.get('/:id', asyncHandler(getProductById))

// Admin routes (protected)
router.post('/', protect, adminOnly, validateProduct, asyncHandler(createProduct))
router.put('/:id', protect, adminOnly, asyncHandler(updateProduct))
router.delete('/:id', protect, adminOnly, asyncHandler(deleteProduct))

module.exports = router