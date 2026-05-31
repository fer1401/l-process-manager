import React from 'react';
import { SimulationState } from '../../core/types';

const ProcessTable: React.FC<{ state: SimulationState }> = ({ state }) => {
  const { processes } = state;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bursts (Rem/Total)</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnaround</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waiting</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {processes.map((p) => {
            const totalRemaining = p.phases.reduce((acc, ph) => acc + ph.remaining, 0);
            const totalDuration = p.phases.reduce((acc, ph) => acc + ph.duration, 0);
            const turnaround = p.endTime ? p.endTime - p.arrivalTime : '-';
            const response = p.startTime !== null ? p.startTime - p.arrivalTime : '-';
            
            return (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${p.color}`}></div>
                    <span className="text-sm font-bold text-gray-900">{p.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{p.arrivalTime}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.priority}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700">{totalRemaining} / {totalDuration}</span>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-1.5 flex overflow-hidden">
                      {p.phases.map((ph, idx) => (
                        <div 
                          key={idx} 
                          className={`h-full ${ph.type === 'CPU' ? 'bg-indigo-400' : 'bg-amber-400 opacity-50'}`}
                          style={{ width: `${(ph.duration / totalDuration) * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${p.state === 'RUNNING' ? 'bg-green-100 text-green-800' : 
                      p.state === 'READY' ? 'bg-blue-100 text-blue-800' : 
                      p.state === 'BLOCKED' ? 'bg-amber-100 text-amber-800' : 
                      p.state === 'TERMINATED' ? 'bg-gray-100 text-gray-800' : 
                      'bg-purple-100 text-purple-800'}`}>
                    {p.state}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{turnaround}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{response}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{p.waitingTime}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProcessTable;
