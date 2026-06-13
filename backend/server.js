require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const db = require('./src/config/db')
const userRoutes = require('./src/routes/users')
const productRoutes = require('./src/routes/products')
const cartRoutes = require('./src/routes/carts')
const orderRoutes = require('./src/routes/orders')
const errorHandling = require('./src/middleware/errorHandler')
const rateLimiter = require('./src/middleware/rateLimiter')

const path = require('path')
const app = express()

const isProd = process.env.NODE_ENV === 'production'
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

// Helmet configuration: strict in production, relaxed in development
if (isProd) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', FRONTEND_ORIGIN],
        connectSrc: ["'self'", FRONTEND_ORIGIN],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      }
    },
    // Allow cross-origin resource policy so frontend on a different origin can load images
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }))
} else {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }))
}

app.use(express.json({ limit: '5mb' }))
app.use(morgan('dev'))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// CORS: allow only configured frontend origin (development uses localhost:5173)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
})

app.use('/api', rateLimiter.generalLimiter)
app.use('/api/users/login', rateLimiter.authLimiter)
app.use('/api/users/register', rateLimiter.authLimiter)

db.query('SELECT 1')
.then(() => console.log("Mysql connected successfully"))
.catch((error) => console.log("Mysql connection failed: ", error.message))

// test api
app.get('/', (req,res) => {
    res.json({ message: "E-commerce api is running..." })
})

// creating routes for users
app.use('/api/users', userRoutes)

// creating routes for products
app.use('/api/products', productRoutes)

// creating routes for cart
app.use('/api/cart', cartRoutes)

// creating routes for orders
app.use('/api/orders', orderRoutes)

app.use(errorHandling.notFound)
app.use(errorHandling.errorHandler)

const PORT = process.env.PORT || 3000;
db.query('SELECT 1')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

