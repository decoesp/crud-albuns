import { describe, it, expect } from 'vitest'
import { validateAcquisitionDate, parseAndValidateAcquisitionDate, isValidAcquisitionDate } from './validators.js'
import { BadRequestError } from '../../utils/errors.js'

describe('validateAcquisitionDate', () => {
  const fixedNow = new Date('2024-06-15T12:00:00.000Z')

  describe('given undefined or null date', () => {
    it('should return valid with current date as default', () => {
      const result = validateAcquisitionDate(undefined, fixedNow)

      expect(result.isValid).toBe(true)
      expect(result.date).toEqual(fixedNow)
      expect(result.error).toBeUndefined()
    })

    it('should handle null the same as undefined', () => {
      const result = validateAcquisitionDate(null, fixedNow)

      expect(result.isValid).toBe(true)
      expect(result.date).toEqual(fixedNow)
    })
  })

  describe('given a valid past date', () => {
    it('should return valid with parsed date', () => {
      const pastDate = '2024-01-15T10:30:00.000Z'
      const result = validateAcquisitionDate(pastDate, fixedNow)

      expect(result.isValid).toBe(true)
      expect(result.date).toEqual(new Date(pastDate))
      expect(result.error).toBeUndefined()
    })
  })

  describe('given a future date', () => {
    it('should return invalid with error message', () => {
      const futureDate = '2025-12-31T23:59:59.000Z'
      const result = validateAcquisitionDate(futureDate, fixedNow)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Data de aquisição não pode ser futura')
      expect(result.date).toBeUndefined()
    })
  })

  describe('given an invalid date string', () => {
    it('should return invalid with error message', () => {
      const result = validateAcquisitionDate('not-a-date', fixedNow)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Data de aquisição inválida')
      expect(result.date).toBeUndefined()
    })
  })

  describe('given the exact current time', () => {
    it('should return valid (edge case: now === now)', () => {
      const result = validateAcquisitionDate(fixedNow.toISOString(), fixedNow)

      expect(result.isValid).toBe(true)
      expect(result.date).toEqual(fixedNow)
    })
  })
})

describe('parseAndValidateAcquisitionDate', () => {
  const fixedNow = new Date('2024-06-15T12:00:00.000Z')

  it('should return Date when valid', () => {
    const pastDate = '2024-01-15T10:30:00.000Z'
    const result = parseAndValidateAcquisitionDate(pastDate, fixedNow)

    expect(result).toEqual(new Date(pastDate))
  })

  it('should throw BadRequestError when date is future', () => {
    const futureDate = '2025-12-31T23:59:59.000Z'

    expect(() => parseAndValidateAcquisitionDate(futureDate, fixedNow))
      .toThrow(BadRequestError)
  })

  it('should throw BadRequestError with correct message', () => {
    const futureDate = '2025-12-31T23:59:59.000Z'

    expect(() => parseAndValidateAcquisitionDate(futureDate, fixedNow))
      .toThrow('Data de aquisição não pode ser futura')
  })

  it('should return current date when undefined', () => {
    const result = parseAndValidateAcquisitionDate(undefined, fixedNow)

    expect(result).toEqual(fixedNow)
  })
})

describe('isValidAcquisitionDate', () => {
  const fixedNow = new Date('2024-06-15T12:00:00.000Z')

  it('should return true for valid past date', () => {
    expect(isValidAcquisitionDate('2024-01-15T10:30:00.000Z', fixedNow)).toBe(true)
  })

  it('should return false for future date', () => {
    expect(isValidAcquisitionDate('2025-12-31T23:59:59.000Z', fixedNow)).toBe(false)
  })

  it('should return true for undefined', () => {
    expect(isValidAcquisitionDate(undefined, fixedNow)).toBe(true)
  })

  it('should return false for invalid date string', () => {
    expect(isValidAcquisitionDate('invalid', fixedNow)).toBe(false)
  })
})
