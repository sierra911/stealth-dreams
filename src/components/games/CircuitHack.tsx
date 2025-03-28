import React, { useState, useEffect } from 'react';
import { Cpu, Plus, X, ArrowRight, Divide, CornerDownRight } from 'lucide-react';

interface CircuitHackProps {
  difficulty: string;
  onSuccess: () => void;
  onFailure: () => void;
  timeLeft: number;
  timeLimit: number;
  onSecurityLevelChange: (level: number) => void;
}

type LogicGateType = 'AND' | 'OR' | 'XOR' | 'NOT' | 'BUFFER';

interface LogicGate {
  id: string;
  type: LogicGateType;
  x: number;
  y: number;
  inputs: string[];
  output: boolean;
  placed: boolean;
  corrupted: boolean;
  connectedTo?: string[];
}

interface CircuitNode {
  id: string;
  x: number;
  y: number;
  value: boolean;
  isInput: boolean;
  isOutput: boolean;
  connectedTo: string[];
}

const difficultyConfig = {
  'Easy': { gateCount: 3, corruptedGates: 0, securityIncrease: 15 },
  'Medium': { gateCount: 4, corruptedGates: 1, securityIncrease: 25 },
  'Hard': { gateCount: 5, corruptedGates: 2, securityIncrease: 35 },
  'Expert': { gateCount: 6, corruptedGates: 3, securityIncrease: 50 }
};

