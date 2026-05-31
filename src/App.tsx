import React, { useState } from 'react';
import { useSimulator } from './hooks/useSimulator';
import { generateInitialSet, generateRandomProcess } from './core/generator';
import { AlgorithmType, Process } from './core/types';
import Sidebar from './components/layout/Sidebar';
import MainDashboard from './components/layout/MainDashboard';
import { TooltipProvider } from '@/components/ui/tooltip';

const App = () => {
  const [speed, setSpeed] = useState(500);
  const { state, dispatch } = useSimulator(speed);

  // Initialize on mount
  React.useEffect(() => {
    if (state.processes.length === 0 && state.tick === 0) {
      dispatch({ type: 'SET_PROCESSES', payload: generateInitialSet(6) });
    }
  }, []);

  const handleGenerate = () => {
    dispatch({ type: 'SET_PROCESSES', payload: generateInitialSet(6) });
  };

  const handleAddProcess = (process: Process) => {
    dispatch({ type: 'ADD_PROCESS', payload: process });
  };

  const handleAlgorithmChange = (algo: AlgorithmType) => {
    dispatch({ type: 'SET_ALGORITHM', payload: algo });
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
        <Sidebar 
          state={state} 
          dispatch={dispatch} 
          speed={speed} 
          setSpeed={setSpeed}
          onGenerate={handleGenerate}
          onAlgorithmChange={handleAlgorithmChange}
          onAddProcess={handleAddProcess}
        />
        <MainDashboard state={state} />
      </div>
    </TooltipProvider>
  );
};

export default App;
