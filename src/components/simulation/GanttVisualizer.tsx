import React from 'react';
import { SimulationState } from '../../core/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const GanttVisualizer: React.FC<{ state: SimulationState }> = ({ state }) => {
  const { gantt, tick, processes } = state;

  if (gantt.length === 0) {
    return <div className="h-24 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">No execution data yet...</div>;
  }

  const totalTicks = Math.max(tick, 10);

  return (
    <div className="w-full relative pt-2 pb-8 px-2 overflow-x-auto">
      <div className="flex flex-col gap-2 min-w-[600px]">
        {processes.map(process => {
          const processGantt = gantt.filter(entry => entry.processId === process.id);
          
          return (
            <div key={process.id} className="flex items-center gap-4">
              <div className="w-12 text-xs font-bold text-gray-500 font-mono">{process.id}</div>
              <div className="flex-1 h-8 bg-gray-100 rounded relative overflow-hidden ring-1 ring-black/5">
                {processGantt.map((block, i) => {
                  const leftPercent = (block.startTick / totalTicks) * 100;
                  const widthPercent = ((block.endTick - block.startTick) / totalTicks) * 100;
                  
                  return (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div 
                          className={`absolute h-full border-r border-white/20 flex items-center justify-center cursor-pointer hover:brightness-110 transition-all ${block.state === 'IO' ? 'bg-stripes opacity-50' : ''} ${block.color}`}
                          style={{ 
                            left: `${leftPercent}%`, 
                            width: `${widthPercent}%`,
                            minWidth: '2px'
                          }}
                        >
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-white border-none shadow-xl">
                        <div className="font-mono text-xs space-y-1">
                          <div><strong className="text-gray-300">Process:</strong> {block.processId}</div>
                          <div><strong className="text-gray-300">State:</strong> {block.state}</div>
                          <div><strong className="text-gray-300">Ticks:</strong> {block.startTick} → {block.endTick}</div>
                          <div><strong className="text-gray-300">Duration:</strong> {block.endTick - block.startTick} t</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis */}
      <div className="mt-4 h-6 relative min-w-[600px] border-t-2 border-gray-300 ml-16">
        {[...Array(Math.floor(totalTicks / 5) + 1)].map((_, i) => {
          const tickVal = i * 5;
          const leftPercent = (tickVal / totalTicks) * 100;
          return (
            <div 
              key={i} 
              className="absolute flex flex-col items-center" 
              style={{ left: `${leftPercent}%` }}
            >
              <div className="h-2 border-l-2 border-gray-300"></div>
              <span className="text-[10px] font-mono text-gray-500 font-bold mt-1">{tickVal}</span>
            </div>
          );
        })}
      </div>
      
      {/* CSS for stripes */}
      <style>{`
        .bg-stripes {
          background-image: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0.2) 10px,
            transparent 10px,
            transparent 20px
          );
        }
      `}</style>
    </div>
  );
};

export default GanttVisualizer;
