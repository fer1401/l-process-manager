import React from 'react';
import { SimulationState, Process } from '../../core/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const QueueVisualizer: React.FC<{ state: SimulationState }> = ({ state }) => {
  const readyQueue = state.processes.filter(p => p.state === 'READY');
  const runningProcess = state.processes.find(p => p.state === 'RUNNING');
  const blockedQueue = state.processes.filter(p => p.state === 'BLOCKED');

  const renderProcessNode = (p: Process, isRunning = false) => (
    <Tooltip key={p.id}>
      <TooltipTrigger asChild>
        <div className={`${p.color} ${isRunning ? 'animate-pulse ring-4 ring-offset-2 ring-indigo-300' : 'shadow-md'} w-12 h-12 flex items-center justify-center rounded-lg text-white font-bold text-sm shrink-0 transition-all duration-300 transform hover:scale-110 cursor-help`}>
          {p.id}
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-gray-800 text-white border-none shadow-xl">
        <div className="font-mono text-xs space-y-1">
          <div><strong className="text-gray-300">Priority:</strong> {p.priority}</div>
          <div><strong className="text-gray-300">Wait Time:</strong> {p.waitingTime} t</div>
          <div><strong className="text-gray-300">Phase:</strong> {p.phases[p.currentPhaseIndex]?.type} ({p.phases[p.currentPhaseIndex]?.remaining}/{p.phases[p.currentPhaseIndex]?.duration})</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="flex gap-8 items-start h-full">
      {/* Ready Queue */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col min-h-[140px]">
        <div className="text-xs font-bold uppercase text-gray-500 mb-3 flex items-center justify-between">
          <span>Ready Queue</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{readyQueue.length}</span>
        </div>
        <div className="flex gap-2 flex-wrap items-center overflow-auto flex-1 content-start">
          {readyQueue.length > 0 ? readyQueue.map(p => renderProcessNode(p)) : <span className="text-sm text-gray-400 italic">Empty</span>}
        </div>
      </div>

      {/* CPU */}
      <div className="flex flex-col items-center justify-center px-4 min-w-[120px]">
        <div className="text-xs font-bold uppercase text-indigo-500 mb-3 tracking-widest">CPU</div>
        <div className="w-24 h-24 border-4 border-indigo-100 rounded-full flex items-center justify-center bg-white shadow-inner relative">
          {runningProcess ? renderProcessNode(runningProcess, true) : <span className="text-xs text-gray-300 font-mono">IDLE</span>}
          {runningProcess && (
            <svg className="absolute w-full h-full text-indigo-500 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="4" 
                strokeDasharray="289" 
                strokeDashoffset={289 - (289 * (runningProcess.quantumUsed || 1)) / Math.max(state.quantum, 1)} 
                className={state.algorithm === 'RR' ? 'transition-all duration-500' : 'hidden'} 
              />
            </svg>
          )}
        </div>
      </div>

      {/* Blocked Queue */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col min-h-[140px]">
        <div className="text-xs font-bold uppercase text-gray-500 mb-3 flex items-center justify-between">
          <span>Blocked (I/O)</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{blockedQueue.length}</span>
        </div>
        <div className="flex gap-2 flex-wrap items-center overflow-auto flex-1 content-start">
          {blockedQueue.length > 0 ? blockedQueue.map(p => renderProcessNode(p)) : <span className="text-sm text-gray-400 italic">Empty</span>}
        </div>
      </div>
    </div>
  );
};

export default QueueVisualizer;
