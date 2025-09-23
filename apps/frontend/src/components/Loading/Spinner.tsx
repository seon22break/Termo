import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className = '', 
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-zinc-600 border-t-white rounded-full animate-spin`}
      />
      {text && (
        <span className="mt-2 text-xs text-zinc-400">{text}</span>
      )}
    </div>
  );
};

export default Spinner;
