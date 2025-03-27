
import React from 'react';
import { Trophy, Clock, Database, Shield, ArrowLeft } from 'lucide-react';
import { useReveal } from '../utils/animations';

interface MissionResultsProps {
  success: boolean;
  missionTitle: string;
  missionCompany: string;
  timeLeft: number;
  timeLimit: number;
  difficulty: string;
  rewards: string;
  onReturn: () => void;
}

const MissionResults: React.FC<MissionResultsProps> = ({
  success,
  missionTitle,
  missionCompany,
  timeLeft,
  timeLimit,
  difficulty,
  rewards,
  onReturn
}) => {
  const { ref, revealed } = useReveal();
  
  // Calculate score percentage based on time left
  const scorePercentage = Math.floor((timeLeft / timeLimit) * 100);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div 
      ref={ref}
      className={`min-h-screen bg-cyber-black font-cyber text-cyber-gray pt-8 pb-20 transition-all duration-700 ${revealed ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <button 
            onClick={onReturn}
            className="cyber-border bg-cyber-dark/80 px-4 py-2 text-cyber-cyan flex items-center gap-2 hover:bg-cyber-cyan/10 transition-colors mx-auto mb-8"
          >
            <ArrowLeft size={16} />
            <span>RETURN TO MISSION HUB</span>
          </button>
          
          <h1 className={`text-5xl font-display font-bold mb-6 ${success ? 'text-cyber-cyan' : 'text-cyber-red'}`}>
            MISSION {success ? 'SUCCESSFUL' : 'FAILED'}
          </h1>
          
          <div className="max-w-md mx-auto glass-card p-6 mb-8">
            <h2 className="text-2xl font-display text-cyber-cyan mb-4">{missionTitle}</h2>
            <p className="text-cyber-gray/80">{missionCompany} NETWORK</p>
          </div>
          
          {success && (
            <div className="flex justify-center mb-8">
              <Trophy className="w-20 h-20 text-yellow-400 animate-pulse-cyan" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="glass-card p-6">
            <h3 className="text-xl font-display text-cyber-cyan mb-4">PERFORMANCE METRICS</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-cyber-gray/80 flex items-center gap-2">
                    <Clock size={16} className="text-cyber-cyan" /> TIME REMAINING
                  </span>
                  <span className="text-cyber-cyan font-display">{formatTime(timeLeft)}</span>
                </div>
                <div className="h-2 bg-cyber-dark/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyber-cyan transition-all duration-1000" 
                    style={{ width: `${scorePercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>0:00</span>
                  <span>{formatTime(timeLimit)}</span>
                </div>
              </div>
              
              <div className="cyber-border p-4 bg-cyber-dark/30">
                <div className="flex justify-between items-center">
                  <span className="text-cyber-gray/80">DIFFICULTY LEVEL</span>
                  <span className={`font-mono ${
                    difficulty === 'Easy' ? 'text-green-400' : 
                    difficulty === 'Medium' ? 'text-yellow-400' : 
                    difficulty === 'Hard' ? 'text-orange-400' : 
                    'text-cyber-red'
                  }`}>{difficulty}</span>
                </div>
              </div>
              
              <div className="cyber-border p-4 bg-cyber-dark/30">
                <div className="flex justify-between items-center">
                  <span className="text-cyber-gray/80">EFFICIENCY SCORE</span>
                  <span className="font-mono text-cyber-cyan">{Math.max(0, scorePercentage)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-xl font-display text-cyber-pink mb-4">
              {success ? 'REWARDS ACQUIRED' : 'REWARDS FORFEITED'}
            </h3>
            
            {success ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4 cyber-border p-4 bg-cyber-dark/30">
                  <Database className="w-8 h-8 text-cyber-cyan shrink-0 mt-1" />
                  <div>
                    <h4 className="text-cyber-cyan mb-1">CREDIT TRANSFER</h4>
                    <p className="text-cyber-gray/90">{rewards.split(' + ')[0]} credited to your account</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 cyber-border p-4 bg-cyber-dark/30">
                  <Shield className="w-8 h-8 text-cyber-cyan shrink-0 mt-1" />
                  <div>
                    <h4 className="text-cyber-cyan mb-1">ITEM ACQUIRED</h4>
                    <p className="text-cyber-gray/90">{rewards.split(' + ')[1]} added to inventory</p>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <button 
                    onClick={onReturn}
                    className="cyber-border px-6 py-3 text-cyber-cyan hover:bg-cyber-cyan/10 hover:shadow-neon transition-all duration-300"
                  >
                    MISSION COMPLETE
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="cyber-border p-4 bg-cyber-dark/30">
                  <p className="text-cyber-gray/90">
                    Mission failure results in no rewards. The potential rewards of {rewards} have been lost.
                  </p>
                </div>
                
                <div className="cyber-border p-4 bg-cyber-dark/30">
                  <h4 className="text-cyber-red mb-1">SECURITY ALERT</h4>
                  <p className="text-cyber-gray/90">
                    Security protocols have been heightened in the {missionCompany} network. Future infiltration attempts may be more difficult.
                  </p>
                </div>
                
                <div className="mt-8 text-center">
                  <button 
                    onClick={onReturn}
                    className="cyber-border px-6 py-3 text-cyber-cyan hover:bg-cyber-cyan/10 hover:shadow-neon transition-all duration-300"
                  >
                    RETURN TO BASE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionResults;
