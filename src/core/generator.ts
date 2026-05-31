import { Process, ProcessPhase } from "./types";

const COLORS = [
  "bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400",
  "bg-purple-400", "bg-pink-400", "bg-indigo-400", "bg-teal-400",
  "bg-orange-400", "bg-cyan-400", "bg-rose-400", "bg-emerald-400"
];

let processCounter = 1;

export const generateRandomProcess = (maxArrivalTime = 10, maxBursts = 3, maxBurstDuration = 8): Process => {
  const arrivalTime = Math.floor(Math.random() * maxArrivalTime);
  const priority = Math.floor(Math.random() * 5) + 1; // 1 to 5
  
  const numCpuBursts = Math.floor(Math.random() * maxBursts) + 1;
  const phases: ProcessPhase[] = [];
  
  for (let i = 0; i < numCpuBursts; i++) {
    const cpuDuration = Math.floor(Math.random() * maxBurstDuration) + 1;
    phases.push({ type: "CPU", duration: cpuDuration, remaining: cpuDuration });
    
    // Add IO burst between CPU bursts
    if (i < numCpuBursts - 1) {
      const ioDuration = Math.floor(Math.random() * maxBurstDuration) + 1;
      phases.push({ type: "IO", duration: ioDuration, remaining: ioDuration });
    }
  }

  const id = `P${processCounter++}`;
  const color = COLORS[(processCounter - 2) % COLORS.length];

  return {
    id,
    arrivalTime,
    priority,
    phases,
    currentPhaseIndex: 0,
    state: "WAITING",
    color,
    startTime: null,
    endTime: null,
    waitingTime: 0,
    ioTime: 0,
    cpuTime: 0,
    lastReadyTime: arrivalTime,
    quantumUsed: 0,
  };
};

export const generateInitialSet = (count = 5): Process[] => {
  processCounter = 1; // reset for new set
  const set: Process[] = [];
  for (let i = 0; i < count; i++) {
    set.push(generateRandomProcess());
  }
  // Optional: Ensure at least one arrives at 0
  if (set.length > 0) {
    set[0].arrivalTime = 0;
  }
  return set.sort((a, b) => a.arrivalTime - b.arrivalTime);
};
