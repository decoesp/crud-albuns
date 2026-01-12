import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { env } from './env.js'
import prisma from './database.js'

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value
          if (!email) {
            return done(new Error('No email found in Google profile'))
          }

          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email, deletedAt: null },
                { provider: 'google', providerId: profile.id, deletedAt: null }
              ]
            }
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || email.split('@')[0],
                provider: 'google',
                providerId: profile.id
              }
            })
          } else if (!user.provider) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { provider: 'google', providerId: profile.id }
            })
          }

          return done(null, user)
        } catch (error) {
          return done(error as Error)
        }
      }
    )
  )
}

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET && env.GITHUB_CALLBACK_URL) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: env.GITHUB_CALLBACK_URL
      },
      async (_accessToken: string, _refreshToken: string, profile: { id: string; displayName?: string; emails?: Array<{ value: string }> }, done: (error: Error | null, user?: unknown) => void) => {
        try {
          const email = profile.emails?.[0]?.value
          if (!email) {
            return done(new Error('No email found in GitHub profile'))
          }

          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email, deletedAt: null },
                { provider: 'github', providerId: profile.id, deletedAt: null }
              ]
            }
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || email.split('@')[0],
                provider: 'github',
                providerId: profile.id
              }
            })
          } else if (!user.provider) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { provider: 'github', providerId: profile.id }
            })
          }

          return done(null, user)
        } catch (error) {
          return done(error as Error)
        }
      }
    )
  )
}

export default passport
