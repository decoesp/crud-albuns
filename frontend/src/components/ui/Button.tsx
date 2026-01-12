import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, 'aria-label': ariaLabel, ...props }, ref) => {
    const variants: Record<string, string> = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
      ghost: 'bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500'
    }

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
