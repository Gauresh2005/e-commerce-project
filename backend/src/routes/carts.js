const express = require('express')
const router = express.Router()
const {
    getCart,
    addToCart,
    updateCart,
    removeCartItem,
    clearCart
} = require('../controllers/cartController')
const { protect, adminOnly } = require('../middleware/auth')
const { validateCartItem } = require('../middleware/validators')
const asyncHandler = require('../utils/asyncHandler')

router.get('/', protect, asyncHandler(getCart))
router.post('/', protect, validateCartItem, asyncHandler(addToCart))
router.put('/:productId', protect, asyncHandler(updateCart))
router.delete('/:productId', protect, asyncHandler(removeCartItem))
router.delete('/', protect, asyncHandler(clearCart))

module.exports = router