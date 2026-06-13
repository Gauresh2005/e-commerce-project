const AppError = require('../utils/AppError')

const notFound = (req, res, next) => {
    const error = new AppError(`Route not found: ${req.originalUrl}`, 404)
    next(error)
}

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500
    let message = err.message || "Something went wrong"

    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 409
        message = "A record with this value already exists"
    }

    if (err.code === 'ER_BAD_FIELD ERROR') {
        statusCode = 400
        message = "Invalid field in database query"
    }
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401
        message = "Invalid token"
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401
        message = "Token has expired, please login again"
    }
    if (!err.isOperational) {
        console.log("UNEXPECTED ERROR: ", err)
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
}

module.exports = { notFound, errorHandler }

