
import React, { useState } from 'react';
import { Shield, Cpu, Database, Wifi } from 'lucide-react';
import { useReveal } from '../utils/animations';
import HackingGame from './HackingGame';
import MissionResults from './MissionResults';
import { useNavigate } from 'react-router-dom';

interface Mission {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  rewards: string;
  icon: React.ReactNode;
  company: string;
  timeLimit: number; // in seconds
  gameType: 'terminal' | 'blueprint' | 'surveillance' | 'terminal-secure' | 'system-backdoor';
}

const missions: Mission[] = [
  {
    id: 1,
    title: "BLUEPRINT EXTRACTION",
    description: "Infiltrate Arasaka's R&D network and extract new weapon blueprints without triggering security protocols.",
    difficulty: 'Medium',
    rewards: "5,000 EC + Rare Cyberware",
    icon: <Database className="w-10 h-10 text-cyber-cyan" />,
    company: "ARASAKA",
    timeLimit: 300,  // 5 minutes
    gameType: 'blueprint'
  },
  {
    id: 2,
    title: "SURVEILLANCE OVERRIDE",
    description: "Disable Militech's AI surveillance drones monitoring the downtown district for 30 minutes.",
    difficulty: 'Hard',
    rewards: "8,000 EC + Advanced Hacking Tool",
    icon: <Wifi className="w-10 h-10 text-cyber-cyan" />,
    company: "MILITECH",
    timeLimit: 240,  // 4 minutes
    gameType: 'surveillance'
  },
  {
    id: 3,
    title: "SECURE TERMINAL BREACH",
    description: "Crack the password on Night City Central Bank's secure terminals and transfer funds to your account.",
    difficulty: 'Expert',
    rewards: "12,000 EC + Legendary Program",
    icon: <Shield className="w-10 h-10 text-cyber-cyan" />,
    company: "NIGHT CITY BANK",
    timeLimit: 300,  // 5 minutes
    gameType: 'terminal-secure'
  },
  {
    id: 4,
    title: "SYSTEM BACKDOOR",
    description: "Plant a backdoor into Biotechnica's mainframe for future covert access to their research data.",
    difficulty: 'Easy',
    rewards: "3,000 EC + Common Implant",
    icon: <Cpu className="w-10 h-10 text-cyber-cyan" />,
    company: "BIOTECHNICA",
    timeLimit: 120,  // 2 minutes
    gameType: 'system-backdoor'
  }
];

const difficultyColors = {
  'Easy': 'text-green-400',
  'Medium': 'text-yellow-400',
  'Hard': 'text-orange-400',
  'Expert': 'text-cyber-red'
};

