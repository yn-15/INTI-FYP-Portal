import express from 'express'
import cors    from 'cors'
import dotenv  from 'dotenv'

dotenv.config()

import authRoutes         from './routes/auth.routes.js'
import userRoutes         from './routes/user.routes.js'
import proposalRoutes     from './routes/proposal.routes.js'
import teamRoutes         from './routes/team.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import chatRoutes         from './routes/chat.routes.js'
import reportRoutes       from './routes/report.routes.js'
import auditRoutes        from './routes/audit.routes.js'

const app = express()

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
}))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/users',         userRoutes)
app.use('/api/proposals',     proposalRoutes)
app.use('/api/teams',         teamRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/chat',          chatRoutes)
app.use('/api/reports',       reportRoutes)
app.use('/api/audit',         auditRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

export default app