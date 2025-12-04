import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon,
  ...props 
}) => {
  // Added flex items-center explicitly to fix alignment
  const baseStyle = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-none font-medium transition-all duration-200 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs md:text-sm h-10";
  
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 focus:ring-primary-400 border border-primary-500",
    secondary: "bg-dark-700 hover:bg-dark-600 text-gray-200 border border-dark-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 focus:ring-dark-500",
    text: "bg-transparent hover:bg-white/5 text-primary-400 hover:text-primary-300 focus:ring-primary-500",
    danger: "bg-red-900/50 text-red-400 hover:bg-red-900/80 border border-red-800 hover:border-red-500 focus:ring-red-500"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="flex items-center justify-center w-4 h-4">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};