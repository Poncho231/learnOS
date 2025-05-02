// src/components/Processes.js
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Section from './Section'; // Re-use Section for entry animations
import ProcessQuestGame from './ProcessQuestGame'; // Import the game
import './Processes.css'; // We will update this file

// --- Data for Sections ---
const processInfo = {
  definition: {
    id: 'define',
    title: 'What is a Process?',
    icon: '💡',
    content: "A program is passive code (like a recipe), while a process is that program actively running in memory (like actually baking the cake). It includes the program code, current activity (program counter, registers), and resources (memory, open files).",
    analogy: "Think of multiple people baking different cakes using the same kitchen (CPU, memory). Each person's baking activity is a process.",
  },
  states: {
    id: 'states',
    title: 'Process States',
    icon: '🚦',
    content: "Processes transition between states as they execute. Understanding these states is key to managing concurrency.",
    states: [
      { id:'new', title:'New', color:'#64748b', description: "Process being created.", pos: { x: 50, y: 10 } },
      { id:'ready', title:'Ready', color:'#0ea5e9', description: "Waiting for CPU time.", pos: { x: 25, y: 50 } },
      { id:'running', title:'Running', color:'#22c55e', description: "Actively executing on CPU.", pos: { x: 50, y: 50 } },
      { id:'waiting', title:'Waiting', color:'#f59e0b', description: "Blocked, waiting for I/O or event.", pos: { x: 75, y: 50 } },
      { id:'terminated', title:'Terminated', color:'#ef4444', description: "Finished execution.", pos: { x: 50, y: 90 } }
    ],
    transitions: [
      { from: 'new', to: 'ready', label: 'Admit' },
      { from: 'ready', to: 'running', label: 'Dispatch' },
      { from: 'running', to: 'ready', label: 'Interrupt/Quantum Expired' },
      { from: 'running', to: 'waiting', label: 'I/O or Event Wait' },
      { from: 'running', to: 'terminated', label: 'Exit' },
      { from: 'waiting', to: 'ready', label: 'I/O or Event Complete' }
    ]
  },
  pcb: {
    id: 'pcb',
    title: 'Process Control Block (PCB)',
    icon: '📋',
    content: "The OS keeps track of each process using a data structure called the PCB. It's like the process's ID card and contains vital information.",
    fields: [
      { name: 'Process State', value: 'e.g., Ready, Running', color: '#ef4444' },
      { name: 'Program Counter', value: 'Address of next instruction', color: '#f97316' },
      { name: 'CPU Registers', value: 'Accumulators, Index Regs', color: '#f59e0b' },
      { name: 'CPU Scheduling Info', value: 'Priority, Queue Pointers', color: '#eab308' },
      { name: 'Memory Management', value: 'Base/Limit, Page Tables', color: '#84cc16' },
      { name: 'Accounting Info', value: 'CPU time used, Time limits', color: '#22c55e' },
      { name: 'I/O Status Info', value: 'Open files, Allocated devices', color: '#10b981' }
    ]
  },
  lifecycle: {
    id: 'lifecycle',
    title: 'Process Lifecycle',
    icon: '🔄',
    content: "Processes are created and eventually terminated.",
    creation: { title: 'Creation', steps: ['Parent calls fork()', 'Child process created (duplicate)', 'Child may call exec() to load new program'] },
    termination: { title: 'Termination', steps: ['Process calls exit()', 'OS reclaims resources', 'Parent notified (via wait())'] }
  },
  ipc: {
    id: 'ipc',
    title: 'Inter-Process Communication (IPC)',
    icon: '💬',
    content: "Processes often need to communicate or share data. IPC mechanisms allow this.",
    methods: [
      { name: 'Shared Memory', description: 'Fastest method. Processes share a region of memory. Requires careful synchronization (mutexes, semaphores).', viz: 'shared-memory' },
      { name: 'Message Passing', description: 'Processes send messages via OS kernel (send/receive primitives). Slower but simpler synchronization.', viz: 'message-passing' }
    ]
  },
  simulation: {
      id: 'simulation',
      title: 'State Simulation',
      icon: '⚙️',
      content: "Observe automatic transitions between states based on simulated events.",
  },
  game: {
      id: 'game',
      title: 'Process Quest',
      icon: '🎮',
      content: "Take control! Play as a process, manage your state, request resources, and try to complete execution efficiently.",
  }
};

