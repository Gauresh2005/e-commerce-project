const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const {
    placeOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/orderController')
const asyncHandler = require('../utils/asyncHandler')

// Customer APIs
router.post('/', protect, asyncHandler(placeOrder))
router.get('/my', protect, asyncHandler(getMyOrders))
router.get('/:id', protect, asyncHandler(getOrderById))

// Admin APIs
router.get('/', protect, adminOnly, asyncHandler(getAllOrders))
router.put('/:id/status', protect, adminOnly, asyncHandler(updateOrderStatus))

module.exports = router