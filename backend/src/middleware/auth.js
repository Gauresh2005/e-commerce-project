const jwt = require('jsonwebtoken')

async function protect(req, res, next) {
    try {
        // getting the token from authorization header
        const authHeader = req.headers.authorization

        // checking if the token exists and is valid
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Unauthorized, access denied"
            })
        }

        // extracting token by removing the 'Bearer' prefix
        const token = authHeader.split(' ')[1]

        // verifying the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // getting user info in request object
        req.user = decoded

        next()
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}

async function adminOnly(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied, admins only"
        })
    }

    next()
}

module.exports = { protect, adminOnly }