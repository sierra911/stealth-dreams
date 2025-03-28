
import React, { useState, useEffect, useCallback } from 'react';
import { Terminal } from 'lucide-react';

interface TerminalHackProps {
  difficulty: string;
  onSuccess: () => void;
  onFailure: () => void;
  timeLeft: number;
  timeLimit: number;
  onSecurityLevelChange: (level: number) => void;
}

const difficultyConfig = {
  'Easy': { passwordLength: 5, maxAttempts: 5, securityIncrease: 20 },
  'Medium': { passwordLength: 6, maxAttempts: 4, securityIncrease: 25 },
  'Hard': { passwordLength: 8, maxAttempts: 3, securityIncrease: 30 },
  'Expert': { passwordLength: 10, maxAttempts: 3, securityIncrease: 40 }
};

// Generate random password of specified length
const generatePassword = (length: number) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate a list of potential passwords
const generatePasswordList = (difficulty: string, correctPassword: string) => {
  const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.Medium;
  const passwordLength = config.passwordLength;
  
  // Generate decoy passwords
  const passwords = Array(6).fill('').map(() => generatePassword(passwordLength));
  
  // Replace one with the correct password
  const correctIndex = Math.floor(Math.random() * passwords.length);
  passwords[correctIndex] = correctPassword;
  
  return passwords;
};

// Compare password with correct password and return hint
const getPasswordHint = (attempt: string, correct: string) => {
  let correctChars = 0;
  for (let i = 0; i < attempt.length; i++) {
    if (i < correct.length && attempt[i] === correct[i]) {
      correctChars++;
    }
  }
  return correctChars;
};

