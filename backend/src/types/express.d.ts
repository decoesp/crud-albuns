declare global {
  namespace Express {
    interface User {
      id: string
      userId: string
      email: string
      type: 'access' | 'refresh'
    }

    interface Request {
      user?: User
    }
  }
}

export {}