const MissionSelect: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [gameState, setGameState] = useState<'selection' | 'playing' | 'results'>('selection');
  const [gameResults, setGameResults] = useState<{success: boolean, timeLeft: number} | null>(null);
  const { ref: sectionRef, revealed: sectionRevealed } = useReveal();
  
  const handleMissionSelect = (mission: Mission) => {
    setSelectedMission(mission);
  };
  
  const handleLaunchMission = () => {
    if (selectedMission) {
      if (selectedMission.gameType === 'terminal') {
        setGameState('playing');
      } else if (selectedMission.gameType === 'blueprint') {
        navigate('/game/blueprint-extraction', { 
          state: { 
            mission: selectedMission
          }
        });
      } else {
        // For other game types that aren't implemented yet, fallback to terminal
        setGameState('playing');
      }
    }
  };
  
  const handleGameComplete = (success: boolean, timeLeft: number) => {
    setGameResults({ success, timeLeft });
    setGameState('results');
  };
  
  const handleReturn = () => {
    setGameState('selection');
    setSelectedMission(null);
    setGameResults(null);
  };
  
  if (gameState === 'playing' && selectedMission) {
    return (
      <HackingGame 
        missionId={selectedMission.id}
        missionTitle={selectedMission.title}
        missionCompany={selectedMission.company}
        difficulty={selectedMission.difficulty}
        timeLimit={selectedMission.timeLimit}
        onComplete={handleGameComplete}
        onExit={handleReturn}
      />
    );
  }
  
  if (gameState === 'results' && selectedMission && gameResults) {
    return (
      <MissionResults
        success={gameResults.success}
        missionTitle={selectedMission.title}
        missionCompany={selectedMission.company}
        timeLeft={gameResults.timeLeft}
        timeLimit={selectedMission.timeLimit}
        difficulty={selectedMission.difficulty}
        rewards={selectedMission.rewards}
        onReturn={handleReturn}
      />
    );
  }
  
  return (
    <section id="missions" className="py-20 relative">
      <div className="absolute inset-0 cyber-grid-bg opacity-10"></div>
      
      <div 
        ref={sectionRef} 
        className={`container mx-auto px-4 relative z-10 transition-all duration-700 ${sectionRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
      >
        <div className="text-center mb-16">
          <p className="inline-block cyber-border px-4 py-1 text-cyber-cyan mb-4">
            AVAILABLE CONTRACTS
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            SELECT YOUR <span className="neon-text">MISSION</span>
          </h2>
          <p className="text-xl text-cyber-gray/80 max-w-2xl mx-auto">
            Choose your next infiltration target. Each corporation presents unique 
            challenges and security systems to bypass.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {missions.map((mission, index) => (
            <div 
              key={mission.id}
              className={`glass-card p-5 transition-all duration-500 cursor-pointer hover:border-cyber-cyan/50 hover:shadow-neon group ${selectedMission?.id === mission.id ? 'border-cyber-cyan shadow-neon' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleMissionSelect(mission)}
            >
              <div className="mb-4 flex justify-between items-start">
                <div className="p-2 cyber-border bg-cyber-dark/70">
                  {mission.icon}
                </div>
                <span className="inline-block text-sm cyber-border px-2 py-1 text-cyber-gray/80">
                  {mission.company}
                </span>
              </div>
              
              <h3 className="text-xl font-display font-bold mb-2 text-cyber-gray group-hover:text-cyber-cyan transition-colors">
                {mission.title}
              </h3>
              
              <p className="text-cyber-gray/70 mb-4 text-sm">
                {mission.description}
              </p>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-cyber-cyan/20">
                <span className={`text-sm ${difficultyColors[mission.difficulty]}`}>
                  {mission.difficulty}
                </span>
                <span className="text-sm text-cyber-cyan">
                  {mission.rewards}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {selectedMission && (
          <div className="mt-12 glass-card p-6 animate-fade-in">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <span className="text-sm cyber-border px-2 py-1 text-cyber-gray/80 mb-4 inline-block">
                  {selectedMission.company}
                </span>
                <h3 className="text-2xl md:text-3xl font-display font-bold mb-2 text-cyber-cyan">
                  {selectedMission.title}
                </h3>
                <p className={`text-sm ${difficultyColors[selectedMission.difficulty]}`}>
                  Difficulty: {selectedMission.difficulty}
                </p>
              </div>
              
              <div>
                <button 
                  className="cyber-border px-6 py-2 text-cyber-cyan hover:bg-cyber-cyan/10 hover:shadow-neon transition-all duration-300"
                  onClick={handleLaunchMission}
                >
                  LAUNCH MISSION
                </button>
              </div>
            </div>
            
            <div className="cyber-border p-4 bg-cyber-black/50 mb-6">
              <h4 className="text-cyber-cyan mb-2 font-cyber">MISSION BRIEFING:</h4>
              <p className="text-cyber-gray/90">
                {selectedMission.description} This contract requires precision hacking 
                and stealth. You'll need to bypass multiple security layers and avoid 
                detection by AI countermeasures. Time is critical - get in, execute, 
                and extract before rival netrunners locate your signal.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-4">
                <h4 className="text-cyber-pink mb-2 font-cyber">REWARDS:</h4>
                <p className="text-cyber-gray/90">{selectedMission.rewards}</p>
              </div>
              <div className="glass-card p-4">
                <h4 className="text-cyber-pink mb-2 font-cyber">TIMEFRAME:</h4>
                <p className="text-cyber-gray/90">{Math.floor(selectedMission.timeLimit / 60)}:00 minutes</p>
              </div>
              <div className="glass-card p-4">
                <h4 className="text-cyber-pink mb-2 font-cyber">SUCCESS RATE:</h4>
                <p className="text-cyber-gray/90">32% historical completion</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MissionSelect;
