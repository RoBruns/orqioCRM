import React from 'react';

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
  hoverEffect?: boolean;
}

export const GlassPane: React.FC<GlassProps> = ({ 
  children, 
  intensity = 'medium', 
  className = '', 
  hoverEffect = false,
  ...props 
}) => {
  const baseClasses = "backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300";
  
  const intensityClasses = {
    low: "bg-white/40",
    medium: "bg-white/60",
    high: "bg-white/80",
  };

  const hoverClasses = hoverEffect ? "hover:bg-white/70 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1" : "";

  return (
    <div 
      className={`${baseClasses} ${intensityClasses[intensity]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: "bg-orqio-orange text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30 border-transparent",
    secondary: "bg-white/50 text-orqio-black hover:bg-white border-white/60",
    ghost: "bg-transparent text-gray-600 hover:bg-black/5 border-transparent",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
  };

  return (
    <button 
      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 border flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>}
    <input 
      className={`w-full bg-white/50 border border-gray-200/60 rounded-xl px-4 py-2.5 text-orqio-black focus:outline-none focus:ring-2 focus:ring-orqio-orange/50 focus:bg-white transition-all placeholder:text-gray-400 ${className}`}
      {...props}
    />
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>}
    <textarea 
      className={`w-full bg-white/50 border border-gray-200/60 rounded-xl px-4 py-2.5 text-orqio-black focus:outline-none focus:ring-2 focus:ring-orqio-orange/50 focus:bg-white transition-all placeholder:text-gray-400 min-h-[100px] resize-y ${className}`}
      {...props}
    />
  </div>
);