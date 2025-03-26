
import { useEffect, useState } from 'react';

// Hook for revealing elements on scroll
export const useReveal = (threshold = 0.1) => {
  const [revealed, setRevealed] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    observer.observe(ref);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, threshold]);

  return { ref: setRef, revealed };
};

// Hook for typing effect
export const useTypewriter = (text: string, speed = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  return { displayText, isComplete };
};

// Hook for glitch effect
export const useGlitch = (interval = 2000, duration = 200) => {
  const [isGlitching, setIsGlitching] = useState(false);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsGlitching(true);
      
      const timeout = setTimeout(() => {
        setIsGlitching(false);
      }, duration);
      
      return () => clearTimeout(timeout);
    }, interval);
    
    return () => clearInterval(intervalId);
  }, [interval, duration]);
  
  return isGlitching;
};

// Function to add random glitch class
export const getRandomGlitchClass = () => {
  const classes = [
    'translate-x-[1px] translate-y-[1px]',
    'translate-x-[-1px] translate-y-[1px]',
    'translate-x-[1px] translate-y-[-1px]',
    'translate-x-[-1px] translate-y-[-1px]',
    'skew-x-[0.5deg]',
    'skew-y-[0.5deg]'
  ];
  
  return classes[Math.floor(Math.random() * classes.length)];
};
