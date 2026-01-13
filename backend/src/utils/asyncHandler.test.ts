import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { asyncHandler } from './asyncHandler.js'

describe('asyncHandler', () => {
  const mockRequest = {} as Request
  const mockResponse = {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis()
  } as unknown as Response
  const mockNext = vi.fn() as unknown as NextFunction

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call the handler function and not call next on success', async () => {
    const handler = vi.fn().mockResolvedValue(undefined)
    const wrapped = asyncHandler(handler)

    await wrapped(mockRequest, mockResponse, mockNext)

    expect(handler).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext)
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should wrap handler in Promise.resolve to catch sync errors via .catch', () => {
    const handler = vi.fn().mockReturnValue(Promise.resolve())
    const wrapped = asyncHandler(handler)

    const result = wrapped(mockRequest, mockResponse, mockNext)

    expect(result).toBeUndefined()
    expect(handler).toHaveBeenCalled()
  })

  it('should call next with error when handler rejects', async () => {
    const error = new Error('Async error')
    const handler = vi.fn().mockRejectedValue(error)
    const wrapped = asyncHandler(handler)
    const localNext = vi.fn()

    wrapped(mockRequest, mockResponse, localNext)
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(localNext).toHaveBeenCalledWith(error)
  })

  it('should preserve the original function behavior', async () => {
    const handler = vi.fn().mockImplementation(async (_req, res: Response) => {
      return res.status(201).json({ success: true })
    })
    const wrapped = asyncHandler(handler)

    await wrapped(mockRequest, mockResponse, mockNext)

    expect(mockResponse.status).toHaveBeenCalledWith(201)
    expect(mockResponse.json).toHaveBeenCalledWith({ success: true })
  })
})