// --- Helper Components ---

// Simple card for definition
const DefinitionCard = ({ data }) => (
  <motion.div
      className="process-card definition-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
  >
    <h3>{data.icon} {data.title}</h3>
    <p>{data.content}</p>
    <p className="analogy"><em>Analogy: {data.analogy}</em></p>
  </motion.div>
);

// Interactive State Diagram
const StateDiagram = ({ data, activeState, onStateClick }) => {
    const svgRef = useRef(null);

    // Calculate line positions based on state positions
    const transitionLines = useMemo(() => {
        return data.transitions.map(t => {
            const fromState = data.states.find(s => s.id === t.from);
            const toState = data.states.find(s => s.id === t.to);
            if (!fromState || !toState) return null;

            // Basic positioning - adjust as needed for aesthetics
             // Calculate midpoints adjusted for circle radius approximation (e.g., 5%)
            const r = 5; // Approximate radius percentage
            const startX = fromState.pos.x;
            const startY = fromState.pos.y;
            const endX = toState.pos.x;
            const endY = toState.pos.y;

             // Angle between points
            const angle = Math.atan2(endY - startY, endX - startX);

             // Adjust start/end points to be on the circumference
            const x1 = startX + r * Math.cos(angle);
            const y1 = startY + r * Math.sin(angle);
            const x2 = endX - r * Math.cos(angle);
            const y2 = endY - r * Math.sin(angle);

             // Midpoint for label
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            return { ...t, x1, y1, x2, y2, midX, midY };
        }).filter(Boolean);
    }, [data.states, data.transitions]);

    return (
        <div className="process-card state-diagram-card">
            <h3>{data.icon} {data.title}</h3>
             <p>{data.content}</p>
            <svg ref={svgRef} viewBox="0 0 100 100" className="state-diagram-svg">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7"
                    refX="0" refY="3.5" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                    </marker>
                </defs>

                 {/* Draw Transitions (lines and labels) */}
                {transitionLines.map((t, idx) => (
                     <g key={`trans-${idx}`} className="transition-group">
                        <line
                            x1={`${t.x1}%`} y1={`${t.y1}%`}
                            x2={`${t.x2}%`} y2={`${t.y2}%`}
                            stroke="#6b7280" strokeWidth="0.5"
                            markerEnd="url(#arrowhead)"
                        />
                        {/* Position label near the middle of the line */}
                        <text x={`${t.midX}%`} y={`${t.midY}%`} dy="-1" textAnchor="middle" fontSize="3" fill="#475569">
                            {t.label}
                        </text>
                    </g>
                ))}

                 {/* Draw States (circles and text) */}
                {data.states.map(state => (
                <g key={state.id} transform={`translate(${state.pos.x} ${state.pos.y})`} className="state-node-group">
                    <motion.circle
                        cx="0" cy="0" r="7" // Increased radius
                        fill={state.color}
                        stroke={activeState === state.id ? 'white' : '#475569'}
                        strokeWidth={activeState === state.id ? 1 : 0.5}
                        onClick={() => onStateClick(state)}
                        className="state-circle"
                        whileHover={{ scale: 1.1 }}
                        animate={{ scale: activeState === state.id ? 1.2 : 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    />
                    <text x="0" y="1" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#fff">
                        {state.title}
                    </text>
                    </g>
                ))}
            </svg>
             {/* Display selected state description */}
             <AnimatePresence mode="wait">
             {activeState && (
                 <motion.div
                     key={activeState} // Animate when activeState changes
                     className="state-description"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                 >
                     <strong>{data.states.find(s=>s.id === activeState)?.title}:</strong> {data.states.find(s=>s.id === activeState)?.description}
                 </motion.div>
             )}
             </AnimatePresence>
        </div>
    );
};

// PCB Visualization
const PcbVisualizer = ({ data }) => (
  <div className="process-card pcb-card">
    <h3>{data.icon} {data.title}</h3>
    <p>{data.content}</p>
    <motion.div
        className="pcb-grid"
        initial="hidden"
        animate="visible"
        variants={{
            visible: { transition: { staggerChildren: 0.1 } }
        }}
    >
      {data.fields.map((field, index) => (
        <motion.div
            key={index}
            className="pcb-field"
            variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
            style={{ '--field-color': field.color }}
        >
          <span className="pcb-field-name">{field.name}</span>
          <span className="pcb-field-value">{field.value}</span>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

// Lifecycle Visualization
const LifecycleVisualizer = ({ data }) => (
  <div className="process-card lifecycle-card">
    <h3>{data.icon} {data.title}</h3>
    <p>{data.content}</p>
    <div className="lifecycle-columns">
      {/* Creation Column */}
      <motion.div
          className="lifecycle-column"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
      >
        <h4>{data.creation.title}</h4>
        <ol>
          {data.creation.steps.map((step, i) => <li key={`create-${i}`}>{step}</li>)}
        </ol>
        {/* Add simple graphic/icon */}
        <div className="lifecycle-icon">🌱</div>
      </motion.div>
      {/* Termination Column */}
      <motion.div
           className="lifecycle-column"
           initial={{ opacity: 0, x: 30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
      >
        <h4>{data.termination.title}</h4>
        <ol>
          {data.termination.steps.map((step, i) => <li key={`term-${i}`}>{step}</li>)}
        </ol>
         <div className="lifecycle-icon">🏁</div>
      </motion.div>
    </div>
  </div>
);

// IPC Visualization
const IpcVisualizer = ({ data }) => (
  <div className="process-card ipc-card">
    <h3>{data.icon} {data.title}</h3>
    <p>{data.content}</p>
    <div className="ipc-methods">
      {data.methods.map((method, index) => (
        <motion.div
            key={method.name}
            className="ipc-method"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.1 }}
        >
          <h4>{method.name}</h4>
          <p>{method.description}</p>
          <div className="ipc-visualization">
            {/* Placeholder for visual representation */}
            {method.viz === 'shared-memory' && (
              <div className="viz shared-memory-viz">
                <div className="proc">P1</div> <div className="mem-block">Shared<br/>Memory</div> <div className="proc">P2</div>
              </div>
            )}
            {method.viz === 'message-passing' && (
              <div className="viz message-passing-viz">
                <div className="proc">P1</div> <div className="msg">📧➡️</div> <div className="kernel">Kernel</div> <div className="msg">➡️📧</div> <div className="proc">P2</div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

// Simple Simulation Component (reuses state logic idea)
const StateSimulation = ({ info }) => {
    const [currentState, setCurrentState] = useState('new');
    const [log, setLog] = useState(['Simulation Idle']);
    const timerRef = useRef(null);

    const possibleTransitions = useMemo(() => ({
        new:       ['ready'],
        ready:     ['running'],
        running:   ['waiting','terminated', 'ready'], // Added ready for preemption simulation
        waiting:   ['ready'],
        terminated:[]
    }), []);

    const addLog = useCallback((message) => {
        setLog(l => [`[${new Date().toLocaleTimeString()}] ${message}`, ...l].slice(0, 5));
    }, []);

    const step = useCallback(() => {
        const options = possibleTransitions[currentState];
        if (!options || options.length === 0) {
            addLog(`Process Terminated. Halting Simulation.`);
            clearInterval(timerRef.current);
            timerRef.current = null;
            return;
        }

        // Simulate potential events
        let nextState = currentState;
         if (currentState === 'running' && Math.random() < 0.3) { // 30% chance of I/O request
             nextState = 'waiting';
             addLog(`Process requests I/O. -> WAITING`);
         } else if (currentState === 'running' && Math.random() < 0.2) { // 20% chance of quantum expiry
             nextState = 'ready';
             addLog(`Quantum expired. -> READY`);
         } else if (currentState === 'waiting' && Math.random() < 0.5) { // 50% chance I/O completes
             nextState = 'ready';
              addLog(`I/O Complete. -> READY`);
         } else if (currentState === 'ready' && Math.random() < 0.6) { // 60% chance of dispatch
              nextState = 'running';
              addLog(`Scheduler Dispatch. -> RUNNING`);
         } else if (currentState === 'new' && Math.random() < 0.8) { // 80% chance of admit
              nextState = 'ready';
              addLog(`Process Admitted. -> READY`);
         } else if (currentState === 'running' && Math.random() < 0.1) { // 10% chance of exit
             nextState = 'terminated';
             addLog(`Process Exits. -> TERMINATED`);
         }
         // Only update state if it actually changed
         if (nextState !== currentState) {
            setCurrentState(nextState);
         } else {
             addLog(`Process remains in ${currentState.toUpperCase()} state.`);
         }

    }, [currentState, possibleTransitions, addLog]);

    const toggleSimulation = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            addLog('Simulation Paused.');
        } else {
             if(currentState === 'terminated') { // Prevent starting if already terminated
                 addLog('Cannot start simulation, process already terminated. Reset first.');
                 return;
             }
            addLog('Simulation Started.');
            // Initial step, then interval
            step();
            timerRef.current = setInterval(step, 1500); // Adjust speed as needed
        }
    };

     const resetSimulation = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setCurrentState('new');
        setLog(['Simulation Reset.']);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
         <div className="process-card simulation-card">
             <h3>{info.icon} {info.title}</h3>
             <p>{info.content}</p>
             <div className="simulation-controls">
                 <StateDiagram data={processInfo.states} activeState={currentState} onStateClick={() => {}} />
                 <div className="simulation-panel">
                     <button onClick={toggleSimulation} className="btn secondary">
                         {timerRef.current ? 'Pause Sim' : 'Start Sim'}
                     </button>
                      <button onClick={resetSimulation} className="btn reset">
                         Reset Sim
                     </button>
                     <div className="simulation-log">
                         <strong>Log:</strong>
                         {log.map((l, i) => <div key={i}>{l}</div>)}
                     </div>
                 </div>
             </div>
         </div>
    );
};


// --- Main Processes Component ---
export default function Processes() {
  const [activeStateDiagramState, setActiveStateDiagramState] = useState(null);

  // Use react-intersection-observer for section animations
  const { ref: defineRef, inView: defineInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: statesRef, inView: statesInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: pcbRef, inView: pcbInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: lifecycleRef, inView: lifecycleInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: ipcRef, inView: ipcInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: simRef, inView: simInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: gameRef, inView: gameInView } = useInView({ triggerOnce: true, threshold: 0.1 });


  const handleStateClick = (state) => {
      setActiveStateDiagramState(state.id);
  };

  return (
    <div className="processes-page">
      <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
      >
          Understanding Processes
      </motion.h2>

      {/* Render sections using the helper components */}
      <motion.div ref={defineRef} animate={defineInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={{ duration: 0.5 }}>
           <DefinitionCard data={processInfo.definition} />
      </motion.div>

       <motion.div ref={statesRef} animate={statesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <StateDiagram data={processInfo.states} activeState={activeStateDiagramState} onStateClick={handleStateClick} />
       </motion.div>

       <motion.div ref={pcbRef} animate={pcbInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={{ duration: 0.5, delay: 0.1 }}>
           <PcbVisualizer data={processInfo.pcb} />
      </motion.div>

       <motion.div ref={lifecycleRef} animate={lifecycleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={{ duration: 0.5, delay: 0.1 }}>
           <LifecycleVisualizer data={processInfo.lifecycle} />
      </motion.div>

       <motion.div ref={ipcRef} animate={ipcInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <IpcVisualizer data={processInfo.ipc} />
      </motion.div>

       <motion.div ref={simRef} animate={simInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={{ duration: 0.5, delay: 0.1 }}>
           <StateSimulation info={processInfo.simulation} />
       </motion.div>

        <motion.div ref={gameRef} animate={gameInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={{ duration: 0.5, delay: 0.1 }}>
           <ProcessQuestGame />
        </motion.div>

    </div>
  );
}