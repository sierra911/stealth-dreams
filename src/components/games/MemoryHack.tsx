import React, { useState, useEffect } from 'react';
import { Database, AlertTriangle, FileText } from 'lucide-react';

interface MemoryHackProps {
  difficulty: string;
  onSuccess: () => void;
  onFailure: () => void;
  timeLeft: number;
  timeLimit: number;
  onSecurityLevelChange: (level: number) => void;
}

interface MemoryCell {
  value: string;
  selected: boolean;
  correct: boolean;
  wrong: boolean;
  hinted: boolean;
}

const difficultyConfig = {
  'Easy': { requiredSelections: 3, securityIncrease: 15 },
  'Medium': { requiredSelections: 3, securityIncrease: 20 },
  'Hard': { requiredSelections: 4, securityIncrease: 30 },
  'Expert': { requiredSelections: 5, securityIncrease: 40 }
};

const memoryCells = [
  'E9', '7A', 'BD', 'FF',
  '1C', '55', 'A4', '0D',
  '3F', 'C2', '8B', '6E',
  'D1', '9F', '2E', '4C'
];

const MemoryHack: React.FC<MemoryHackProps> = ({ 
  difficulty, 
  onSuccess,
  onFailure,
  timeLeft,
  timeLimit,
  onSecurityLevelChange
}) => {
  const [cells, setCells] = useState<MemoryCell[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [correctSequence, setCorrectSequence] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [scanActive, setScanActive] = useState(false);
  
  const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.Medium;
  
  // Initialize the game
  useEffect(() => {
    // Generate a random sequence to match
    const sequence = [...memoryCells]
      .sort(() => Math.random() - 0.5)
      .slice(0, config.requiredSelections);
    
    setCorrectSequence(sequence);
    console.log("Correct sequence:", sequence); // For debugging
    
    // Initialize cells
    const initialCells = memoryCells.map(value => ({
      value,
      selected: false,
      correct: false,
      wrong: false,
      hinted: false
    }));
    
    setCells(initialCells);
  }, [difficulty, config.requiredSelections]);
  
  const handleCellClick = (index: number) => {
    // Don't allow clicking if the cell is already selected
    if (cells[index].selected) return;
    
    // Update the selected cell
    const newCells = [...cells];
    const cellValue = newCells[index].value;
    
    // Check if this cell is part of the correct sequence
    const isCorrect = correctSequence.includes(cellValue);
    
    newCells[index] = {
      ...newCells[index],
      selected: true,
      correct: isCorrect,
      wrong: !isCorrect
    };
    
    setCells(newCells);
    setSelectedCount(prev => prev + 1);
    
    // If wrong, increase security level
    if (!isCorrect) {
      const newSecurityLevel = Math.min(securityLevel + config.securityIncrease, 100);
      setSecurityLevel(newSecurityLevel);
      onSecurityLevelChange(100 - newSecurityLevel);
      
      // If security level is too high, fail the mission
      if (newSecurityLevel >= 100) {
        setMessage("SECURITY BREACH DETECTED: Incorrect memory address selection");
        setTimeout(() => onFailure(), 1500);
        return;
      }
      
      setMessage("WARNING: Incorrect memory address");
      setTimeout(() => setMessage(null), 1500);
    } else {
      setMessage("Memory address verified");
      setTimeout(() => setMessage(null), 1500);
    }
    
    // Check if we've selected enough cells
    if (selectedCount + 1 >= config.requiredSelections) {
      // Count how many correct selections we made
      const correctCount = newCells.filter(cell => cell.selected && cell.correct).length;
      
      // If all selections were correct, succeed
      if (correctCount >= config.requiredSelections) {
        setMessage("ACCESS PROTOCOL BYPASSED");
        setTimeout(() => onSuccess(), 1500);
      } else {
        // Not enough correct selections, fail
        setMessage("SECURITY BREACH DETECTED: Insufficient correct memory addresses");
        setTimeout(() => onFailure(), 1500);
      }
    }
  };
  
  // Provide a hint by highlighting one correct cell
  const provideHint = () => {
    if (hintsUsed >= 2) {
      setMessage("MAXIMUM HINTS USED");
      setTimeout(() => setMessage(null), 1500);
      return;
    }
    
    const newCells = [...cells];
    const unselectedCorrectCells = correctSequence
      .map(value => ({ value, index: newCells.findIndex(cell => cell.value === value && !cell.selected && !cell.hinted) }))
      .filter(item => item.index !== -1);
    
    if (unselectedCorrectCells.length === 0) {
      setMessage("NO MORE HINTS AVAILABLE");
      setTimeout(() => setMessage(null), 1500);
      return;
    }
    
    // Select a random correct cell to hint
    const randomHint = unselectedCorrectCells[Math.floor(Math.random() * unselectedCorrectCells.length)];
    newCells[randomHint.index].hinted = true;
    
    setCells(newCells);
    setHintsUsed(prev => prev + 1);
    
    // Apply small security penalty for using a hint
    const newSecurityLevel = Math.min(securityLevel + 10, 100);
    setSecurityLevel(newSecurityLevel);
    onSecurityLevelChange(100 - newSecurityLevel);
    
    setMessage("HINT PROVIDED: highlighted memory address is part of the correct sequence");
    setTimeout(() => setMessage(null), 3000);
  };
  
  // Run a memory scan to help identify correct cells
  const runMemoryScan = () => {
    if (scanActive) return;
    
    setScanActive(true);
    setMessage("RUNNING MEMORY SCAN...");
    
    // Apply security penalty for running a scan
    const newSecurityLevel = Math.min(securityLevel + 15, 100);
    setSecurityLevel(newSecurityLevel);
    onSecurityLevelChange(100 - newSecurityLevel);
    
    // After a delay, show a temporary highlight on all correct cells
    setTimeout(() => {
      const newCells = [...cells];
      
      // Temporarily mark all unselected correct cells
      correctSequence.forEach(value => {
        const index = newCells.findIndex(cell => cell.value === value && !cell.selected);
        if (index !== -1) {
          newCells[index].hinted = true;
        }
      });
      
      setCells(newCells);
      setMessage("SCAN COMPLETE: Results displayed for 3 seconds");
      
      // After 3 seconds, remove the highlights (but keep user-selected hints)
      setTimeout(() => {
        const resetCells = [...newCells];
        resetCells.forEach((cell, idx) => {
          if (!cells[idx].hinted) { // Don't reset user-requested hints
            resetCells[idx].hinted = false;
          }
        });
        
        setCells(resetCells);
        setScanActive(false);
        setMessage(null);
      }, 3000);
    }, 1500);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card p-6">
        <h2 className="text-xl text-cyber-cyan font-display mb-4">NETWORK ACCESS PROTOCOL</h2>
        
        <div className="cyber-border bg-cyber-black/90 p-4 mb-6 font-mono text-sm">
          <div className="text-center mb-6">
            <Database className="w-12 h-12 text-cyber-cyan mx-auto mb-2" />
            <h3 className="text-cyber-cyan text-lg mb-1">Memory Address Selection</h3>
            <p className="text-cyber-gray/80">
              Select {config.requiredSelections} memory addresses to complete the access protocol
            </p>
            <p className="text-cyber-gray/60 text-xs mt-1">
              Required: {selectedCount}/{config.requiredSelections} addresses
            </p>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {cells.map((cell, index) => (
              <button 
                key={index}
                onClick={() => handleCellClick(index)}
                className={`cyber-border p-2 text-center transition-all duration-200 ${
                  cell.selected 
                    ? cell.correct 
                      ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan' 
                      : 'bg-cyber-red/20 text-cyber-red border-cyber-red'
                    : cell.hinted
                      ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400 pulse'
                      : 'bg-cyber-dark/30 hover:bg-cyber-dark/50 text-cyber-gray hover:text-cyber-cyan'
                }`}
                disabled={cell.selected}
              >
                {cell.value}
              </button>
            ))}
          </div>
          
          <div className="text-center text-cyber-gray/80 min-h-[40px]">
            {message && (
              <p className={`cyber-border inline-block px-3 py-1 ${
                message.includes("ACCESS PROTOCOL") 
                  ? "text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10" 
                  : message.includes("WARNING") || message.includes("SECURITY BREACH") 
                    ? "text-cyber-red border-cyber-red bg-cyber-red/10"
                    : message.includes("SCAN") || message.includes("HINT") 
                      ? "text-yellow-400 border-yellow-400 bg-yellow-400/10"
                      : "text-cyber-gray"
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
          <div className="h-2 bg-cyber-dark/50 rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full transition-all duration-500 ${
                securityLevel > 75 ? 'bg-cyber-red' : securityLevel > 50 ? 'bg-orange-400' : securityLevel > 25 ? 'bg-yellow-400' : 'bg-green-400'
              }`} 
              style={{ width: `${securityLevel}%` }}
            ></div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={provideHint}
              disabled={hintsUsed >= 2}
              className={`flex items-center gap-2 cyber-border px-3 py-1 text-sm ${
                hintsUsed >= 2 
                  ? 'bg-cyber-dark/30 text-cyber-gray/50 cursor-not-allowed' 
                  : 'bg-cyber-dark/50 text-cyber-cyan hover:bg-cyber-cyan/10'
              }`}
            >
              <FileText size={14} />
              <span>HINT ({2 - hintsUsed} LEFT) +10% SECURITY</span>
            </button>
            
            <button 
              onClick={runMemoryScan}
              disabled={scanActive}
              className={`flex items-center gap-2 cyber-border px-3 py-1 text-sm ${
                scanActive 
                  ? 'bg-cyber-dark/30 text-cyber-gray/50 cursor-not-allowed' 
                  : 'bg-cyber-dark/50 text-cyber-cyan hover:bg-cyber-cyan/10'
              }`}
            >
              <AlertTriangle size={14} />
              <span>SCAN MEMORY +15% SECURITY</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="text-xl text-cyber-cyan font-display mb-4">MISSION DATA</h2>
        
        <div className="space-y-4">
          <div className="cyber-border bg-cyber-dark/30 p-3">
            <h3 className="text-cyber-pink mb-1">OBJECTIVE:</h3>
            <p className="text-cyber-gray/90">Access core memory by selecting {config.requiredSelections} valid memory addresses. Choose carefully to avoid triggering security protocols.</p>
          </div>
          
          <div className="cyber-border bg-cyber-dark/30 p-3">
            <h3 className="text-cyber-pink mb-1">ASSISTANCE TOOLS:</h3>
            <ul className="list-disc list-inside text-cyber-gray/90 space-y-1">
              <li><span className="text-yellow-400">HINT</span>: Reveals one correct memory address (up to 2 hints)</li>
              <li><span className="text-yellow-400">SCAN</span>: Briefly highlights all correct addresses for 3 seconds</li>
              <li>Both tools increase security level but can help identify correct addresses</li>
            </ul>
          </div>
          
          <div className="cyber-border bg-cyber-dark/30 p-3">
            <h3 className="text-cyber-pink mb-1">WARNING:</h3>
            <ul className="list-disc list-inside text-cyber-gray/90 space-y-1">
              <li>Each incorrect selection increases security level by {config.securityIncrease}%</li>
              <li>At 100% security level, you will be locked out of the system</li>
              <li>Memory addresses cannot be deselected once chosen</li>
              <li>Time limit enforced by corporate countermeasures</li>
            </ul>
          </div>
          
          <div className="cyber-border bg-cyber-dark/30 p-3">
            <h3 className="text-cyber-pink mb-1">CONNECTION STATUS:</h3>
            <p className="text-cyber-gray/90">Stable - {Math.floor(timeLeft / timeLimit * 100)}% uptime remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryHack;
