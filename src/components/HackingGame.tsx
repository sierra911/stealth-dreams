
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, ShieldAlert, Check } from 'lucide-react';
import Terminal from './Terminal';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GameProps {
  missionId: number;
  missionTitle: string;
  missionCompany: string;
  difficulty: string;
  timeLimit: number; // in seconds
  onComplete: (success: boolean, timeLeft: number) => void;
  onExit: () => void;
}

const difficultyToLevels = {
  'Easy': 2,
  'Medium': 3,
  'Hard': 4,
  'Expert': 5
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
  const level = difficultyToLevels[difficulty as keyof typeof difficultyToLevels] || 3;
  const passwordLength = 5 + level;
  
  // Generate decoy passwords
  const passwords = Array(6).fill('').map(() => generatePassword(passwordLength));
  
  // Replace one with the correct password
  const correctIndex = Math.floor(Math.random() * passwords.length);
  passwords[correctIndex] = correctPassword;
  
  return passwords;
};

const HackingGame: React.FC<GameProps> = ({ 
  missionId, 
  missionTitle, 
  missionCompany, 
  difficulty, 
  timeLimit,
  onComplete,
  onExit 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameState, setGameState] = useState<'connecting'|'hacking'|'success'|'failed'>('connecting');
  const [securityLevel, setSecurityLevel] = useState(100);
  const [userInput, setUserInput] = useState('');
  const [correctPassword, setCorrectPassword] = useState('');
  const [passwordOptions, setPasswordOptions] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = difficultyToLevels[difficulty as keyof typeof difficultyToLevels] || 3;
  
  // Setup game on start
  useEffect(() => {
    // Generate the correct password based on difficulty
    const level = difficultyToLevels[difficulty as keyof typeof difficultyToLevels] || 3;
    const password = generatePassword(5 + level);
    setCorrectPassword(password);
    
    // Generate password options
    setPasswordOptions(generatePasswordList(difficulty, password));
    
    // Start with "connecting" state
    const connectingTimer = setTimeout(() => {
      setGameState('hacking');
      toast({
        title: "CONNECTION ESTABLISHED",
        description: `Infiltrating ${missionCompany} network. Security protocols active.`,
        className: "bg-cyber-dark border border-cyber-cyan/30 text-cyber-cyan"
      });
    }, 3000);
    
    return () => clearTimeout(connectingTimer);
  }, [difficulty, missionCompany, toast]);
  
  // Timer countdown
  useEffect(() => {
    if (gameState !== 'hacking') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('failed');
          toast({
            title: "CONNECTION TERMINATED",
            description: "Security protocols detected the breach. Mission failed.",
            className: "bg-cyber-dark border border-cyber-red/30 text-cyber-red"
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState, toast]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle password submission
  const handleSubmit = useCallback(() => {
    if (gameState !== 'hacking') return;
    
    if (userInput.toUpperCase() === correctPassword) {
      // Success!
      setGameState('success');
      toast({
        title: "ACCESS GRANTED",
        description: "Security bypassed. Data extraction complete.",
        className: "bg-cyber-dark border border-cyber-cyan/30 text-cyber-cyan"
      });
      
      // Call the onComplete callback with success and remaining time
      setTimeout(() => {
        onComplete(true, timeLeft);
      }, 2000);
    } else {
      // Wrong password
      setAttempts(prev => {
        const newAttempts = prev + 1;
        const securityIncrease = Math.floor(Math.random() * 20) + 10;
        setSecurityLevel(level => Math.min(level + securityIncrease, 100));
        
        if (newAttempts >= maxAttempts) {
          setGameState('failed');
          toast({
            title: "ACCESS DENIED",
            description: "Maximum attempts reached. Security lockdown initiated.",
            className: "bg-cyber-dark border border-cyber-red/30 text-cyber-red"
          });
          
          // Call the onComplete callback with failure
          setTimeout(() => {
            onComplete(false, timeLeft);
          }, 2000);
        } else {
          toast({
            title: "ACCESS DENIED",
            description: `Incorrect password. Security level increased. ${maxAttempts - newAttempts} attempts remaining.`,
            className: "bg-cyber-dark border border-cyber-red/30 text-cyber-red"
          });
        }
        
        return newAttempts;
      });
      setUserInput('');
    }
  }, [userInput, correctPassword, gameState, toast, maxAttempts, onComplete, timeLeft]);
  
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
    <div className="min-h-screen bg-cyber-black font-cyber text-cyber-gray pb-20">
      {/* Top bar with mission info */}
      <div className="bg-cyber-dark border-b border-cyber-cyan/20 p-4">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <button 
            className="cyber-border bg-cyber-dark/80 px-3 py-2 text-cyber-cyan flex items-center gap-2 hover:bg-cyber-cyan/10 transition-colors"
            onClick={onExit}
          >
            <ArrowLeft size={16} />
            <span>ABORT MISSION</span>
          </button>
          
          <div className="text-center my-2 md:my-0">
            <h1 className="font-display text-xl text-cyber-cyan">{missionTitle}</h1>
            <p className="text-cyber-gray/80 text-sm">{missionCompany} NETWORK</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 ${timeLeft < timeLimit * 0.25 ? 'text-cyber-red' : 'text-cyber-cyan'}`}>
              <Clock size={16} />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
            
            <div className="flex items-center gap-1 text-cyber-red">
              <ShieldAlert size={16} />
              <span className="font-mono">{securityLevel}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main game content */}
      <div className="container mx-auto p-4">
        {/* Different content based on game state */}
        {gameState === 'connecting' && (
          <div className="max-w-2xl mx-auto my-12">
            <Terminal 
              initialText="Connecting to target system..." 
              commands={[
                "> BYPASSING FIREWALL",
                "> SPOOFING CREDENTIALS",
                "> ESTABLISHING SECURE TUNNEL",
                "> SCANNING NETWORK TOPOLOGY",
                "> SEARCHING FOR VULNERABILITIES"
              ]}
            />
          </div>
        )}
        
        {gameState === 'hacking' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="glass-card p-6">
              <h2 className="text-xl text-cyber-cyan font-display mb-4">SYSTEM ACCESS TERMINAL</h2>
              
              <div className="cyber-border bg-cyber-black/90 p-4 mb-6 font-mono text-sm">
                <p className="text-cyber-gray/80 mb-4">SECURITY PROTOCOL ACTIVE - PASSWORD REQUIRED</p>
                <p className="text-cyber-cyan mb-1">POSSIBLE PASSWORD COMBINATIONS DETECTED:</p>
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
                    />
                    <button 
                      onClick={handleSubmit}
                      className="cyber-border bg-cyber-dark/80 px-4 py-2 text-cyber-cyan hover:bg-cyber-cyan/10"
                    >
                      SUBMIT
                    </button>
                  </div>
                  <p className="mt-2 text-cyber-gray/60">
                    Attempts: {attempts}/{maxAttempts} | Security Level: {securityLevel}%
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-cyber-gray/80">
                <p>* WARNING: Each incorrect attempt increases security level.</p>
                <p>* At maximum security level, the system will initiate lockdown.</p>
                <p>* Time limit enforced by corporate countermeasures.</p>
              </div>
            </div>
            
            <div className="glass-card p-6">
              <h2 className="text-xl text-cyber-cyan font-display mb-4">MISSION DATA</h2>
              
              <div className="space-y-4">
                <div className="cyber-border bg-cyber-dark/30 p-3">
                  <h3 className="text-cyber-pink mb-1">OBJECTIVE:</h3>
                  <p className="text-cyber-gray/90">Gain access to the secure terminal by entering the correct password.</p>
                </div>
                
                <div className="cyber-border bg-cyber-dark/30 p-3">
                  <h3 className="text-cyber-pink mb-1">STRATEGY:</h3>
                  <ul className="list-disc list-inside text-cyber-gray/90 space-y-1">
                    <li>Analyze the possible passwords for patterns.</li>
                    <li>Use elimination to identify the most likely candidate.</li>
                    <li>Enter the password carefully to avoid security alerts.</li>
                  </ul>
                </div>
                
                <div className="cyber-border bg-cyber-dark/30 p-3">
                  <h3 className="text-cyber-pink mb-1">DIFFICULTY:</h3>
                  <p className="text-cyber-gray/90">{difficulty}: {maxAttempts} attempts allowed</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {gameState === 'success' && (
          <div className="max-w-2xl mx-auto glass-card p-8 my-12 text-center">
            <div className="inline-block cyber-border bg-cyber-dark/50 p-4 rounded-full mb-6">
              <Check className="w-16 h-16 text-cyber-cyan" />
            </div>
            <h2 className="text-3xl font-display text-cyber-cyan mb-4">MISSION SUCCESSFUL</h2>
            <p className="text-xl text-cyber-gray/90 mb-6">
              You've successfully hacked into the {missionCompany} network.
            </p>
            <p className="text-lg text-cyber-cyan mb-8">
              Time remaining: {formatTime(timeLeft)}
            </p>
            <button
              onClick={() => onComplete(true, timeLeft)}
              className="cyber-border px-8 py-3 text-cyber-cyan text-lg hover:bg-cyber-cyan/10 hover:shadow-neon transition-all duration-300"
            >
              CONTINUE
            </button>
          </div>
        )}
        
        {gameState === 'failed' && (
          <div className="max-w-2xl mx-auto glass-card p-8 my-12 text-center">
            <div className="inline-block cyber-border bg-cyber-dark/50 p-4 rounded-full mb-6">
              <ShieldAlert className="w-16 h-16 text-cyber-red" />
            </div>
            <h2 className="text-3xl font-display text-cyber-red mb-4">MISSION FAILED</h2>
            <p className="text-xl text-cyber-gray/90 mb-6">
              Security protocols detected your intrusion attempt.
            </p>
            <p className="text-lg text-cyber-red mb-8">
              Correct password was: {correctPassword}
            </p>
            <button
              onClick={() => onComplete(false, timeLeft)}
              className="cyber-border px-8 py-3 text-cyber-cyan text-lg hover:bg-cyber-cyan/10 hover:shadow-neon transition-all duration-300"
            >
              RETURN TO BASE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HackingGame;
