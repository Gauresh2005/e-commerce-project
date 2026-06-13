const db = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/AppError')

async function registerUser(req,res) {
    // getting required details of user for registration
    const { name, email, password } = req.body
    
    // checking all fields are entered
    if (!name || !email || !password) {
        throw new AppError("All fields are required", 400)
    }
    
    // checking for duplicate email if exists
    const [existing] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
    )
    if (existing.length > 0) {
        throw new AppError("User already registered")
    }
    
    // hashing the user password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // creating new user 
    const [result] = await db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
    )
    
    res.status(201).json({
        message: "User registered successfully",
        userId: result.insertId
    })
}

async function loginUser(req,res) {
    const { email, password } = req.body

    if (!email || !password) {
        throw new AppError("Email and password are required", 400)
    }

    const [users] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
    )
    if (users.length === 0) {
        throw new AppError("Invalid email or password", 401)
    }
    
    const user = users[0]

    // checking for valid password
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new AppError("Invalid password", 401)
    }

    // creating a token for new user
    const token = jwt.sign({
        id: user.id,
        role: user.role
    }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })

    console.log("Logged in user:", user.id, user.email, user.role);
    res.json({
        message: "Login successful",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    })
}

async function getProfile(req,res) {
    const [users] = await db.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [req.user.id]
    )

    if (users.length === 0) {
        throw new AppError("User not found", 404)
    }

    res.json({
        user: users[0]
    })
}

module.exports = { registerUser, loginUser, getProfile }