const CircuitHack: React.FC<CircuitHackProps> = ({ 
  difficulty, 
  onSuccess,
  onFailure,
  timeLeft,
  timeLimit,
  onSecurityLevelChange
}) => {
  const [gates, setGates] = useState<LogicGate[]>([]);
  const [nodes, setNodes] = useState<CircuitNode[]>([]);
  const [placedGates, setPlacedGates] = useState<LogicGate[]>([]);
  const [selectedGate, setSelectedGate] = useState<LogicGate | null>(null);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [targetOutput, setTargetOutput] = useState<boolean[]>([]);
  const [currentOutput, setCurrentOutput] = useState<boolean[]>([]);
  
  const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.Medium;

  const initializeGates = () => {
    const gateTypes: LogicGateType[] = ['AND', 'OR', 'XOR', 'NOT', 'BUFFER'];
    const newGates: LogicGate[] = [];
    
    for (let i = 0; i < config.gateCount; i++) {
      const gateType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
      const isCorrupted = i < config.corruptedGates;
      
      newGates.push({
        id: `gate-${i}`,
        type: gateType,
        x: 0,
        y: 0,
        inputs: [],
        output: false,
        placed: false,
        corrupted: isCorrupted,
        connectedTo: []
      });
    }
    
    setGates(newGates);
  };
  
  const initializeCircuit = () => {
    const newNodes: CircuitNode[] = [];
    
    for (let i = 0; i < 3; i++) {
      newNodes.push({
        id: `input-${i}`,
        x: 10,
        y: 20 + i * 30,
        value: Math.random() > 0.5,
        isInput: true,
        isOutput: false,
        connectedTo: []
      });
    }
    
    for (let i = 0; i < 2; i++) {
      newNodes.push({
        id: `output-${i}`,
        x: 90,
        y: 35 + i * 30,
        value: false,
        isInput: false,
        isOutput: true,
        connectedTo: []
      });
    }
    
    setNodes(newNodes);
    
    const target = [Math.random() > 0.5, Math.random() > 0.5];
    setTargetOutput(target);
  };
  
  useEffect(() => {
    initializeGates();
    initializeCircuit();
  }, [difficulty]);
  
  const evaluateCircuit = () => {
    const inputNodes = nodes.filter(node => node.isInput);
    const outputNodes = nodes.filter(node => node.isOutput);
    const circuitValues = new Map<string, boolean>();
    
    inputNodes.forEach(node => {
      circuitValues.set(node.id, node.value);
    });
    
    placedGates.forEach(gate => {
      const gateInputs = gate.inputs.map(inputId => circuitValues.get(inputId) || false);
      let gateOutput = false;
      
      switch (gate.type) {
        case 'AND':
          gateOutput = gateInputs.every(v => v);
          break;
        case 'OR':
          gateOutput = gateInputs.some(v => v);
          break;
        case 'XOR':
          gateOutput = gateInputs.filter(v => v).length % 2 === 1;
          break;
        case 'NOT':
          gateOutput = !gateInputs[0];
          break;
        case 'BUFFER':
          gateOutput = gateInputs[0];
          break;
      }
      
      if (gate.corrupted) {
        gateOutput = !gateOutput;
      }
      
      circuitValues.set(gate.id, gateOutput);
    });
    
    const newOutputs: boolean[] = [];
    
    outputNodes.forEach(node => {
      let outputValue = false;
      
      for (const [id, value] of circuitValues.entries()) {
        const connectedGate = placedGates.find(g => g.id === id);
        const connectedNode = nodes.find(n => n.id === id);
        
        if ((connectedGate && connectedGate.connectedTo?.includes(node.id)) ||
            (connectedNode && connectedNode.connectedTo.includes(node.id))) {
          outputValue = value;
          break;
        }
      }
      
      newOutputs.push(outputValue);
    });
    
    setCurrentOutput(newOutputs);
    
    if (newOutputs.every((val, i) => val === targetOutput[i]) && newOutputs.length > 0) {
      setMessage("CIRCUIT COMPLETE - SYSTEM BACKDOOR INSTALLED");
      setTimeout(() => onSuccess(), 1500);
    }
  };
  
  useEffect(() => {
    if (placedGates.length > 0) {
      evaluateCircuit();
    }
  }, [placedGates]);
  
  const handleGateSelect = (gate: LogicGate) => {
    if (gate.placed) return;
    
    setSelectedGate(gate);
    setMessage(`Selected ${gate.type} gate${gate.corrupted ? " (CORRUPTED)" : ""}`);
    setTimeout(() => setMessage(null), 1500);
  };
  
  const handlePlaceGate = (x: number, y: number) => {
    if (!selectedGate) return;
    
    const existingGate = placedGates.find(g => Math.abs(g.x - x) < 10 && Math.abs(g.y - y) < 10);
    if (existingGate) {
      setMessage("Cannot place gate here - space occupied");
      setTimeout(() => setMessage(null), 1500);
      return;
    }
    
    const newGate = { ...selectedGate, x, y, placed: true };
    setPlacedGates([...placedGates, newGate]);
    
    setGates(gates.filter(g => g.id !== selectedGate.id));
    setSelectedGate(null);
    
    const newSecurityLevel = Math.min(securityLevel + 5, 100);
    setSecurityLevel(newSecurityLevel);
    onSecurityLevelChange(100 - newSecurityLevel);
  };
  
  const handleConnect = (fromId: string, toId: string) => {
    const fromNode = nodes.find(n => n.id === fromId);
    const toNode = nodes.find(n => n.id === toId);
    const fromGate = placedGates.find(g => g.id === fromId);
    const toGate = placedGates.find(g => g.id === toId);
    
    if ((toNode && toNode.isInput) || (fromNode && fromNode.isOutput)) {
      setMessage("Invalid connection direction");
      setTimeout(() => setMessage(null), 1500);
      return;
    }
    
    if (fromNode) {
      setNodes(nodes.map(n => 
        n.id === fromId 
          ? { ...n, connectedTo: [...n.connectedTo, toId] } 
          : n
      ));
    } else if (fromGate) {
      setPlacedGates(placedGates.map(g => 
        g.id === fromId 
          ? { ...g, connectedTo: [...(g.connectedTo || []), toId] } 
          : g
      ));
    }
    
    if (toGate) {
      setPlacedGates(placedGates.map(g => 
        g.id === toId 
          ? { ...g, inputs: [...g.inputs, fromId] } 
          : g
      ));
    }
    
    evaluateCircuit();
  };
  
  const renderGateIcon = (type: LogicGateType) => {
    switch (type) {
      case 'AND':
        return <div className="text-xs">AND</div>;
      case 'OR':
        return <div className="text-xs">OR</div>;
      case 'XOR':
        return <X className="w-3 h-3" />;
      case 'NOT':
        return <div className="text-xs">NOT</div>;
      case 'BUFFER':
        return <ArrowRight className="w-3 h-3" />;
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card p-6">
        <h2 className="text-xl text-cyber-cyan font-display mb-4">SYSTEM BACKDOOR INSTALLATION</h2>
        
        <div className="cyber-border bg-cyber-black/90 p-4 mb-6 font-mono text-sm">
          <div className="text-center mb-4">
            <Cpu className="w-12 h-12 text-cyber-cyan mx-auto mb-2" />
            <h3 className="text-cyber-cyan text-lg mb-1">Logic Circuit Builder</h3>
            <p className="text-cyber-gray/80">
              Create a circuit that produces the required output
            </p>
          </div>
          
          <div className="mb-4">
            <p className="text-cyber-cyan mb-2">AVAILABLE GATES:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {gates.map((gate, index) => (
                <button
                  key={index}
                  onClick={() => handleGateSelect(gate)}
                  className={`cyber-border px-2 py-1 ${
                    selectedGate?.id === gate.id 
                      ? 'bg-cyber-cyan/20 border-cyber-cyan' 
                      : gate.corrupted 
                        ? 'bg-cyber-red/10 border-cyber-red/50' 
                        : 'bg-cyber-dark/30 border-cyber-gray/50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {renderGateIcon(gate.type)}
                    <span>{gate.type}</span>
                    {gate.corrupted && <span className="text-xs text-cyber-red">(C)</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative w-full border border-cyber-gray/30 aspect-video mb-4 bg-cyber-dark/20">
            {nodes.map((node, index) => (
              <div
                key={index}
                className={`absolute cyber-border w-7 h-7 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${
                  node.isInput 
                    ? 'bg-cyber-cyan/10 border-cyber-cyan/50' 
                    : 'bg-cyber-pink/10 border-cyber-pink/50'
                }`}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`
                }}
              >
                <span className={node.value ? 'text-green-400' : 'text-cyber-red'}>
                  {node.value ? '1' : '0'}
                </span>
              </div>
            ))}
            
            {placedGates.map((gate, index) => (
              <div
                key={index}
                className={`absolute cyber-border w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center ${
                  gate.corrupted 
                    ? 'bg-cyber-red/10 border-cyber-red/50' 
                    : 'bg-cyber-dark/50 border-cyber-cyan/30'
                }`}
                style={{
                  left: `${gate.x}%`,
                  top: `${gate.y}%`
                }}
              >
                {renderGateIcon(gate.type)}
                <span className="text-xs">{gate.corrupted ? "CORRUPT" : gate.type}</span>
              </div>
            ))}
            
            <div 
              className="absolute cyber-border bg-cyber-dark/20 border-dashed"
              style={{
                left: '35%',
                top: '30%',
                width: '40%',
                height: '40%',
                cursor: selectedGate ? 'pointer' : 'default'
              }}
              onClick={(e) => {
                if (selectedGate) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  handlePlaceGate(35 + x * 0.4, 30 + y * 0.4);
                }
              }}
            >
              {selectedGate && (
                <div className="absolute inset-0 flex items-center justify-center text-cyber-gray/50">
                  Click to place {selectedGate.type} gate
                </div>
              )}
            </div>
          </div>
          
          <div className="cyber-border p-2 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-cyber-gray/80">TARGET OUTPUT:</span>
              <div className="flex gap-2">
                {targetOutput.map((value, index) => (
                  <span 
                    key={index} 
                    className={`inline-block w-5 h-5 cyber-border flex items-center justify-center ${
                      value ? 'bg-green-400/20 border-green-400' : 'bg-cyber-red/20 border-cyber-red'
                    }`}
                  >
                    {value ? '1' : '0'}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-cyber-gray/80">CURRENT OUTPUT:</span>
              <div className="flex gap-2">
                {currentOutput.map((value, index) => (
                  <span 
                    key={index} 
                    className={`inline-block w-5 h-5 cyber-border flex items-center justify-center ${
                      value === targetOutput[index]
                        ? value 
                          ? 'bg-green-400/20 border-green-400' 
                          : 'bg-cyber-red/20 border-cyber-red'
                        : 'bg-yellow-400/20 border-yellow-400'
                    }`}
                  >
                    {value ? '1' : '0'}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center text-cyber-gray/80">
            {message && (
              <p className={`cyber-border inline-block px-3 py-1 ${
                message.includes("COMPLETE") 
                  ? "text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10" 
                  : message.includes("Cannot") 
                    ? "text-cyber-red border-cyber-red bg-cyber-red/10"
                    : "text-cyber-gray border-cyber-gray/50"
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
              Build a logic circuit that produces the target output shown on the display. This will install a backdoor into the system.
            </p>
          </div>
          
          <div className="cyber-border bg-cyber-dark/30 p-3">
            <h3 className="text-cyber-pink mb-1">INSTRUCTIONS:</h3>
            <ul className="list-disc list-inside text-cyber-gray/90 space-y-1">
              <li>Select a logic gate from the palette, then click in the placement area to position it</li>
              <li>Connect gates by dragging from one to another</li>
              <li>Input nodes (left) provide the initial signals</li>
              <li>Output nodes (right) must match the target values</li>
              <li>Corrupted gates invert their output - you'll need to work around them</li>
            </ul>
          </div>
          
          <div className="cyber-border bg-cyber-dark/30 p-3">
            <h3 className="text-cyber-pink mb-1">LOGIC GATE REFERENCE:</h3>
            <div className="grid grid-cols-2 gap-2 text-cyber-gray/90">
              <div>
                <span className="text-cyber-cyan">AND:</span> Output is 1 only if all inputs are 1
              </div>
              <div>
                <span className="text-cyber-cyan">OR:</span> Output is 1 if any input is 1
              </div>
              <div>
                <span className="text-cyber-cyan">XOR:</span> Output is 1 if an odd number of inputs are 1
              </div>
              <div>
                <span className="text-cyber-cyan">NOT:</span> Inverts the input (0→1, 1→0)
              </div>
              <div>
                <span className="text-cyber-cyan">BUFFER:</span> Output equals input
              </div>
              <div>
                <span className="text-cyber-red">CORRUPTED:</span> Output is inverted
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitHack;
