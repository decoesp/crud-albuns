import { InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id: providedId, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const errorId = `${id}-error`
    const helperId = `${id}-helper`
    
    const describedBy = [
      error ? errorId : null,
      helperText ? helperId : null,
      ariaDescribedBy
    ].filter(Boolean).join(' ') || undefined

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-3 py-2 border rounded-lg shadow-sm transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
