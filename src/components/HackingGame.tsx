
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, ShieldAlert, Check, Terminal as TerminalIcon, Database, Wifi, Cpu } from 'lucide-react';
import Terminal from './Terminal';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import MemoryHack from './games/MemoryHack';
import CircuitHack from './games/CircuitHack';
import NetworkHack from './games/NetworkHack';
import TerminalHack from './games/TerminalHack';

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

const getGameIcon = (missionId: number) => {
  switch (missionId) {
    case 1: return <Database className="w-16 h-16 text-cyber-cyan" />;
    case 2: return <Wifi className="w-16 h-16 text-cyber-cyan" />;
    case 3: return <TerminalIcon className="w-16 h-16 text-cyber-cyan" />;
    case 4: return <Cpu className="w-16 h-16 text-cyber-cyan" />;
    default: return <TerminalIcon className="w-16 h-16 text-cyber-cyan" />;
  }
};

const getGameComponent = (missionId: number, props: any) => {
  switch (missionId) {
    case 1: return <MemoryHack {...props} />;
    case 2: return <NetworkHack {...props} />; 
    case 3: return <TerminalHack {...props} />;
    case 4: return <CircuitHack {...props} />;
    default: return <TerminalHack {...props} />;
  }
};

const getGameTips = (missionId: number) => {
  switch (missionId) {
    case 1: return [
      "Use the HINT button to reveal correct memory addresses",
      "The SCAN function will briefly highlight all correct addresses",
      "Look for patterns in the memory grid",
      "You only need to select the exact number of required addresses"
    ];
    case 2: return [
      "Start from any node and build a connected path",
      "Pink nodes are critical and must be activated",
      "Plan your route to avoid potential firewall blocks",
      "Each node must connect to an already active node"
    ];
    case 3: return [
      "Each attempt shows how many characters are in the correct position",
      "Click on a password in the list to automatically enter it",
      "Use the HINT button to reveal one correct character",
      "Process of elimination is key to solving the puzzle"
    ];
    case 4: return [
      "Place logic gates to modify the input signals",
      "Connect gates to create a circuit that matches the target output",
      "Watch out for corrupted gates that invert their output",
      "You can remove and replace gates if needed"
    ];
    default: return ["No tips available for this game type"];
  }
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
  const [showTips, setShowTips] = useState(true);

  // Setup game on start
  useEffect(() => {
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
  }, [missionCompany, toast]);
  
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

  const handleGameSuccess = useCallback(() => {
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
  }, [timeLeft, onComplete, toast]);

  const handleGameFailure = useCallback(() => {
    setGameState('failed');
    toast({
      title: "ACCESS DENIED",
      description: "Security protocols activated. Mission failed.",
      className: "bg-cyber-dark border border-cyber-red/30 text-cyber-red"
    });
    
    // Call the onComplete callback with failure
    setTimeout(() => {
      onComplete(false, timeLeft);
    }, 2000);
  }, [timeLeft, onComplete, toast]);
  
  const handleSecurityLevelChange = useCallback((newLevel: number) => {
    setSecurityLevel(newLevel);
  }, []);
  
  const tips = getGameTips(missionId);
  
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
          <>
            {showTips && (
              <div className="mb-6 bg-cyber-dark/50 cyber-border p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-cyber-cyan font-display">TACTICAL TIPS</h3>
                  <button 
                    onClick={() => setShowTips(false)}
                    className="text-cyber-gray/60 hover:text-cyber-gray text-sm"
                  >
                    HIDE TIPS
                  </button>
                </div>
                <ul className="list-disc list-inside text-cyber-gray/90 space-y-1 pl-2">
                  {tips.map((tip, index) => (
                    <li key={index} className="text-sm">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-4">
              {getGameComponent(missionId, {
                difficulty,
                onSuccess: handleGameSuccess,
                onFailure: handleGameFailure,
                timeLeft,
                timeLimit,
                onSecurityLevelChange: handleSecurityLevelChange
              })}
            </div>
          </>
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
