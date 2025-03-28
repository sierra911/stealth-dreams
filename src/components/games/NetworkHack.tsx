
import React, { useState, useEffect } from 'react';
import { Wifi, ArrowUpRight, ArrowDownRight, ArrowDown, ArrowRight } from 'lucide-react';

interface NetworkHackProps {
  difficulty: string;
  onSuccess: () => void;
  onFailure: () => void;
  timeLeft: number;
  timeLimit: number;
  onSecurityLevelChange: (level: number) => void;
}

interface Node {
  id: number;
  x: number;
  y: number;
  connections: number[];
  active: boolean;
  required: boolean;
  disabled: boolean;
}

const difficultyConfig = {
  'Easy': { nodeCount: 9, requiredNodes: 3, securityIncrease: 15 },
  'Medium': { nodeCount: 12, requiredNodes: 5, securityIncrease: 25 },
  'Hard': { nodeCount: 16, requiredNodes: 7, securityIncrease: 35 },
  'Expert': { nodeCount: 20, requiredNodes: 9, securityIncrease: 50 }
};

const NetworkHack: React.FC<NetworkHackProps> = ({ 
  difficulty, 
  onSuccess,
  onFailure,
  timeLeft,
  timeLimit,
  onSecurityLevelChange
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [firewallTimeout, setFirewallTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.Medium;

  const generateNetwork = () => {
    const newNodes: Node[] = [];
    const gridSize = Math.ceil(Math.sqrt(config.nodeCount));
    const cellSize = 100 / gridSize;
    
    // Create nodes
    for (let i = 0; i < config.nodeCount; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      // Add some randomness to positions
      const xOffset = Math.random() * 6 - 3; // -3 to 3
      const yOffset = Math.random() * 6 - 3; // -3 to 3
      
      newNodes.push({
        id: i,
        x: col * cellSize + cellSize / 2 + xOffset,
        y: row * cellSize + cellSize / 2 + yOffset,
        connections: [],
        active: false,
        required: false,
        disabled: false
      });
    }
    
    // Connect nodes (each node connects to nodes in adjacent cells)
    for (let i = 0; i < newNodes.length; i++) {
      const node = newNodes[i];
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      // Potential connections: right, down, down-right, up-right
      const potentialConnections = [
        { r: row, c: col + 1 }, // right
        { r: row + 1, c: col }, // down
        { r: row + 1, c: col + 1 }, // down-right
        { r: row - 1, c: col + 1 } // up-right
      ];
      
      // Filter valid connections and add them
      potentialConnections.forEach(pos => {
        if (pos.r >= 0 && pos.r < gridSize && pos.c >= 0 && pos.c < gridSize) {
          const targetIndex = pos.r * gridSize + pos.c;
          if (targetIndex < config.nodeCount && targetIndex !== i) {
            node.connections.push(targetIndex);
            // Add reverse connection if not already present
            if (!newNodes[targetIndex].connections.includes(i)) {
              newNodes[targetIndex].connections.push(i);
            }
          }
        }
      });
    }
    
    // Mark required nodes
    const requiredIndices = new Set<number>();
    while (requiredIndices.size < config.requiredNodes) {
      const index = Math.floor(Math.random() * config.nodeCount);
      requiredIndices.add(index);
    }
    
    requiredIndices.forEach(index => {
      newNodes[index].required = true;
    });
    
    setNodes(newNodes);
  };
  
  // Initialize the game
  useEffect(() => {
    generateNetwork();
    
    // Set up firewall timeout that disables a random node every 30 seconds
    const timeout = setInterval(() => {
      setNodes(currentNodes => {
        // Find nodes that aren't already disabled and aren't required
        const availableNodes = currentNodes.filter(node => !node.disabled && !node.required);
        if (availableNodes.length === 0) return currentNodes;
        
        // Select a random node to disable
        const nodeToDisable = availableNodes[Math.floor(Math.random() * availableNodes.length)];
        
        setMessage(`WARNING: Firewall detected at node ${nodeToDisable.id}`);
        setTimeout(() => setMessage(null), 2000);
        
        // Create a new array with the updated node
        return currentNodes.map(node => 
          node.id === nodeToDisable.id 
            ? { ...node, disabled: true } 
            : node
        );
      });
    }, 30000); // Every 30 seconds
    
    setFirewallTimeout(timeout);
    
    return () => {
      if (firewallTimeout) clearInterval(firewallTimeout);
    };
  }, [difficulty, config.nodeCount, config.requiredNodes]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (firewallTimeout) clearInterval(firewallTimeout);
    };
  }, [firewallTimeout]);
  
  const handleNodeClick = (index: number) => {
    // Don't allow clicking if the node is already active or disabled
    if (nodes[index].active || nodes[index].disabled) return;
    
    // Check if the node is connected to any active node
    const canActivate = nodes[index].connections.some(connId => nodes[connId].active) || activeCount === 0;
    
    if (!canActivate) {
      setMessage("ERROR: Node must connect to an active node");
      setTimeout(() => setMessage(null), 1500);
      return;
    }
    
    // Update the node
    setNodes(nodes.map((node, i) => 
      i === index ? { ...node, active: true } : node
    ));
    
    setActiveCount(prev => prev + 1);
    
    // Check if all required nodes are active
    const allRequiredActive = nodes.every(node => !node.required || (node.id === index || node.active));
    
    if (allRequiredActive && nodes[index].required) {
      // All required nodes are active, succeed
      setMessage("SURVEILLANCE NETWORK OVERRIDDEN");
      setTimeout(() => onSuccess(), 1500);
    } else if (nodes[index].required) {
      setMessage("CRITICAL NODE ACTIVATED");
      setTimeout(() => setMessage(null), 1500);
    } else {
      // Node is not required, increase security slightly
      const newSecurityLevel = Math.min(securityLevel + config.securityIncrease / 3, 100);
      setSecurityLevel(newSecurityLevel);
      onSecurityLevelChange(100 - newSecurityLevel);
      
      setMessage("NODE ACTIVATED");
      setTimeout(() => setMessage(null), 1500);
    }
  };
  
  const getConnectionArrow = (from: Node, to: Node) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    if (Math.abs(dx) > Math.abs(dy) * 2) {
      return <ArrowRight className="w-3 h-3" />;
    } else if (Math.abs(dy) > Math.abs(dx) * 2) {
      return <ArrowDown className="w-3 h-3" />;
    } else if (dx > 0 && dy > 0) {
      return <ArrowDownRight className="w-3 h-3" />;
    } else {
      return <ArrowUpRight className="w-3 h-3" />;
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card p-6">
        <h2 className="text-xl text-cyber-cyan font-display mb-4">SURVEILLANCE NETWORK OVERRIDE</h2>
        
        <div className="cyber-border bg-cyber-black/90 p-4 mb-6 font-mono text-sm">
          <div className="text-center mb-6">
            <Wifi className="w-12 h-12 text-cyber-cyan mx-auto mb-2" />
            <h3 className="text-cyber-cyan text-lg mb-1">Network Topology</h3>
            <p className="text-cyber-gray/80">
              Activate all critical nodes to override surveillance
            </p>
          </div>
          
          <div className="relative w-full aspect-square mb-4">
            {/* Connection lines */}
            {nodes.map((node) => 
              node.connections.map((connId, i) => {
                const connNode = nodes[connId];
                // Only draw connection once (from lower to higher id)
                if (node.id < connId) {
                  return (
                    <div 
                      key={`${node.id}-${connId}`}
                      className={`absolute pointer-events-none transition-colors duration-300 ${
                        node.active && connNode.active 
                          ? 'bg-cyber-cyan' 
                          : node.active || connNode.active 
                            ? 'bg-cyber-cyan/50' 
                            : 'bg-cyber-gray/30'
                      }`}
                      style={{
                        height: '2px',
                        width: `${Math.sqrt(Math.pow(connNode.x - node.x, 2) + Math.pow(connNode.y - node.y, 2))}%`,
                        left: `${Math.min(node.x, connNode.x) + Math.abs(connNode.x - node.x) / 2}%`,
                        top: `${Math.min(node.y, connNode.y) + Math.abs(connNode.y - node.y) / 2}%`,
                        transform: `translate(-50%, -50%) rotate(${Math.atan2(connNode.y - node.y, connNode.x - node.x) * 180 / Math.PI}deg)`,
                        transformOrigin: 'center'
                      }}
                    >
                      <span 
                        className={`absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 ${
                          node.active && connNode.active 
                            ? 'text-cyber-cyan' 
                            : node.active || connNode.active 
                              ? 'text-cyber-cyan/50' 
                              : 'text-cyber-gray/30'
                        }`}
                      >
                        {getConnectionArrow(node, connNode)}
                      </span>
                    </div>
                  );
                }
                return null;
              })
            )}
            
            {/* Nodes */}
            {nodes.map((node, index) => (
              <button 
                key={index}
                className={`absolute cyber-border w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
                  node.disabled 
                    ? 'bg-cyber-red/20 border-cyber-red/50 cursor-not-allowed' 
                    : node.active 
                      ? 'bg-cyber-cyan/20 border-cyber-cyan pulse' 
                      : node.required 
                        ? 'bg-cyber-pink/10 border-cyber-pink/50 hover:bg-cyber-pink/20' 
                        : 'bg-cyber-dark/70 border-cyber-gray/50 hover:bg-cyber-dark/90 hover:border-cyber-cyan/50'
                }`}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                }}
                onClick={() => handleNodeClick(index)}
                disabled={node.disabled}
              >
                <span className={`text-xs ${
                  node.disabled 
                    ? 'text-cyber-red/70' 
                    : node.active 
                      ? 'text-cyber-cyan' 
                      : node.required 
                        ? 'text-cyber-pink/90' 
                        : 'text-cyber-gray/90'
                }`}>{index}</span>
              </button>
            ))}
          </div>
          
          <div className="text-center text-cyber-gray/80">
            {message && (
              <p className={`cyber-border inline-block px-3 py-1 ${
                message.includes("OVERRIDE") 
                  ? "text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10" 
                  : message.includes("ERROR") || message.includes("WARNING") 
                    ? "text-cyber-red border-cyber-red bg-cyber-red/10"
                    : message.includes("CRITICAL")
                      ? "text-cyber-pink border-cyber-pink bg-cyber-pink/10"
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
            <p className="text-cyber-gray/90">Override the surveillance network by activating all critical nodes (highlighted in pink).</p>
          </div>
          
          <div className="cyber-border bg-cyber-dark/30 p-3">
            <h3 className="text-cyber-pink mb-1">RULES:</h3>
            <ul className="list-disc list-inside text-cyber-gray/90 space-y-1">
              <li>You must start at any node and build a connected path</li>
              <li>You can only activate nodes connected to already active nodes</li>
              <li>Firewalls will randomly block nodes every 30 seconds</li>
              <li>All critical nodes must be activated to succeed</li>
            </ul>
          </div>
          
          <div className="cyber-border bg-cyber-dark/30 p-3">
            <h3 className="text-cyber-pink mb-1">STATUS:</h3>
            <p className="text-cyber-gray/90">
              Activated: {nodes.filter(n => n.active).length}/{nodes.length} nodes<br />
              Critical nodes: {nodes.filter(n => n.required && n.active).length}/{config.requiredNodes} activated<br />
              Firewalls active: {nodes.filter(n => n.disabled).length} nodes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkHack;
