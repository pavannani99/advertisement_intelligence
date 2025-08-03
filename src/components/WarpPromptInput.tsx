import React, { useState, useRef, useEffect } from 'react';
import { WarpPromptInputProps } from '../types';

const WarpPromptInput: React.FC<WarpPromptInputProps> = ({
  onSubmit,
  placeholder = 'Type here…',
  disabled = false
}) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        {/* Terminal-style prompt prefix */}
        <div className="flex items-center">
          <div className="flex items-center space-x-2 text-accent-cyan mr-4">
            <span className="text-lg">❯</span>
            <span className="text-sm font-mono">ad-gen</span>
          </div>
          
          {/* Main input container */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              className={`warp-input ${isFocused ? 'ring-2 ring-accent-cyan/50' : ''} ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'
              }`}
            />
            
            {/* Animated cursor */}
            {isFocused && !value && (
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                <div className="terminal-cursor"></div>
              </div>
            )}
            
            {/* Enter hint */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-dark-text-muted text-sm">
              {value.trim() ? (
                <span className="text-accent-cyan">↵ Enter</span>
              ) : (
                <span>⌘ K</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Suggestions */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {QUICK_SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setValue(suggestion)}
              disabled={disabled}
              className="btn-ghost text-sm px-4 py-2 rounded-full border border-dark-border hover:border-accent-cyan/50 transition-all duration-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
        
        {/* Advanced options toggle */}
        <div className="mt-8 text-center">
          <button
            type="button"
            className="btn-ghost text-sm text-dark-text-muted hover:text-accent-cyan"
            onClick={() => {
              // This could open a modal with structured form inputs
              console.log('Advanced options clicked');
            }}
          >
            Advanced Options
          </button>
        </div>
      </form>
    </div>
  );
};

// Quick suggestion examples
const QUICK_SUGGESTIONS = [
  'Create ad for eco-friendly water bottle',
  'Social media campaign for AI startup',
  'Instagram ads for luxury watches',
  'Facebook campaign for fitness app',
  'Product launch announcement'
];

export default WarpPromptInput;
