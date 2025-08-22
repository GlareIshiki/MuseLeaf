import React from 'react'

const Button = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '', 
  onClick,
  disabled = false,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  const variants = {
    default: 'bg-purple-600 text-white hover:bg-purple-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-8 text-lg',
  }
  
  const variantStyles = variants[variant] || variants.default
  const sizeStyles = sizes[size] || sizes.md
  
  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export { Button }