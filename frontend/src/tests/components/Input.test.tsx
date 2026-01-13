import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Input from '../../components/ui/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" id="email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders without label', () => {
    render(<Input id="test-input" placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Input label="Email" id="email" error="Email is required" />)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies error styling when error is present', () => {
    render(<Input label="Email" id="email" error="Invalid email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveClass('border-red-500')
  })

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn()
    render(<Input label="Name" id="name" onChange={handleChange} />)
    
    const input = screen.getByLabelText('Name')
    fireEvent.change(input, { target: { value: 'John' } })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('renders with different types', () => {
    render(<Input label="Password" id="password" type="password" />)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('renders as disabled', () => {
    render(<Input label="Disabled" id="disabled" disabled />)
    const input = screen.getByLabelText('Disabled')
    expect(input).toBeDisabled()
  })

  it('has proper aria attributes for error state', () => {
    render(<Input label="Email" id="email" error="Invalid" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-error')
  })

  it('renders with placeholder', () => {
    render(<Input label="Search" id="search" placeholder="Search..." />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Input label="Test" id="test" ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })
})
