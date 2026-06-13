const express = require('express')
const router = express.Router()
const {
    registerUser,
    loginUser,
    getProfile
} = require('../controllers/userController')
const { protect, adminOnly } = require('../middleware/auth')
const { validateRegister, validateLogin } = require('../middleware/validators')
const asyncHandler = require('../utils/asyncHandler')

router.post('/register', validateRegister, asyncHandler(registerUser))
router.post('/login',validateLogin, asyncHandler(loginUser))

router.get('/profile', protect, asyncHandler(getProfile))

module.exports = router