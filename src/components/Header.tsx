
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Missions', href: '#missions' },
    { label: 'Leaderboard', href: '#leaderboard' },
    { label: 'Profile', href: '#profile' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${
        isScrolled 
          ? 'bg-cyber-black/80 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md cyber-border flex items-center justify-center animate-pulse-cyan">
              <span className="text-cyber-cyan font-display text-xl">C</span>
            </div>
            <h1 className="text-2xl font-display text-cyber-cyan tracking-wider">CYBERPUNK:2049</h1>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item, index) => (
            <a 
              key={index}
              href={item.href}
              className="text-cyber-gray hover:text-cyber-cyan transition-colors duration-300 relative group py-2"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyber-cyan transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
          <a 
            href="#login" 
            className="cyber-border px-6 py-2 text-cyber-cyan hover:bg-cyber-cyan/10 transition-all duration-300"
          >
            LOGIN
          </a>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-cyber-cyan" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="md:hidden absolute top-full left-0 right-0 bg-cyber-black/95 backdrop-blur-md py-4 px-6 border-t border-cyber-cyan/20 animate-fade-in">
          <div className="flex flex-col space-y-4">
            {navItems.map((item, index) => (
              <a 
                key={index}
                href={item.href}
                className="text-cyber-gray hover:text-cyber-cyan py-2 transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a 
              href="#login" 
              className="cyber-border text-center px-6 py-2 text-cyber-cyan hover:bg-cyber-cyan/10 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              LOGIN
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
