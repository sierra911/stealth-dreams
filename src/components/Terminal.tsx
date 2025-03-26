
import React, { useState, useEffect } from 'react';
import { useTypewriter } from '../utils/animations';

interface TerminalProps {
  initialText?: string;
  commands?: string[];
  className?: string;
  typingSpeed?: number;
  prompt?: string;
}

const Terminal: React.FC<TerminalProps> = ({
  initialText = 'Initializing system...',
  commands = ['> ACCESS GRANTED', '> CONNECTING TO NETWORK', '> BYPASSING SECURITY'],
  className = '',
  typingSpeed = 50,
  prompt = '> '
}) => {
  const [lines, setLines] = useState<string[]>([initialText]);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [cursor, setCursor] = useState(true);
  const { displayText, isComplete } = useTypewriter(
    currentCommandIndex < commands.length ? commands[currentCommandIndex] : '',
    typingSpeed
  );

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (isComplete && currentCommandIndex < commands.length) {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, commands[currentCommandIndex]]);
        setCurrentCommandIndex(prev => prev + 1);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isComplete, currentCommandIndex, commands]);

  return (
    <div className={`terminal ${className}`}>
      {lines.map((line, index) => (
        <div key={index} className="mb-1">{line}</div>
      ))}
      {currentCommandIndex < commands.length && (
        <div className="flex">
          {displayText}
          {cursor && <span className="ml-1 animate-pulse">█</span>}
        </div>
      )}
    </div>
  );
};

export default Terminal;
