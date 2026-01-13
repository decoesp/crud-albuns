import { BadRequestError } from '../../utils/errors.js'

export interface AcquisitionDateValidation {
  isValid: boolean
  error?: string
  date?: Date
}

export const validateAcquisitionDate = (
  dateString: string | undefined | null,
  now: Date = new Date()
): AcquisitionDateValidation => {
  if (!dateString) {
    return { isValid: true, date: now }
  }

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Data de aquisição inválida' }
  }

  if (date > now) {
    return { isValid: false, error: 'Data de aquisição não pode ser futura' }
  }

  return { isValid: true, date }
}

export const parseAndValidateAcquisitionDate = (
  dateString: string | undefined | null,
  now: Date = new Date()
): Date => {
  const validation = validateAcquisitionDate(dateString, now)

  if (!validation.isValid) {
    throw new BadRequestError(validation.error!)
  }

  return validation.date!
}

export const isValidAcquisitionDate = (
  dateString: string | undefined | null,
  now: Date = new Date()
): boolean => validateAcquisitionDate(dateString, now).isValid
