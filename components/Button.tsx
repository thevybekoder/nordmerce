import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-nordic-accent text-white hover:bg-nordic-accentHover focus:ring-nordic-accent shadow-sm dark:focus:ring-offset-gray-900",
    secondary: "bg-nordic-clay text-nordic-text hover:bg-gray-300 focus:ring-gray-400 dark:bg-nordic-darkClay dark:text-nordic-darkText dark:hover:bg-gray-700",
    outline: "border border-nordic-border bg-transparent text-nordic-text hover:bg-gray-50 focus:ring-gray-200 dark:border-nordic-darkBorder dark:text-nordic-darkText dark:hover:bg-gray-800",
    ghost: "text-nordic-muted hover:text-nordic-text hover:bg-gray-100 dark:text-nordic-darkMuted dark:hover:text-white dark:hover:bg-gray-800",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 rounded-md",
    md: "text-sm px-5 py-2.5 rounded-lg",
    lg: "text-base px-6 py-3 rounded-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </span>
      ) : children}
    </button>
  );
};