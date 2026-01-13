import express from 'express'
import cors from 'cors'
import 'express-async-errors'
import { env } from './config/env.js'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js'
import { generalLimiter } from './middlewares/rate-limit.middleware.js'
import { securityHeaders, apiSecurityHeaders } from './middlewares/security.middleware.js'
import passport from './config/passport.js'

const app = express()

securityHeaders().forEach(middleware => app.use(middleware))
app.use(apiSecurityHeaders)
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

app.use('/api', generalLimiter, routes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