const TerminalHack: React.FC<TerminalHackProps> = ({ 
  difficulty, 
  onSuccess,
  onFailure,
  timeLeft,
  timeLimit,
  onSecurityLevelChange
}) => {
  const [correctPassword, setCorrectPassword] = useState('');
  const [passwordOptions, setPasswordOptions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [attemptHistory, setAttemptHistory] = useState<{password: string, correctChars: number}[]>([]);
  
  const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.Medium;
  
  // Setup game
  useEffect(() => {
    // Generate the correct password based on difficulty
    const password = generatePassword(config.passwordLength);
    setCorrectPassword(password);
    
    // Generate password options
    setPasswordOptions(generatePasswordList(difficulty, password));
  }, [difficulty, config.passwordLength]);
  
  // Handle password submission
  const handleSubmit = useCallback(() => {
    if (!userInput) return;
    
    if (userInput.toUpperCase() === correctPassword) {
      // Success!
      setMessage("ACCESS GRANTED");
      setTimeout(() => onSuccess(), 1500);
    } else {
      // Wrong password
      setAttempts(prev => {
        const newAttempts = prev + 1;
        const newSecurityLevel = Math.min(securityLevel + config.securityIncrease, 100);
        setSecurityLevel(newSecurityLevel);
        onSecurityLevelChange(100 - newSecurityLevel);
        
        // Add to attempt history
        const correctChars = getPasswordHint(userInput.toUpperCase(), correctPassword);
        setAttemptHistory(prev => [...prev, { password: userInput.toUpperCase(), correctChars }]);
        
        if (newAttempts >= config.maxAttempts) {
          setMessage("ACCESS DENIED - MAXIMUM ATTEMPTS REACHED");
          setTimeout(() => onFailure(), 1500);
        } else {
          setMessage(`ACCESS DENIED - ${correctChars} CHARACTER(S) CORRECT`);
          setTimeout(() => setMessage(null), 1500);
        }
        
        return newAttempts;
      });
      setUserInput('');
    }
  }, [userInput, correctPassword, securityLevel, config.securityIncrease, config.maxAttempts, onSecurityLevelChange, onSuccess, onFailure]);
  
  // Handle key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && userInput) {
        handleSubmit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userInput, handleSubmit]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card p-6">
        <h2 className="text-xl text-cyber-cyan font-display mb-4">SECURE TERMINAL ACCESS</h2>
        
        <div className="cyber-border bg-cyber-black/90 p-4 mb-6 font-mono text-sm">
          <div className="text-center mb-6">
            <Terminal className="w-12 h-12 text-cyber-cyan mx-auto mb-2" />
            <h3 className="text-cyber-cyan text-lg mb-1">Password Required</h3>
            <p className="text-cyber-gray/80">
              Enter the correct password to bypass the security system
            </p>
          </div>
          
          <div className="mb-6">
            <p className="text-cyber-cyan mb-1">POSSIBLE PASSWORD COMBINATIONS:</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {passwordOptions.map((pass, index) => (
                <div key={index} className="cyber-border bg-cyber-dark/30 p-2 text-center">
                  {pass}
                </div>
              ))}
            </div>
            
            <div>
              <label htmlFor="password" className="text-cyber-cyan/80 mb-1 block">ENTER PASSWORD:</label>
              <div className="flex gap-2">
                <input
                  id="password"
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-cyber-dark border border-cyber-cyan/30 text-cyber-cyan p-2 font-mono"
                  autoFocus
                  maxLength={config.passwordLength}
                />
                <button 
                  onClick={handleSubmit}
                  className="cyber-border bg-cyber-dark/80 px-4 py-2 text-cyber-cyan hover:bg-cyber-cyan/10"
                >
                  SUBMIT
                </button>
              </div>
              <p className="mt-2 text-cyber-gray/60">
                Attempts: {attempts}/{config.maxAttempts}
              </p>
            </div>
          </div>
          
          {attemptHistory.length > 0 && (
            <div className="cyber-border bg-cyber-dark/50 p-2">
              <p className="text-cyber-cyan/80 mb-1">ATTEMPT HISTORY:</p>
              <div className="space-y-1">
                {attemptHistory.map((attempt, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{attempt.password}</span>
                    <span className={
                      attempt.correctChars === 0 
                        ? 'text-cyber-red' 
                        : attempt.correctChars === correctPassword.length 
                          ? 'text-cyber-cyan' 
                          : 'text-yellow-400'
                    }>
                      {attempt.correctChars}/{correctPassword.length} correct
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-center mt-4">
            {message && (
              <p className={`cyber-border inline-block px-3 py-1 ${
                message.includes("ACCESS GRANTED") 
                  ? "text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10" 
                  : "text-cyber-red border-cyber-red bg-cyber-red/10"
              }`}>
                {message}
              </p>
            )}
          </div>
        </div>
        
        <div className="cyber-border p-4 bg-cyber-dark/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-cyber-gray/80">Security Level:</span>
            <span className={`font-mono ${securityLevel > 75 ? 'text-cyber-red' : securityLevel > 50 ? 'text-orange-400' : securityLevel > 25 ? 'text-yellow-400' : 'text-green-400'}`}>
              {securityLevel}%
            </span>
          </div>
          <div className="h-2 bg-cyber-dark/50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                securityLevel > 75 ? 'bg-cyber-red' : securityLevel > 50 ? 'bg-orange-400' : securityLevel > 25 ? 'bg-yellow-400' : 'bg-green-400'
              }`} 
              style={{ width: `${securityLevel}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="text-xl text-cyber-cyan font-display mb-4">MISSION DATA</h2>
        
        <div className="space-y-4">
          <div className="cyber-border bg-cyber-dark/30 p-3">
            <h3 className="text-cyber-pink mb-1">OBJECTIVE:</h3>
            <p className="text-cyber-gray/90">
              Crack the secure terminal password to gain access to the banking system. The correct password is one of the six displayed options.
            </p>
          </div>
          
          <div className="cyber-border bg-cyber-dark/30 p-3">
            <h3 className="text-cyber-pink mb-1">PASSWORD CLUES:</h3>
            <ul className="list-disc list-inside text-cyber-gray/90 space-y-1">
              <li>Each attempt will tell you how many characters are in the correct position</li>
              <li>Use process of elimination to determine the correct password</li>
              <li>You have {config.maxAttempts} attempts before the system locks down</li>
              <li>Each incorrect attempt raises the security level by {config.securityIncrease}%</li>
            </ul>
          </div>
          
          <div className="cyber-border bg-cyber-dark/30 p-3">
            <h3 className="text-cyber-pink mb-1">SECURITY NOTICE:</h3>
            <p className="text-cyber-gray/90">
              This terminal is protected by advanced encryption. Failed attempts are logged and may trigger additional security measures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalHack;
