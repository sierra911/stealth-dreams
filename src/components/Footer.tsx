
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-10 bg-cyber-black relative border-t border-cyber-cyan/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md cyber-border flex items-center justify-center">
                <span className="text-cyber-cyan font-display text-xl">C</span>
              </div>
              <h2 className="text-xl font-display text-cyber-cyan">CYBERPUNK:2049</h2>
            </div>
            <p className="text-cyber-gray/70 mb-4">
              Navigate the digital landscape, infiltrate secure networks, and extract 
              classified data before rival netrunners locate your signal.
            </p>
          </div>
          
          <div>
            <h3 className="text-cyber-cyan font-display mb-4">QUICK LINKS</h3>
            <ul className="text-cyber-gray/70 space-y-2">
              <li>
                <a href="#" className="hover:text-cyber-cyan transition-colors">Home</a>
              </li>
              <li>
                <a href="#missions" className="hover:text-cyber-cyan transition-colors">Missions</a>
              </li>
              <li>
                <a href="#" className="hover:text-cyber-cyan transition-colors">Leaderboard</a>
              </li>
              <li>
                <a href="#" className="hover:text-cyber-cyan transition-colors">Profile</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-cyber-cyan font-display mb-4">CORPORATIONS</h3>
            <ul className="text-cyber-gray/70 space-y-2">
              <li>
                <a href="#" className="hover:text-cyber-cyan transition-colors">Arasaka</a>
              </li>
              <li>
                <a href="#" className="hover:text-cyber-cyan transition-colors">Militech</a>
              </li>
              <li>
                <a href="#" className="hover:text-cyber-cyan transition-colors">Night City Bank</a>
              </li>
              <li>
                <a href="#" className="hover:text-cyber-cyan transition-colors">Biotechnica</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-cyber-cyan font-display mb-4">NETRUNNER STATUS</h3>
            <div className="cyber-border p-4 bg-cyber-black/50">
              <p className="text-cyber-gray/90 mb-2">NETWORK: <span className="text-cyber-cyan">ONLINE</span></p>
              <p className="text-cyber-gray/90 mb-2">ACTIVE USERS: <span className="text-cyber-cyan">247</span></p>
              <p className="text-cyber-gray/90 mb-2">SERVER STATUS: <span className="text-cyber-cyan">SECURE</span></p>
              <div className="w-full h-1 bg-cyber-gray/20 mt-4">
                <div className="h-full w-3/4 bg-cyber-cyan"></div>
              </div>
              <p className="text-xs text-cyber-gray/50 mt-1">SERVER CAPACITY: 75%</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-cyber-cyan/20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-cyber-gray/50 text-sm mb-4 md:mb-0">
            &copy; 2049 CYBERPUNK:2049 | All rights reserved
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-cyber-gray/70 hover:text-cyber-cyan transition-colors">
              Terms
            </a>
            <a href="#" className="text-cyber-gray/70 hover:text-cyber-cyan transition-colors">
              Privacy
            </a>
            <a href="#" className="text-cyber-gray/70 hover:text-cyber-cyan transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
