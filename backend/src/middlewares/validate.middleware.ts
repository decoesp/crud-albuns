import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { BadRequestError } from '../utils/errors.js'

export function validate(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })
      
      req.body = validated.body
      req.query = validated.query
      req.params = validated.params
      
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new BadRequestError(messages)
      }
      throw error
    }
  }
}
