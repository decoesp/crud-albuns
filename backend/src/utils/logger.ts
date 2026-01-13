type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: string
  data?: Record<string, unknown>
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

function formatLog(entry: LogEntry): string {
  const { level, message, timestamp, context, data } = entry
  const prefix = context ? `[${context}]` : ''
  const dataStr = data ? ` ${JSON.stringify(data)}` : ''
  return `${timestamp} [${level.toUpperCase()}]${prefix} ${message}${dataStr}`
}

function createLogEntry(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    data
  }
}

function log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>): void {
  if (!shouldLog(level)) return

  const entry = createLogEntry(level, message, context, data)
  const formatted = formatLog(entry)

  switch (level) {
    case 'error':
      process.stderr.write(formatted + '\n')
      break
    default:
      process.stdout.write(formatted + '\n')
  }
}

export const logger = {
  debug: (message: string, context?: string, data?: Record<string, unknown>) => log('debug', message, context, data),
  info: (message: string, context?: string, data?: Record<string, unknown>) => log('info', message, context, data),
  warn: (message: string, context?: string, data?: Record<string, unknown>) => log('warn', message, context, data),
  error: (message: string, context?: string, data?: Record<string, unknown>) => log('error', message, context, data)
}

export default logger
