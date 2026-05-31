import React from 'react';
import { SimulationState } from '../../core/types';
import GanttVisualizer from '../simulation/GanttVisualizer';
import QueueVisualizer from '../simulation/QueueVisualizer';
import ProcessTable from '../simulation/ProcessTable';

interface MainDashboardProps {
  state: SimulationState;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ state }) => {
  const completedProcesses = state.processes.filter(p => p.state === 'TERMINATED');
  
  const totalWaiting = completedProcesses.reduce((acc, p) => acc + p.waitingTime, 0);
  const avgWaiting = completedProcesses.length > 0 ? (totalWaiting / completedProcesses.length).toFixed(2) : "0.00";
  
  const totalTurnaround = completedProcesses.reduce((acc, p) => acc + ((p.endTime || 0) - p.arrivalTime), 0);
  const avgTurnaround = completedProcesses.length > 0 ? (totalTurnaround / completedProcesses.length).toFixed(2) : "0.00";

  const totalResponse = completedProcesses.reduce((acc, p) => acc + ((p.startTime ?? p.arrivalTime) - p.arrivalTime), 0);
  const avgResponse = completedProcesses.length > 0 ? (totalResponse / completedProcesses.length).toFixed(2) : "0.00";

  const cpuActiveTicks = state.gantt.filter(g => g.state === 'CPU').reduce((acc, g) => acc + (g.endTick - g.startTick), 0);
  const cpuUtilization = state.tick > 0 ? ((cpuActiveTicks / state.tick) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      {/* Header with Stats */}
      <div className="grid grid-cols-5 gap-4 p-6 bg-white border-b border-gray-200">
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
          <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Avg Waiting Time</div>
          <div className="text-2xl font-black text-indigo-700">{avgWaiting} <span className="text-xs font-normal">ticks</span></div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Avg Turnaround</div>
          <div className="text-2xl font-black text-emerald-700">{avgTurnaround} <span className="text-xs font-normal">ticks</span></div>
        </div>
        <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 shadow-sm">
          <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1">Avg Response</div>
          <div className="text-2xl font-black text-sky-700">{avgResponse} <span className="text-xs font-normal">ticks</span></div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">CPU Utilization</div>
          <div className="text-2xl font-black text-amber-700">{cpuUtilization}%</div>
        </div>
        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm">
          <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">Throughput</div>
          <div className="text-2xl font-black text-rose-700">{(completedProcesses.length / Math.max(state.tick, 1)).toFixed(3)} <span className="text-xs font-normal">p/t</span></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Top area - Gantt */}
        <div className="border-b border-gray-200 bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 font-mono flex items-center gap-2">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              Execution Timeline
            </h2>
            <div className="text-xs text-gray-400 font-medium">Algorithm: <span className="text-gray-600 font-bold">{state.algorithm}</span></div>
          </div>
          <GanttVisualizer state={state} />
        </div>
        
        {/* Middle area - Queues */}
        <div className="bg-gray-50/50 p-6 border-b border-gray-200 shadow-inner">
          <h2 className="text-lg font-bold text-gray-800 mb-4 font-mono flex items-center gap-2">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
            Process Queues & CPU
          </h2>
          <QueueVisualizer state={state} />
        </div>

        {/* Bottom area - Table */}
        <div className="bg-white p-6 min-h-[400px]">
          <h2 className="text-lg font-bold text-gray-800 mb-4 font-mono flex items-center gap-2">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            Active Processes Details
          </h2>
          <ProcessTable state={state} />
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;