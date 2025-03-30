
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Database, Clock, Shield, FileText, Download } from 'lucide-react';

interface MissionState {
  mission: {
    id: number;
    title: string;
    company: string;
    difficulty: string;
    rewards: string;
    timeLimit: number;
  };
}

const DataHeist: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const missionData = location.state as MissionState;
  const mission = missionData?.mission;
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(mission?.timeLimit || 300);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [firewalls, setFirewalls] = useState<{id: number, broken: boolean}[]>([
    { id: 1, broken: false },
    { id: 2, broken: false },
    { id: 3, broken: false },
    { id: 4, broken: false }
  ]);
  const [activeFirewallIndex, setActiveFirewallIndex] = useState(0);
  const [hackingPhase, setHackingPhase] = useState<'firewall' | 'download'>('firewall');
  const [hackAttempts, setHackAttempts] = useState(0);
  
  // Firewall puzzle state
  const [firewallSymbols, setFirewallSymbols] = useState<string[]>([]);
  const [correctSymbol, setCorrectSymbol] = useState('');
  const [symbolOptions, setSymbolOptions] = useState<string[]>([]);
  
  // Initialize game
  useEffect(() => {
    if (!mission) {
      toast({
        title: "Error",
        description: "Mission data not found. Returning to mission select.",
        variant: "destructive"
      });
      navigate("/");
      return;
    }

    // Welcome toast
    toast({
      title: "MISSION BRIEFING",
      description: `Infiltrate ${mission?.company}'s servers. Bypass firewalls and extract the classified data.`,
      className: "bg-cyber-dark border border-cyber-cyan/30 text-cyber-cyan"
    });
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          setSuccess(false);
          clearInterval(timer);
          toast({
            title: "TIME'S UP",
            description: "Security protocols activated. Mission failed.",
            variant: "destructive",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);
  
  // Handle download progress
  useEffect(() => {
    if (hackingPhase !== 'download' || !gameStarted || gameOver) return;
    
    const downloadTimer = setInterval(() => {
      setDownloadProgress(prev => {
        const newProgress = prev + 1;
        
        // Random security spikes
        if (Math.random() < 0.1 && securityLevel < 90) {
          const increase = Math.floor(Math.random() * 5) + 1;
          setSecurityLevel(prev => Math.min(prev + increase, 100));
          
          toast({
            title: "Security Spike",
            description: "Anomalous activity detected. Security level increased.",
            variant: "destructive",
          });
        }
        
        // Check for completion
        if (newProgress >= 100) {
          clearInterval(downloadTimer);
          setGameOver(true);
          setSuccess(true);
          toast({
            title: "DOWNLOAD COMPLETE",
            description: "You've successfully extracted all classified data.",
            className: "bg-cyber-dark border border-green-500/30 text-green-500",
          });
          return 100;
        }
        return newProgress;
      });
    }, timeLeft > 120 ? 400 : 300); // Speed increases when time is low
    
    return () => clearInterval(downloadTimer);
  }, [hackingPhase, gameStarted, gameOver]);
  
  // Generate new firewall puzzle
  const generateFirewallPuzzle = () => {
    const symbols = ['@', '#', '$', '%', '&', '*', '!', '?', '=', '+'];
    const shuffled = [...symbols].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);
    const correctIndex = Math.floor(Math.random() * selected.length);
    
    setFirewallSymbols(selected);
    setCorrectSymbol(selected[correctIndex]);
    
    // Generate options with the correct symbol and some decoys
    const options = [
      selected[correctIndex],
      ...shuffled.slice(6, 9) // 3 decoy symbols
    ].sort(() => 0.5 - Math.random());
    
    setSymbolOptions(options);
  };
  
  // Start the game
  const handleStartGame = () => {
    setGameStarted(true);
    generateFirewallPuzzle();
    toast({
      title: "INFILTRATION STARTED",
      description: "Bypass all firewalls and download the classified data.",
    });
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Attempt to hack firewall
  const handleFirewallHack = (symbol: string) => {
    setHackAttempts(prev => prev + 1);
    
    if (symbol === correctSymbol) {
      // Correct symbol!
      const updatedFirewalls = [...firewalls];
      updatedFirewalls[activeFirewallIndex].broken = true;
      setFirewalls(updatedFirewalls);
      
      toast({
        title: "Firewall Breached",
        description: `Security layer ${activeFirewallIndex + 1} bypassed.`,
        className: "bg-cyber-dark border border-green-500/30 text-green-500",
      });
      
      // Move to next firewall or start download
      if (activeFirewallIndex < firewalls.length - 1) {
        setActiveFirewallIndex(prev => prev + 1);
        generateFirewallPuzzle();
      } else {
        setHackingPhase('download');
        toast({
          title: "All Firewalls Bypassed",
          description: "Starting data extraction. Maintain low security level.",
          className: "bg-cyber-dark border border-cyber-cyan/30 text-cyber-cyan",
        });
      }
    } else {
      // Wrong symbol!
      const securityIncrease = 5 + (hackAttempts * 2);
      setSecurityLevel(prev => Math.min(prev + securityIncrease, 100));
      
      toast({
        title: "Access Denied",
        description: `Wrong symbol. Security level increased by ${securityIncrease}%.`,
        variant: "destructive",
      });
      
      // Check for game over
      if (securityLevel + securityIncrease >= 100) {
        setGameOver(true);
        setSuccess(false);
        toast({
          title: "SECURITY LOCKDOWN",
          description: "Maximum security level reached. Mission failed.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Return to mission selection
  const handleReturn = () => {
    navigate('/');
  };
  
  // Complete game and return to mission selection
  const handleCompleteGame = () => {
    navigate('/', { 
      state: { 
        missionCompleted: mission?.id, 
        success, 
        timeLeft 
      } 
    });
  };
  
  // Provide hint for the firewall
  const handleGetHint = () => {
    const securityIncrease = 10;
    setSecurityLevel(prev => Math.min(prev + securityIncrease, 100));
    
    toast({
      title: "Hint Activated",
      description: `The correct symbol is ${correctSymbol}. Security level increased by ${securityIncrease}%.`,
      className: "bg-cyber-dark border border-yellow-500/30 text-yellow-500",
    });
  };
  
  // Calculate security level color
  const getSecurityLevelColor = () => {
    if (securityLevel > 75) return 'text-cyber-red';
    if (securityLevel > 50) return 'text-orange-400';
    if (securityLevel > 25) return 'text-yellow-400';
    return 'text-green-400';
  };
  
  // Calculate security level background
  const getSecurityLevelBg = () => {
    if (securityLevel > 75) return 'bg-cyber-red';
    if (securityLevel > 50) return 'bg-orange-400';
    if (securityLevel > 25) return 'bg-yellow-400';
    return 'bg-green-400';
  };
  
  return (
    <div className="min-h-screen bg-cyber-black font-cyber text-cyber-gray">
      {/* Header */}
      <header className="p-4 border-b border-cyber-cyan/30 flex justify-between items-center">
        <button 
          onClick={handleReturn}
          className="cyber-border bg-cyber-dark/80 px-4 py-2 text-cyber-cyan flex items-center gap-2 hover:bg-cyber-cyan/10 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>RETURN</span>
        </button>
        
        <h1 className="text-2xl font-display text-cyber-cyan">
          {mission?.title || "DATA HEIST"}
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-cyber-cyan cyber-border px-2 py-1">
            <Clock size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>
          
          <div className={`flex items-center gap-1 cyber-border px-2 py-1 ${getSecurityLevelColor()}`}>
            <Shield size={16} />
            <span>{securityLevel}%</span>
          </div>
        </div>
      </header>
      
      {/* Game area */}
      <div className="p-4 max-w-6xl mx-auto">
        {!gameStarted && (
          <div className="glass-card p-8 my-8 text-center">
            <div className="inline-block cyber-border bg-cyber-dark/50 p-4 rounded-full mb-6">
              <Database className="w-16 h-16 text-cyber-cyan" />
            </div>
            <h2 className="text-3xl font-display text-cyber-cyan mb-4">
              {mission?.company || "ARASAKA"} SERVER INFILTRATION
            </h2>
            <p className="text-cyber-gray/80 max-w-lg mx-auto mb-8">
              Your mission is to breach the corporate server, bypass all security firewalls, 
              and extract classified research data before being detected.
              You have {Math.floor((mission?.timeLimit || 300) / 60)} minutes before the system
              detects your presence.
            </p>
            <button 
              onClick={handleStartGame}
              className="cyber-border bg-cyber-cyan/20 px-8 py-3 text-cyber-cyan hover:bg-cyber-cyan/30 transition-colors"
            >
              BEGIN INFILTRATION
            </button>
          </div>
        )}
        
        {gameStarted && !gameOver && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main gameplay area */}
            <div className="lg:col-span-2 glass-card p-6">
              <h2 className="text-xl text-cyber-cyan font-display mb-4">
                {hackingPhase === 'firewall' ? 'FIREWALL BREACH' : 'DATA EXTRACTION'}
              </h2>
              
              {hackingPhase === 'firewall' && (
                <div className="space-y-6">
                  <div className="cyber-border bg-cyber-black/90 p-4 mb-6">
                    <h3 className="text-cyber-cyan text-center mb-4">SECURITY LAYER {activeFirewallIndex + 1}/4</h3>
                    
                    <div className="grid grid-cols-3 gap-4 my-6">
                      {firewallSymbols.map((symbol, index) => (
                        <div 
                          key={index}
                          className="cyber-border bg-cyber-dark/70 p-6 text-4xl text-center"
                        >
                          <span className="text-cyber-gray">{symbol}</span>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-cyber-gray/80 mb-4 text-center">
                      Select the correct symbol that matches the pattern
                    </p>
                    
                    <div className="grid grid-cols-4 gap-3 mt-8">
                      {symbolOptions.map((symbol, index) => (
                        <button
                          key={index}
                          onClick={() => handleFirewallHack(symbol)}
                          className="cyber-border bg-cyber-dark/50 p-4 text-2xl text-cyber-cyan hover:bg-cyber-dark/70 transition-colors"
                        >
                          {symbol}
                        </button>
                      ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleGetHint}
                        className="cyber-border px-4 py-2 text-yellow-400 text-sm hover:bg-yellow-400/10 transition-colors"
                      >
                        GET HINT (+10% SECURITY)
                      </button>
                    </div>
                  </div>
                  
                  <div className="cyber-border p-4 bg-cyber-dark/30">
                    <div className="mb-4">
                      <h4 className="text-cyber-pink mb-2">FIREWALL STATUS:</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {firewalls.map((firewall, index) => (
                          <div 
                            key={firewall.id}
                            className={`cyber-border p-2 text-center ${
                              index === activeFirewallIndex ? 'border-cyber-cyan bg-cyber-cyan/10' : 
                              firewall.broken ? 'border-green-500 bg-green-500/10 text-green-500' : 
                              'border-cyber-red bg-cyber-red/10 text-cyber-red'
                            }`}
                          >
                            Layer {index + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {hackingPhase === 'download' && (
                <div className="space-y-6">
                  <div className="cyber-border bg-cyber-black/90 p-6">
                    <div className="flex justify-center mb-8">
                      <Download className="w-16 h-16 text-cyber-cyan animate-pulse" />
                    </div>
                    
                    <h3 className="text-cyber-cyan text-center mb-4">EXTRACTING CLASSIFIED DATA</h3>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{downloadProgress}%</span>
                      </div>
                      <div className="h-4 cyber-border overflow-hidden">
                        <div 
                          className="h-full bg-cyber-cyan transition-all duration-300"
                          style={{ width: `${downloadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="cyber-border p-4 bg-cyber-dark/20 mb-8">
                      <h4 className="text-cyber-pink mb-2">DATA FRAGMENTS RECOVERED:</h4>
                      <div className="font-mono text-xs text-cyber-gray/90 h-32 overflow-y-auto">
                        {Array.from({ length: Math.floor(downloadProgress / 5) }).map((_, index) => (
                          <div key={index} className="mb-1">
                            <span className="text-cyber-cyan">[{(index * 5).toString().padStart(2, '0')}%]</span> 
                            {' '}
                            DATA FRAGMENT {index + 1} :: {
                              Math.random().toString(36).substring(2, 15) + 
                              Math.random().toString(36).substring(2, 15)
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-cyber-gray/80 text-center">
                      Maintain low security levels while the data is being extracted.
                      Random security spikes may occur.
                    </p>
                  </div>
                  
                  <div className="cyber-border p-4 bg-cyber-dark/30">
                    <h4 className="text-cyber-pink mb-2">FIREWALL STATUS:</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {firewalls.map((firewall) => (
                        <div 
                          key={firewall.id}
                          className="cyber-border p-2 text-center border-green-500 bg-green-500/10 text-green-500"
                        >
                          Bypassed
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Side panel */}
            <div className="glass-card p-6">
              <h2 className="text-xl text-cyber-cyan font-display mb-4">MISSION STATUS</h2>
              
              <div className="cyber-border p-4 bg-cyber-dark/30 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-cyber-gray/80">Security Level:</span>
                  <span className={`font-mono ${getSecurityLevelColor()}`}>
                    {securityLevel}%
                  </span>
                </div>
                <div className="h-2 bg-cyber-dark/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${getSecurityLevelBg()}`} 
                    style={{ width: `${securityLevel}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="cyber-border p-4 bg-cyber-dark/30 mb-6">
                <h3 className="text-cyber-pink mb-2">OBJECTIVE:</h3>
                {hackingPhase === 'firewall' ? (
                  <p className="text-cyber-gray/90 text-sm">
                    Breach all 4 security firewalls to gain access to the classified data.
                    Find the correct symbol in each security layer.
                  </p>
                ) : (
                  <p className="text-cyber-gray/90 text-sm">
                    Extract all classified data (100%) while maintaining security level below critical.
                  </p>
                )}
              </div>
              
              <div className="cyber-border p-4 bg-cyber-dark/30 mb-6">
                <h3 className="text-cyber-pink mb-2">MISSION TIPS:</h3>
                <ul className="text-cyber-gray/90 text-sm space-y-2 list-disc list-inside">
                  <li>Each wrong attempt increases security level</li>
                  <li>Use hints sparingly as they increase security</li>
                  <li>If security level reaches 100%, mission fails</li>
                  <li>Time is limited - work efficiently</li>
                  {hackingPhase === 'download' && (
                    <li>Random security spikes may occur during download</li>
                  )}
                </ul>
              </div>
              
              <div className="cyber-border p-4 bg-cyber-dark/30">
                <h3 className="text-cyber-pink mb-2">MISSION REWARDS:</h3>
                <p className="text-cyber-gray/90 text-sm">
                  {mission?.rewards || "5,000 EC + Rare Cyberware"}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {gameOver && (
          <div className="glass-card p-8 my-8 text-center">
            <div className={`inline-block cyber-border bg-cyber-dark/50 p-4 rounded-full mb-6 ${
              success ? 'border-green-500' : 'border-cyber-red'
            }`}>
              <FileText className={`w-16 h-16 ${success ? 'text-green-500' : 'text-cyber-red'}`} />
            </div>
            <h2 className={`text-3xl font-display mb-4 ${success ? 'text-green-500' : 'text-cyber-red'}`}>
              MISSION {success ? 'SUCCESSFUL' : 'FAILED'}
            </h2>
            <p className="text-cyber-gray/80 max-w-lg mx-auto mb-8">
              {success 
                ? "You successfully extracted the classified data and escaped the security system."
                : "Your infiltration was detected. Security protocols terminated your connection."}
            </p>
            <button 
              onClick={handleCompleteGame}
              className={`cyber-border px-8 py-3 transition-colors ${
                success 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-cyber-red/20 text-cyber-red hover:bg-cyber-red/30'
              }`}
            >
              RETURN TO MISSION HUB
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataHeist;
