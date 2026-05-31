export type ProcessPhase = {
  type: "CPU" | "IO";
  duration: number;
  remaining: number;
};

export type ProcessState = "WAITING" | "READY" | "RUNNING" | "BLOCKED" | "TERMINATED";

export type Process = {
  id: string;
  arrivalTime: number;
  priority: number;
  phases: ProcessPhase[];
  currentPhaseIndex: number;
  state: ProcessState;
  color: string; // for visualization
  // Metrics
  startTime: number | null;
  endTime: number | null;
  waitingTime: number;
  ioTime: number;
  cpuTime: number;
  lastReadyTime: number;
  quantumUsed?: number; // For Round Robin
};

export type AlgorithmType = "FCFS" | "SJF" | "RR" | "SRTF" | "PRIORITY_NP" | "PRIORITY_P" | "RANDOM";

export type GanttEntry = {
  processId: string;
  color: string;
  startTick: number;
  endTick: number;
  state: "CPU" | "IO";
};

export type SimulationState = {
  tick: number;
  status: "IDLE" | "RUNNING" | "PAUSED" | "FINISHED";
  processes: Process[];
  algorithm: AlgorithmType;
  quantum: number;
  gantt: GanttEntry[];
};
