import { useReducer, useEffect, useRef } from "react";
import { Process, SimulationState, AlgorithmType } from "../core/types";
import { computeNextTick, createInitialState } from "../core/simulator";

type Action =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "STEP" }
  | { type: "SET_ALGORITHM"; payload: AlgorithmType }
  | { type: "SET_QUANTUM"; payload: number }
  | { type: "ADD_PROCESS"; payload: Process }
  | { type: "SET_PROCESSES"; payload: Process[] };

const reducer = (state: SimulationState, action: Action): SimulationState => {
  switch (action.type) {
    case "START":
      if (state.status === "FINISHED" || state.processes.length === 0) return state;
      return { ...state, status: "RUNNING" };
    case "PAUSE":
      if (state.status !== "RUNNING") return state;
      return { ...state, status: "PAUSED" };
    case "RESET":
      // Reset processes to initial state
      const resetProcesses = state.processes.map(p => ({
        ...p,
        state: "WAITING" as const,
        currentPhaseIndex: 0,
        startTime: null,
        endTime: null,
        waitingTime: 0,
        ioTime: 0,
        cpuTime: 0,
        lastReadyTime: p.arrivalTime,
        quantumUsed: 0,
        phases: p.phases.map(ph => ({ ...ph, remaining: ph.duration }))
      }));
      return {
        ...state,
        tick: 0,
        status: "IDLE",
        processes: resetProcesses,
        gantt: [],
      };
    case "STEP":
      if (state.status === "FINISHED") return state;
      return computeNextTick({ ...state, status: "RUNNING" });
    case "SET_ALGORITHM":
      return { ...state, algorithm: action.payload };
    case "SET_QUANTUM":
      return { ...state, quantum: action.payload };
    case "ADD_PROCESS":
      return { ...state, processes: [...state.processes, action.payload] };
    case "SET_PROCESSES":
      return { ...state, processes: action.payload, tick: 0, gantt: [], status: "IDLE" };
    default:
      return state;
  }
};

export const useSimulator = (tickIntervalMs: number = 500) => {
  const [state, dispatch] = useReducer(reducer, createInitialState());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.status === "RUNNING") {
      timerRef.current = setInterval(() => {
        dispatch({ type: "STEP" });
      }, tickIntervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, tickIntervalMs]);

  return { state, dispatch };
};
