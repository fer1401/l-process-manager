import { Process, SimulationState, AlgorithmType } from "./types";

export const createInitialState = (): SimulationState => ({
  tick: 0,
  status: "IDLE",
  processes: [],
  algorithm: "FCFS",
  quantum: 3,
  gantt: [],
});

const getRemainingTotalCpu = (process: Process): number => {
  return process.phases
    .slice(process.currentPhaseIndex)
    .filter((p) => p.type === "CPU")
    .reduce((acc, p) => acc + p.remaining, 0);
};

const selectNextProcess = (readyQueue: Process[], algorithm: AlgorithmType): Process | undefined => {
  if (readyQueue.length === 0) return undefined;

  switch (algorithm) {
    case "FCFS":
    case "RR":
      return readyQueue.reduce((prev, curr) => {
        if (curr.lastReadyTime === prev.lastReadyTime) return curr.id < prev.id ? curr : prev;
        return curr.lastReadyTime < prev.lastReadyTime ? curr : prev;
      });
    
    case "SJF":
    case "SRTF":
      return readyQueue.reduce((prev, curr) => {
        const prevCpu = getRemainingTotalCpu(prev);
        const currCpu = getRemainingTotalCpu(curr);
        if (currCpu === prevCpu) return curr.lastReadyTime < prev.lastReadyTime ? curr : prev;
        return currCpu < prevCpu ? curr : prev;
      });
      
    case "PRIORITY_NP":
    case "PRIORITY_P":
      // Lower number = higher priority
      return readyQueue.reduce((prev, curr) => {
        if (curr.priority === prev.priority) return curr.lastReadyTime < prev.lastReadyTime ? curr : prev;
        return curr.priority < prev.priority ? curr : prev;
      });
      
    case "RANDOM":
      return readyQueue[Math.floor(Math.random() * readyQueue.length)];
      
    default:
      return readyQueue[0];
  }
};

const shouldPreempt = (running: Process, readyQueue: Process[], algorithm: AlgorithmType, quantum: number): boolean => {
  if (readyQueue.length === 0) return false;
  
  if (algorithm === "RR") {
    return (running.quantumUsed || 0) >= quantum;
  }
  
  if (algorithm === "SRTF") {
    const next = selectNextProcess(readyQueue, algorithm);
    if (next && getRemainingTotalCpu(next) < getRemainingTotalCpu(running)) return true;
  }
  
  if (algorithm === "PRIORITY_P") {
    const next = selectNextProcess(readyQueue, algorithm);
    if (next && next.priority < running.priority) return true;
  }
  
  return false;
};

export const computeNextTick = (state: SimulationState): SimulationState => {
  if (state.status !== "RUNNING") return state;

  const { tick, processes, algorithm, quantum, gantt } = state;
  // Deep clone processes and phases to avoid mutating history state in React
  const nextProcesses = processes.map(p => ({ 
    ...p, 
    phases: p.phases.map(ph => ({ ...ph })) 
  }));
  const nextGantt = [...gantt];

  const recordGantt = (p: Process, currentTick: number, type: "CPU" | "IO") => {
    let extended = false;
    for (let i = nextGantt.length - 1; i >= 0; i--) {
      if (nextGantt[i].processId === p.id && nextGantt[i].state === type) {
        if (nextGantt[i].endTick === currentTick) {
          nextGantt[i] = { ...nextGantt[i], endTick: currentTick + 1 };
          extended = true;
        }
        break;
      }
    }
    if (!extended) {
      nextGantt.push({ processId: p.id, color: p.color, startTick: currentTick, endTick: currentTick + 1, state: type });
    }
  };

  // Phase 1: Determine States at time `tick`

  // 1a. Process Arrivals
  nextProcesses.forEach(p => {
    if (p.state === "WAITING" && p.arrivalTime <= tick) {
      p.state = "READY";
      p.lastReadyTime = tick;
    }
  });

  // 1b. Identify currently running
  let runningProcess = nextProcesses.find(p => p.state === "RUNNING");

  // 1c. Preemption
  const readyQueue = nextProcesses.filter(p => p.state === "READY");
  if (runningProcess && shouldPreempt(runningProcess, readyQueue, algorithm, quantum)) {
    runningProcess.state = "READY";
    runningProcess.lastReadyTime = tick;
    runningProcess.quantumUsed = 0;
    runningProcess = undefined;
  }

  // 1d. Selection (if idle)
  if (!runningProcess) {
    const currentReadyQueue = nextProcesses.filter(p => p.state === "READY");
    const nextToRun = selectNextProcess(currentReadyQueue, algorithm);
    if (nextToRun) {
      nextToRun.state = "RUNNING";
      if (nextToRun.startTime === null) {
        nextToRun.startTime = tick;
      }
      runningProcess = nextToRun;
    }
  }

  // Phase 2: Execute Time [tick, tick + 1]
  nextProcesses.forEach(p => {
    if (p.state === "READY") {
      p.waitingTime += 1;
    } else if (p.state === "BLOCKED") {
      p.ioTime += 1;
      const currentPhase = p.phases[p.currentPhaseIndex];
      currentPhase.remaining -= 1;
      recordGantt(p, tick, "IO");
    } else if (p.state === "RUNNING") {
      p.cpuTime += 1;
      p.quantumUsed = (p.quantumUsed || 0) + 1;
      const currentPhase = p.phases[p.currentPhaseIndex];
      currentPhase.remaining -= 1;
      recordGantt(p, tick, "CPU");
    }
  });

  // Phase 3: End-of-Tick Transitions (At time tick + 1)
  nextProcesses.forEach(p => {
    if (p.state === "BLOCKED") {
      const currentPhase = p.phases[p.currentPhaseIndex];
      if (currentPhase.remaining <= 0) {
        p.currentPhaseIndex += 1;
        if (p.currentPhaseIndex >= p.phases.length) {
          p.state = "TERMINATED";
          p.endTime = tick + 1;
        } else {
          p.state = "READY";
          p.lastReadyTime = tick + 1;
        }
      }
    } else if (p.state === "RUNNING") {
      const currentPhase = p.phases[p.currentPhaseIndex];
      if (currentPhase.remaining <= 0) {
        p.currentPhaseIndex += 1;
        p.quantumUsed = 0;
        if (p.currentPhaseIndex >= p.phases.length) {
          p.state = "TERMINATED";
          p.endTime = tick + 1;
        } else {
          p.state = "BLOCKED";
        }
      }
    }
  });

  const allTerminated = nextProcesses.every(p => p.state === "TERMINATED");

  return {
    ...state,
    tick: tick + 1,
    processes: nextProcesses,
    status: allTerminated ? "FINISHED" : "RUNNING",
    gantt: nextGantt
  };
};
