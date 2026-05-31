import React, { useState } from 'react';
import { SimulationState, AlgorithmType, Process, ProcessPhase } from '../../core/types';
import { Play, Pause, Square, FastForward, Settings, Plus, Shuffle } from 'lucide-react';

interface SidebarProps {
  state: SimulationState;
  dispatch: React.Dispatch<any>;
  speed: number;
  setSpeed: (s: number) => void;
  onGenerate: () => void;
  onAlgorithmChange: (algo: AlgorithmType) => void;
  onAddProcess: (p: Process) => void;
}

const ALGORITHMS: AlgorithmType[] = ["FCFS", "SJF", "RR", "SRTF", "PRIORITY_NP", "PRIORITY_P", "RANDOM"];

const Sidebar: React.FC<SidebarProps> = ({ state, dispatch, speed, setSpeed, onGenerate, onAlgorithmChange, onAddProcess }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newPid, setNewPid] = useState("P99");
  const [newArrival, setNewArrival] = useState(0);
  const [newPriority, setNewPriority] = useState(1);
  const [newBursts, setNewBursts] = useState("4,2,3"); // CPU, IO, CPU...

  const isRunning = state.status === "RUNNING";

  const handleAdd = () => {
    const burstVals = newBursts.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    if (burstVals.length === 0) return;
    
    const phases: ProcessPhase[] = [];
    for (let i = 0; i < burstVals.length; i++) {
      phases.push({
        type: i % 2 === 0 ? "CPU" : "IO",
        duration: burstVals[i],
        remaining: burstVals[i]
      });
    }

    const p: Process = {
      id: newPid,
      arrivalTime: newArrival,
      priority: newPriority,
      phases,
      currentPhaseIndex: 0,
      state: "WAITING",
      color: "bg-slate-400", // Generic color for manual processes
      startTime: null,
      endTime: null,
      waitingTime: 0,
      ioTime: 0,
      cpuTime: 0,
      lastReadyTime: newArrival,
      quantumUsed: 0
    };

    onAddProcess(p);
    setShowAdd(false);
    setNewPid(`P${Math.floor(Math.random() * 1000)}`);
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 p-6 flex flex-col shadow-sm z-10 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          OS Scheduler
        </h1>
        <p className="text-xs text-gray-500 mt-1">Process Scheduling Simulator</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Controls */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex gap-2 justify-center mb-4">
            <button 
              onClick={() => dispatch({ type: isRunning ? 'PAUSE' : 'START' })}
              className={`p-3 rounded-full flex items-center justify-center transition-colors ${isRunning ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              disabled={state.status === "FINISHED"}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </button>
            <button 
              onClick={() => dispatch({ type: 'STEP' })}
              className="p-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isRunning || state.status === "FINISHED"}
            >
              <FastForward className="w-5 h-5" />
            </button>
            <button 
              onClick={() => dispatch({ type: 'RESET' })}
              className="p-3 bg-white text-rose-600 border border-gray-200 hover:bg-rose-50 rounded-full transition-colors"
            >
              <Square className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Status</div>
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
              state.status === 'RUNNING' ? 'bg-green-100 text-green-700' :
              state.status === 'PAUSED' ? 'bg-amber-100 text-amber-700' :
              state.status === 'FINISHED' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-200 text-gray-700'
            }`}>
              {state.status} - Tick {state.tick}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Algorithm</label>
            <select 
              value={state.algorithm}
              onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
              disabled={isRunning}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
            >
              {ALGORITHMS.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
            </select>
          </div>

          {state.algorithm === "RR" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Quantum (ticks)</label>
              <input 
                type="number" 
                value={state.quantum}
                onChange={e => dispatch({ type: 'SET_QUANTUM', payload: parseInt(e.target.value) || 1 })}
                disabled={isRunning}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block p-2.5"
                min="1"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Speed ({speed}ms)</label>
            <input 
              type="range" 
              min="100" 
              max="2000" 
              step="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Process Management */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Processes</label>
          <button 
            onClick={onGenerate}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Shuffle className="w-4 h-4" />
            Randomize Dataset
          </button>

          <button 
            onClick={() => setShowAdd(!showAdd)}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Plus className="w-4 h-4" />
            Add Manual Process
          </button>

          {showAdd && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 mt-2 text-sm">
              <div>
                <label className="block text-xs text-gray-500 mb-1">PID</label>
                <input type="text" value={newPid} onChange={e => setNewPid(e.target.value)} className="w-full border-gray-300 rounded p-1.5" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Arrival</label>
                  <input type="number" value={newArrival} onChange={e => setNewArrival(parseInt(e.target.value))} className="w-full border-gray-300 rounded p-1.5" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Priority</label>
                  <input type="number" value={newPriority} onChange={e => setNewPriority(parseInt(e.target.value))} className="w-full border-gray-300 rounded p-1.5" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bursts (CPU, IO, CPU...)</label>
                <input type="text" value={newBursts} onChange={e => setNewBursts(e.target.value)} placeholder="e.g. 5,2,3" className="w-full border-gray-300 rounded p-1.5" />
              </div>
              <button onClick={handleAdd} className="w-full bg-indigo-600 text-white py-1.5 rounded font-medium hover:bg-indigo-700">Add</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
