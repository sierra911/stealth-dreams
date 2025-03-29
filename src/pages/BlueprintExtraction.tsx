
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { createGrid, findPath } from '../utils/pathfinding';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Key, FileText, Clock } from 'lucide-react';

interface MazeCell {
  x: number;
  y: number;
  type: 'empty' | 'wall' | 'player' | 'guard' | 'blueprint' | 'exit' | 'key' | 'lock';
}

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

const GRID_SIZE = 15;
const CELL_SIZE = 1;

const BlueprintExtraction: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const missionData = location.state as MissionState;
  const mission = missionData?.mission;
  
  // Mount refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [keysCollected, setKeysCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(mission?.timeLimit || 300);
  const [gameOver, setGameOver] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasBlueprint, setHasBlueprint] = useState(false);
  const [maze, setMaze] = useState<MazeCell[]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [guardPositions, setGuardPositions] = useState<{x: number, y: number, patrolPath: {x: number, y: number}[], currentPathIndex: number}[]>([]);
  
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

    // Generate maze with walls, player, guards, blueprint, and exit
    generateMaze();
    
    // Cleanup function for previous scene if it exists
    return () => {
      if (rendererRef.current && mountRef.current) {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
      
      // Clear all meshes
      meshesRef.current.forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(material => material.dispose());
          } else {
            mesh.material.dispose();
          }
        }
        if (mesh.parent) mesh.parent.remove(mesh);
      });
      meshesRef.current = [];
    };
  }, []);
  
  // Initialize 3D scene when maze is created
  useEffect(() => {
    if (maze.length > 0 && mountRef.current) {
      // Initialize the 3D scene
      initializeScene();
      
      toast({
        title: "MISSION BRIEFING",
        description: `Infiltrate ${mission?.company}'s network. Find the blueprint and exit without being detected.`,
        className: "bg-cyber-dark border border-cyber-cyan/30 text-cyber-cyan"
      });
    }
  }, [maze]);
  
  // Handle game timer
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
  
  // Move guards along their patrol paths
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const guardInterval = setInterval(() => {
      setGuardPositions(prev => 
        prev.map(guard => {
          // Move to next position in patrol path
          const nextPathIndex = (guard.currentPathIndex + 1) % guard.patrolPath.length;
          const nextPosition = guard.patrolPath[nextPathIndex];
          
          // Check if player is caught
          if (nextPosition.x === playerPosition.x && nextPosition.y === playerPosition.y) {
            setGameOver(true);
            setSuccess(false);
            toast({
              title: "DETECTED",
              description: "Security system detected your presence. Mission failed.",
              variant: "destructive",
            });
          }
          
          return {
            ...guard,
            x: nextPosition.x,
            y: nextPosition.y,
            currentPathIndex: nextPathIndex
          };
        })
      );
      
      // Update maze with new guard positions
      updateMazeWithGuards();
      
      // Update 3D visualization
      updateScene();
    }, 1000);
    
    return () => clearInterval(guardInterval);
  }, [gameStarted, gameOver, playerPosition]);
  
  // Generate the initial maze
  const generateMaze = () => {
    const newMaze: MazeCell[] = [];
    
    // Create border walls
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        // Border walls
        if (x === 0 || y === 0 || x === GRID_SIZE - 1 || y === GRID_SIZE - 1) {
          newMaze.push({ x, y, type: 'wall' });
        } 
        // Internal maze structure - some random walls
        else if ((x % 3 === 0 && y % 2 === 0) || (x % 4 === 0 && y % 3 === 0)) {
          newMaze.push({ x, y, type: 'wall' });
        }
        // Empty space
        else {
          newMaze.push({ x, y, type: 'empty' });
        }
      }
    }
    
    // Add player starting position
    const playerStartX = 1;
    const playerStartY = 1;
    setPlayerPosition({ x: playerStartX, y: playerStartY });
    updateCellType(newMaze, playerStartX, playerStartY, 'player');
    
    // Add blueprint at a distant position
    const blueprintX = GRID_SIZE - 3;
    const blueprintY = GRID_SIZE - 3;
    updateCellType(newMaze, blueprintX, blueprintY, 'blueprint');
    
    // Add exit
    const exitX = GRID_SIZE - 2;
    const exitY = 1;
    updateCellType(newMaze, exitX, exitY, 'exit');
    
    // Add keys and locks
    updateCellType(newMaze, 3, 3, 'key');
    updateCellType(newMaze, 7, 7, 'key');
    updateCellType(newMaze, GRID_SIZE - 4, 1, 'lock');
    
    // Add guards with patrol paths
    const guards = [
      {
        x: 4,
        y: 4,
        patrolPath: [
          { x: 4, y: 4 },
          { x: 4, y: 5 },
          { x: 4, y: 6 },
          { x: 4, y: 7 },
          { x: 4, y: 6 },
          { x: 4, y: 5 }
        ],
        currentPathIndex: 0
      },
      {
        x: 10,
        y: 10,
        patrolPath: [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
          { x: 12, y: 10 },
          { x: 11, y: 10 }
        ],
        currentPathIndex: 0
      },
      {
        x: 8,
        y: 2,
        patrolPath: [
          { x: 8, y: 2 },
          { x: 8, y: 3 },
          { x: 8, y: 4 },
          { x: 8, y: 3 }
        ],
        currentPathIndex: 0
      }
    ];
    
    setGuardPositions(guards);
    
    // Add guards to maze
    guards.forEach(guard => {
      updateCellType(newMaze, guard.x, guard.y, 'guard');
    });
    
    setMaze(newMaze);
  };
  
  // Helper to update a cell type in the maze
  const updateCellType = (mazeArray: MazeCell[], x: number, y: number, type: MazeCell['type']) => {
    const cellIndex = mazeArray.findIndex(cell => cell.x === x && cell.y === y);
    if (cellIndex !== -1) {
      mazeArray[cellIndex].type = type;
    }
  };
  
  // Update maze with current guard positions
  const updateMazeWithGuards = () => {
    setMaze(prev => {
      const newMaze = [...prev];
      
      // Reset previous guard positions
      newMaze.forEach(cell => {
        if (cell.type === 'guard') {
          cell.type = 'empty';
        }
      });
      
      // Set new guard positions
      guardPositions.forEach(guard => {
        updateCellType(newMaze, guard.x, guard.y, 'guard');
      });
      
      return newMaze;
    });
  };
  
  // Initialize Three.js scene
  const initializeScene = () => {
    if (!mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050A0F);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(GRID_SIZE / 2, GRID_SIZE, GRID_SIZE / 2);
    camera.lookAt(GRID_SIZE / 2, 0, GRID_SIZE / 2);
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, 0x66FCF1, 0x45A29E);
    scene.add(gridHelper);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x66FCF1, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0x66FCF1, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Render the maze
    renderMaze();
    
    // Animation loop
    const animate = () => {
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
  };
  
  // Render the maze in the 3D scene
  const renderMaze = () => {
    if (!sceneRef.current) return;
    
    // Clear existing meshes
    meshesRef.current.forEach(mesh => {
      if (mesh.parent) mesh.parent.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(material => material.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
    meshesRef.current = [];
    
    // Create materials for different cell types
    const materials = {
      wall: new THREE.MeshPhongMaterial({ color: 0x1F2833, wireframe: false }),
      player: new THREE.MeshPhongMaterial({ color: 0x66FCF1, wireframe: false }),
      guard: new THREE.MeshPhongMaterial({ color: 0xFF0000, wireframe: false }),
      blueprint: new THREE.MeshPhongMaterial({ color: 0xFFFF00, wireframe: false }),
      exit: new THREE.MeshPhongMaterial({ color: 0x00FF00, wireframe: false }),
      key: new THREE.MeshPhongMaterial({ color: 0xFF00FF, wireframe: false }),
      lock: new THREE.MeshPhongMaterial({ color: 0xFFA500, wireframe: false })
    };
    
    // Render each cell in the maze
    maze.forEach(cell => {
      if (cell.type !== 'empty') {
        let geometry;
        
        // Different geometries for different types
        switch (cell.type) {
          case 'wall':
            geometry = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE * 2, CELL_SIZE);
            break;
          case 'player':
            geometry = new THREE.SphereGeometry(CELL_SIZE * 0.4, 16, 16);
            break;
          case 'guard':
            geometry = new THREE.ConeGeometry(CELL_SIZE * 0.4, CELL_SIZE * 0.8, 8);
            break;
          case 'blueprint':
            geometry = new THREE.BoxGeometry(CELL_SIZE * 0.5, CELL_SIZE * 0.1, CELL_SIZE * 0.5);
            break;
          case 'exit':
            geometry = new THREE.CylinderGeometry(CELL_SIZE * 0.5, CELL_SIZE * 0.5, CELL_SIZE * 0.1, 16);
            break;
          case 'key':
            geometry = new THREE.CylinderGeometry(CELL_SIZE * 0.2, CELL_SIZE * 0.2, CELL_SIZE * 0.6, 8);
            break;
          case 'lock':
            geometry = new THREE.BoxGeometry(CELL_SIZE * 0.8, CELL_SIZE * 0.8, CELL_SIZE * 0.3);
            break;
          default:
            geometry = new THREE.BoxGeometry(CELL_SIZE * 0.8, CELL_SIZE * 0.3, CELL_SIZE * 0.8);
        }
        
        const mesh = new THREE.Mesh(geometry, materials[cell.type as keyof typeof materials]);
        mesh.position.set(cell.x, 0, cell.y);
        
        // Special positioning for certain types
        if (cell.type === 'guard') {
          mesh.position.y = CELL_SIZE * 0.4;
        } else if (cell.type === 'player') {
          mesh.position.y = CELL_SIZE * 0.4;
        } else if (cell.type === 'key' || cell.type === 'blueprint') {
          mesh.position.y = CELL_SIZE * 0.3;
          mesh.rotation.y = Math.PI / 4;
        } else if (cell.type === 'wall') {
          mesh.position.y = CELL_SIZE;
        } else if (cell.type === 'exit') {
          mesh.position.y = 0.05;
        }
        
        sceneRef.current.add(mesh);
        meshesRef.current.push(mesh);
      }
    });
  };
  
  // Update the 3D scene based on the current maze state
  const updateScene = () => {
    if (sceneRef.current) {
      renderMaze();
    }
  };
  
  // Handle window resize
  const handleResize = () => {
    if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    
    rendererRef.current.setSize(width, height);
  };
  
  // Handle player movement
  const handleMove = (dx: number, dy: number) => {
    if (!gameStarted || gameOver) return;
    
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    
    // Check if the new position is valid
    const targetCell = maze.find(cell => cell.x === newX && cell.y === newY);
    
    if (!targetCell || targetCell.type === 'wall') {
      // Can't move into walls
      return;
    }
    
    if (targetCell.type === 'lock' && keysCollected < 2) {
      // Need 2 keys to open the lock
      toast({
        title: "Locked",
        description: `You need ${2 - keysCollected} more key(s) to unlock this door.`,
      });
      return;
    }
    
    // Check if player ran into a guard
    if (targetCell.type === 'guard') {
      setGameOver(true);
      setSuccess(false);
      toast({
        title: "DETECTED",
        description: "Security guard spotted you. Mission failed.",
        variant: "destructive",
      });
      return;
    }
    
    // Update player position in maze
    setMaze(prev => {
      const newMaze = [...prev];
      
      // Clear old player position
      const oldPlayerCell = newMaze.find(cell => cell.x === playerPosition.x && cell.y === playerPosition.y);
      if (oldPlayerCell) {
        oldPlayerCell.type = 'empty';
      }
      
      // Handle special cells
      if (targetCell.type === 'blueprint') {
        setHasBlueprint(true);
        toast({
          title: "Blueprint Acquired",
          description: "You've found the blueprint. Now head to the exit!",
        });
        targetCell.type = 'empty';
      } else if (targetCell.type === 'key') {
        setKeysCollected(prev => prev + 1);
        toast({
          title: "Key Found",
          description: `You've found a key (${keysCollected + 1}/2)`,
        });
        targetCell.type = 'empty';
      } else if (targetCell.type === 'lock' && keysCollected >= 2) {
        toast({
          title: "Door Unlocked",
          description: "You've used your keys to unlock the door.",
        });
        targetCell.type = 'empty';
      } else if (targetCell.type === 'exit') {
        if (hasBlueprint) {
          setGameOver(true);
          setSuccess(true);
          toast({
            title: "MISSION SUCCESSFUL",
            description: "You've extracted the blueprint and escaped safely!",
            className: "bg-cyber-dark border border-green-500/30 text-green-500",
          });
        } else {
          toast({
            title: "Exit Found",
            description: "You need to find the blueprint before exiting.",
          });
          return newMaze;
        }
      }
      
      // Set new player position
      targetCell.type = 'player';
      
      return newMaze;
    });
    
    // Update player position state
    setPlayerPosition({ x: newX, y: newY });
    
    // Update the 3D scene
    updateScene();
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start the game
  const handleStartGame = () => {
    setGameStarted(true);
    toast({
      title: "INFILTRATION STARTED",
      description: "Find the blueprint and reach the exit point. Avoid security patrols.",
    });
  };
  
  // Return to mission selection
  const handleReturn = () => {
    navigate('/');
  };
  
  // Complete game and return to mission selection
  const handleCompleteGame = () => {
    // In a real app, you would send the results to your backend here
    navigate('/', { 
      state: { 
        missionCompleted: mission?.id, 
        success, 
        timeLeft 
      } 
    });
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
          {mission?.title || "BLUEPRINT EXTRACTION"}
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-yellow-400">
            <Key size={16} />
            <span>{keysCollected}/2</span>
          </div>
          
          <div className="flex items-center gap-1 text-cyber-pink">
            <FileText size={16} />
            <span>{hasBlueprint ? '1/1' : '0/1'}</span>
          </div>
          
          <div className="flex items-center gap-1 text-cyber-cyan cyber-border px-2 py-1">
            <Clock size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>
      
      {/* Game area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 h-[calc(100vh-72px)]">
        {/* 3D view */}
        <div className="lg:col-span-3 relative glass-card">
          <div ref={mountRef} className="w-full h-full"></div>
          
          {!gameStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-black/80">
              <h2 className="text-3xl font-display text-cyber-cyan mb-8">
                {mission?.company || "ARASAKA"} NETWORK INFILTRATION
              </h2>
              <p className="text-cyber-gray/80 max-w-lg text-center mb-8">
                Navigate through the digital maze to find and extract the blueprint.
                Avoid security patrols and use keys to unlock secure areas.
                You have 5 minutes before the system detects your presence.
              </p>
              <button 
                onClick={handleStartGame}
                className="cyber-border bg-cyber-cyan/20 px-8 py-3 text-cyber-cyan hover:bg-cyber-cyan/30 transition-colors"
              >
                BEGIN INFILTRATION
              </button>
            </div>
          )}
          
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-black/80">
              <h2 className={`text-3xl font-display mb-8 ${success ? 'text-green-500' : 'text-cyber-red'}`}>
                MISSION {success ? 'SUCCESSFUL' : 'FAILED'}
              </h2>
              <p className="text-cyber-gray/80 max-w-lg text-center mb-8">
                {success 
                  ? "You successfully extracted the blueprint and escaped the security system."
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
        
        {/* Controls */}
        <div className="glass-card p-4 flex flex-col">
          <h3 className="text-xl font-display text-cyber-cyan mb-4">NEURAL INTERFACE</h3>
          
          {gameStarted && !gameOver && (
            <>
              <p className="text-cyber-gray/80 mb-6">
                Navigate through the network using the directional controls.
                Locate the blueprint file and extract to the exit point.
              </p>
              
              <div className="grid grid-cols-3 gap-2 mb-8">
                <div></div>
                <button 
                  onClick={() => handleMove(0, -1)}
                  className="cyber-border p-3 text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
                >
                  ↑
                </button>
                <div></div>
                <button 
                  onClick={() => handleMove(-1, 0)}
                  className="cyber-border p-3 text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
                >
                  ←
                </button>
                <div className="cyber-border p-3 text-center text-cyber-gray/50">
                  •
                </div>
                <button 
                  onClick={() => handleMove(1, 0)}
                  className="cyber-border p-3 text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
                >
                  →
                </button>
                <div></div>
                <button 
                  onClick={() => handleMove(0, 1)}
                  className="cyber-border p-3 text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
                >
                  ↓
                </button>
                <div></div>
              </div>
              
              <div className="mt-auto space-y-4">
                <div className="cyber-border p-3 bg-cyber-dark/30">
                  <h4 className="text-cyber-pink mb-1">LEGEND:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#66FCF1] rounded-full"></span>
                      <span>You</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span>Security Patrol</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                      <span>Blueprint</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>Exit Point</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-fuchsia-500 rounded-full"></span>
                      <span>Access Key</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                      <span>Locked Door</span>
                    </li>
                  </ul>
                </div>
                
                <div className="cyber-border p-3 bg-cyber-dark/30">
                  <h4 className="text-cyber-cyan mb-1">MISSION OBJECTIVE:</h4>
                  <p className="text-cyber-gray/90 text-sm">
                    Collect the blueprint and reach the exit point without being detected by security patrols.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlueprintExtraction;
