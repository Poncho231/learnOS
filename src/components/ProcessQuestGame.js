// src/components/ProcessQuestGame.js
import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProcessQuestGame.css'; // We'll create this CSS file

const GAME_TICK_MS = 1000; // How often the game state updates (e.g., scheduler, I/O)
const CPU_QUANTUM = 5; // Ticks the process can run before preemption
const TOTAL_INSTRUCTIONS = 20; // Instructions to complete
const IO_WAIT_TIME = 4; // Ticks I/O takes

const initialState = {
  processState: 'new', // new, ready, running, waiting, terminated
  instructionsCompleted: 0,
  cpuTimeUsed: 0, // Time spent in 'running' state this quantum
  ioTimer: 0, // Countdown for I/O completion
  gameTime: 0,
  message: "Game Started: Click 'Admit'!",
  score: 0,
  gameOver: false,
  preempted: false,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'ADMIT':
      if (state.processState === 'new') {
        return { ...state, processState: 'ready', message: 'Process Ready! Waiting for scheduler...' };
      }
      return state;
    case 'SCHEDULE': // Simulate scheduler dispatching
      if (state.processState === 'ready') {
        return { ...state, processState: 'running', cpuTimeUsed: 0, message: 'Running on CPU!', preempted: false };
      }
      return state;
    case 'EXECUTE':
      if (state.processState === 'running' && state.instructionsCompleted < TOTAL_INSTRUCTIONS) {
        const completed = state.instructionsCompleted + 1;
        const isDone = completed >= TOTAL_INSTRUCTIONS;
        return {
          ...state,
          instructionsCompleted: completed,
          score: state.score + 10,
          message: isDone ? 'All Instructions Executed!' : `Executed instruction ${completed}/${TOTAL_INSTRUCTIONS}`,
          processState: isDone ? 'terminated' : state.processState, // Go to terminated if done
          gameOver: isDone,
        };
      }
      return state;
    case 'REQUEST_IO':
      if (state.processState === 'running') {
        return {
          ...state,
          processState: 'waiting',
          ioTimer: IO_WAIT_TIME,
          message: `Waiting for I/O (${IO_WAIT_TIME}s)...`,
          score: state.score - 5 // Small penalty for I/O
        };
      }
      return state;
    case 'IO_COMPLETE':
      if (state.processState === 'waiting') {
        return { ...state, processState: 'ready', message: 'I/O Complete. Ready for CPU.' };
      }
      return state;
    case 'PREEMPT': // Quantum expired
      if (state.processState === 'running') {
        return { ...state, processState: 'ready', message: 'Quantum Expired! Back to Ready queue.', preempted: true };
      }
      return state;
    case 'TICK':
      let newState = { ...state, gameTime: state.gameTime + 1 };
      let schedulerRandom = Math.random();

      // Process I/O countdown
      if (newState.processState === 'waiting' && newState.ioTimer > 0) {
        newState.ioTimer -= 1;
        if (newState.ioTimer === 0) {
          // Dispatch IO_COMPLETE in the next cycle (or immediately)
          // Using reducer pattern, prefer dispatching actions
        } else {
           newState.message = `Waiting for I/O (${newState.ioTimer}s left)...`;
        }
      }
      // Handle IO completion action dispatch
      if(state.processState === 'waiting' && state.ioTimer === 1) { // Will be 0 on next tick
           return gameReducer(newState, { type: 'IO_COMPLETE' });
      }


      // Process CPU time / quantum
      if (newState.processState === 'running') {
        newState.cpuTimeUsed += 1;
        if (newState.cpuTimeUsed >= CPU_QUANTUM) {
          return gameReducer(newState, { type: 'PREEMPT' }); // Dispatch PREEMPT
        }
      }

       // Simple random scheduler: chance to schedule if ready
      if (newState.processState === 'ready' && schedulerRandom < 0.4) { // 40% chance each tick
          return gameReducer(newState, { type: 'SCHEDULE'});
      }

      return newState;
    case 'RESET':
      return { ...initialState, message: "Game Reset. Click 'Admit'!" };
    default:
      return state;
  }
}

export default function ProcessQuestGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Game Timer
  useEffect(() => {
    if (state.gameOver) return;

    const timerId = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, GAME_TICK_MS);

    return () => clearInterval(timerId);
  }, [state.gameOver]);


  const getActionButtons = () => {
    switch (state.processState) {
      case 'new':
        return <button className="btn primary" onClick={() => dispatch({ type: 'ADMIT' })}>Admit Process</button>;
      case 'running':
        return (
          <>
            <button className="btn success" onClick={() => dispatch({ type: 'EXECUTE' })} disabled={state.instructionsCompleted >= TOTAL_INSTRUCTIONS}>Execute Instruction</button>
            <button className="btn warning" onClick={() => dispatch({ type: 'REQUEST_IO' })}>Request I/O</button>
             {/* Optional Yield Button:
             <button className="btn secondary" onClick={() => dispatch({ type: 'PREEMPT' })}>Yield CPU</button> */}
          </>
        );
      case 'ready':
      case 'waiting':
      case 'terminated':
      default:
        return null; // No direct actions, state changes via TICK or events
    }
  };

  const getProgressBarWidth = () => {
      return Math.min(100, (state.instructionsCompleted / TOTAL_INSTRUCTIONS) * 100);
  }

  return (
    <div className="process-quest-game">
      <h4>Process Quest Mini-Game</h4>
      <div className="game-status-grid">
          <div className="status-item">
              <span>Time:</span>
              <span className="status-value">{state.gameTime}s</span>
          </div>
          <div className="status-item">
              <span>State:</span>
              <motion.span
                  key={state.processState} // Animate when state changes
                  className={`status-value status-${state.processState}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                  {state.processState.toUpperCase()}
              </motion.span>
          </div>
          <div className="status-item">
              <span>Score:</span>
              <span className="status-value">{state.score}</span>
          </div>
          <div className="status-item wide">
              <span>Instructions:</span>
              <div className="progress-bar-container">
                  <motion.div
                      className="progress-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressBarWidth()}%` }}
                  ></motion.div>
                  <span className="progress-text">{state.instructionsCompleted}/{TOTAL_INSTRUCTIONS}</span>
              </div>
          </div>
           <div className="status-item wide">
              <span>CPU Quantum Used:</span>
              <span className="status-value">{state.processState === 'running' ? `${state.cpuTimeUsed}/${CPU_QUANTUM}` : '-'}</span>
          </div>
      </div>

      <div className="game-message">
           <AnimatePresence mode="wait">
                <motion.p
                    key={state.message} // Change animation key with message
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {state.message}
                </motion.p>
            </AnimatePresence>
      </div>

      <div className="game-actions">
        {getActionButtons()}
        {state.gameOver && <p className="game-over-message">Process Terminated! Final Score: {state.score}</p>}
        <button className="btn reset" onClick={() => dispatch({ type: 'RESET' })}>Reset Game</button>
      </div>
    </div>
  );
}