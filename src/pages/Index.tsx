
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import MissionSelect from '../components/MissionSelect';
import Footer from '../components/Footer';
import { useToast } from "@/hooks/use-toast";
import MissionResults from '../components/MissionResults';

interface MissionResultsData {
  missionCompleted: number;
  success: boolean;
  timeLeft: number;
}

const Index = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [missionResults, setMissionResults] = useState<MissionResultsData | null>(null);
  
  useEffect(() => {
    // Check if returning from a completed mission
    if (location.state && typeof location.state === 'object' && 'missionCompleted' in location.state) {
      const { missionCompleted, success, timeLeft } = location.state as MissionResultsData;
      setMissionResults({
        missionCompleted,
        success,
        timeLeft
      });
      
      // Clear location state
      window.history.replaceState({}, document.title);
    } else {
      // Welcome toast notification
      const timer = setTimeout(() => {
        toast({
          title: "CONNECTION ESTABLISHED",
          description: "Welcome to the network, Netrunner.",
          className: "bg-cyber-dark border border-cyber-cyan/30 text-cyber-cyan"
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [toast, location]);
  
  const handleReturnFromResults = () => {
    setMissionResults(null);
  };
  
  // If we have mission results, show the results component
  if (missionResults) {
    // Find the mission details
    const missions = [
      {
        id: 1,
        title: "BLUEPRINT EXTRACTION",
        company: "ARASAKA",
        difficulty: "Medium",
        rewards: "5,000 EC + Rare Cyberware",
        timeLimit: 300
      },
      {
        id: 2,
        title: "SURVEILLANCE OVERRIDE",
        company: "MILITECH",
        difficulty: "Hard",
        rewards: "8,000 EC + Advanced Hacking Tool",
        timeLimit: 240
      },
      {
        id: 3,
        title: "SECURE TERMINAL BREACH",
        company: "NIGHT CITY BANK",
        difficulty: "Expert",
        rewards: "12,000 EC + Legendary Program",
        timeLimit: 300
      },
      {
        id: 4,
        title: "SYSTEM BACKDOOR",
        company: "BIOTECHNICA",
        difficulty: "Easy",
        rewards: "3,000 EC + Common Implant",
        timeLimit: 120
      }
    ];
    
    const mission = missions.find(m => m.id === missionResults.missionCompleted);
    
    if (mission) {
      return (
        <MissionResults
          success={missionResults.success}
          missionTitle={mission.title}
          missionCompany={mission.company}
          timeLeft={missionResults.timeLeft}
          timeLimit={mission.timeLimit}
          difficulty={mission.difficulty}
          rewards={mission.rewards}
          onReturn={handleReturnFromResults}
        />
      );
    }
  }
  
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
