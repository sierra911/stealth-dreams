
import React, { useEffect, useState } from 'react';
import ThreeScene from './ThreeScene';
import Terminal from './Terminal';
import { useReveal, useTypewriter } from '../utils/animations';

const HeroSection: React.FC = () => {
  const { ref: titleRef, revealed: titleRevealed } = useReveal();
  const { ref: subtitleRef, revealed: subtitleRevealed } = useReveal(0.2);
  const { ref: terminalRef, revealed: terminalRevealed } = useReveal(0.3);
  const { ref: buttonsRef, revealed: buttonsRevealed } = useReveal(0.4);
  
  const { displayText: titleText } = useTypewriter(
    'NETWORK INFILTRATION', 
    80
  );
  
  const initialCommands = [
    '> ESTABLISHING SECURE CONNECTION',
    '> BYPASSING FIREWALL',
    '> ACCESSING MAINFRAME',
    '> CONNECTION ESTABLISHED',
    '> WELCOME TO THE NETWORK, NETRUNNER'
  ];

  return (
    <section id="home" className="relative min-h-screen overflow-hidden pt-20">
      {/* Grid background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-20"></div>
      
      {/* Scan line effect */}
      <div className="scan-line"></div>

      {/* Hero content */}
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
        <div className="text-center max-w-4xl mx-auto">
          <div 
            ref={titleRef} 
            className={`transition-all duration-700 ${titleRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <p className="text-cyber-cyan mb-4 font-cyber inline-block cyber-border px-4 py-1">
              CYBERPUNK:2049
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-4 text-cyber-gray">
              <span className="neon-text">{titleText}</span>
              <span className="animate-pulse">█</span>
            </h1>
          </div>
          
          <div 
            ref={subtitleRef} 
            className={`transition-all duration-700 delay-300 ${subtitleRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <p className="text-xl md:text-2xl text-cyber-gray/80 mb-8 max-w-2xl mx-auto">
              Navigate the digital landscape, infiltrate secure networks, and extract 
              classified data before rival netrunners locate your signal.
            </p>
          </div>
          
          <div 
            ref={buttonsRef} 
            className={`flex flex-col sm:flex-row justify-center gap-4 mt-8 transition-all duration-700 delay-500 ${buttonsRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <a 
              href="#missions" 
              className="cyber-border px-8 py-3 text-cyber-cyan text-lg hover:bg-cyber-cyan/10 hover:shadow-neon transition-all duration-300"
            >
              START MISSION
            </a>
            <a 
              href="#tutorial" 
              className="px-8 py-3 text-lg border border-cyber-gray/30 text-cyber-gray hover:text-cyber-cyan hover:border-cyber-cyan transition-all duration-300"
            >
              LEARN HOW TO PLAY
            </a>
          </div>
        </div>
        
        {/* 3D Scene and Terminal */}
        <div className="w-full mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[300px] md:h-[400px] rounded-md overflow-hidden cyber-border">
            <ThreeScene className="w-full h-full" />
          </div>
          
          <div 
            ref={terminalRef} 
            className={`h-[300px] md:h-[400px] transition-all duration-700 delay-400 ${terminalRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
          >
            <Terminal 
              commands={initialCommands} 
              className="h-full overflow-auto" 
              typingSpeed={30} 
            />
          </div>
        </div>
      </div>
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyber-black to-transparent"></div>
    </section>
  );
};

export default HeroSection;
