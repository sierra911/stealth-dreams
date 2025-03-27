import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import MissionSelect from '../components/MissionSelect';
import Footer from '../components/Footer';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  
  useEffect(() => {
    // Welcome toast notification
    const timer = setTimeout(() => {
      toast({
        title: "CONNECTION ESTABLISHED",
        description: "Welcome to the network, Netrunner.",
        className: "bg-cyber-dark border border-cyber-cyan/30 text-cyber-cyan"
      });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  return (
    <div className="min-h-screen bg-cyber-black font-cyber text-cyber-gray overflow-hidden">
      <Header />
      <main>
        <HeroSection />
        <MissionSelect />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
