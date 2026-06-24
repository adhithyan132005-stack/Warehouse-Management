const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')

const configureDB   = require('./config/db')

// Controllers & Middleware
const AuthenticateUser = require('./App/Middleware/user-authenticate')
const AuthorizeUser    = require('./App/Middleware/user-authorize')
const Usercltr         = require('./App/Controller/user-controller')
const GoogleAuthController = require('./App/Controller/google-auth-controller')

// Feature Routes
const productRoutes      = require('./App/Routes/productRoutes')
const inventoryRoutes    = require('./App/Routes/InventoryRoutes')
const stockRoutes        = require('./App/Routes/StockRoutes')
const dashboardRoutes    = require('./App/Routes/DashboardRoutes')
const locationRoutes     = require('./App/Routes/locationRoutes')
const orderRoutes        = require('./App/Routes/orderRoutes')
const activityRoutes     = require('./App/Routes/ActivityRoutes')
const notificationRoutes = require('./App/Routes/notificationRoutes')
const queryRoutes        = require('./App/Routes/queryRoutes')

const app  = express()
const port = process.env.PORT || 4444

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://warehouse-management-frontend-oup9.onrender.com'
    ],
    credentials: true
}))

app.use(express.json())

// NOTE: No /uploads folder needed — images are stored in Cloudinary, not on this server

// ── User Routes ───────────────────────────────────────────────────────────────
app.post('/api/users',           Usercltr.Register)
app.post('/api/login',           Usercltr.Login)
app.post('/api/auth/google',     GoogleAuthController.verifyGoogleLogin)
app.get('/api/account',          AuthenticateUser, Usercltr.Account)
app.put('/api/account',          AuthenticateUser, Usercltr.updateAccount)
app.get('/api/users',            AuthenticateUser, AuthorizeUser(['admin']), Usercltr.listUsers)
app.put('/api/users/:id/role',   AuthenticateUser, AuthorizeUser(['admin']), Usercltr.updateRole)

// ── Feature Routes ────────────────────────────────────────────────────────────
app.use('/api', productRoutes)
app.use('/api', inventoryRoutes)
app.use('/api', stockRoutes)
app.use('/api', dashboardRoutes)
app.use('/api', locationRoutes)
app.use('/api', orderRoutes)
app.use('/api', activityRoutes)
app.use('/api', notificationRoutes)
app.use('/api', queryRoutes)

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'running', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

// ── Start Server ──────────────────────────────────────────────────────────────
async function startServer() {
    await configureDB()
    app.listen(port, () => console.log(`Server running on port ${port}`))
}

startServer()
