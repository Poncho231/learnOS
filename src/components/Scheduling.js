import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GanttChart from './GanttChart';
import './Scheduling.css';

// 1) Algorithm definitions
const ALGORITHMS = [
  {
    id: 'fcfs',
    name: 'FCFS',
    color: '#0284c7',
    summary: 'First-Come, First-Served: no preemption, in arrival order.',
    details: `Jobs are queued in the order they arrive. No pre-emption means
      once a job starts it runs to completion.  
      Pros: Simple.  
      Cons: Convoy effect; poor average wait.`
  },
  {
    id: 'sjf',
    name: 'SJF',
    color: '#10b981',
    summary: 'Shortest Job First: pick the smallest next burst.',
    details: `Selects the process with the smallest CPU burst next.  
      Can be non-preemptive or preemptive (SRTF).  
      Pros: Minimizes avg wait time.  
      Cons: Needs burst-length prediction; starvation risk.`
  },
  {
    id: 'priority',
    name: 'Priority',
    color: '#fbbf24',
    summary: 'Priority Scheduling: highest-priority first.',
    details: `Assigns each job a priority. The CPU runs highest priority first.  
      Pros: Important jobs first.  
      Cons: Starvation of low priorities; solution: aging.`
  },
  {
    id: 'rr',
    name: 'Round Robin',
    color: '#ef4444',
    summary: 'Round Robin: time-quantum sharing.',
    details: `Gives each job a fixed quantum of CPU in a circular order.  
      Pros: Fair for interactive.  
      Cons: Overhead vs quantum size trade-off.`
  },
  {
    id: 'mlfq',
    name: 'MLFQ',
    color: '#64748b',
    summary: 'Multi-Level Feedback Queue: adapt by aging.',
    details: `Multiple queues with different priorities/quantum lengths.  
      Jobs move between queues based on behavior.  
      Pros: Dynamic, balances throughput & response.  
      Cons: Complex tuning.`
  }
];

// 2) Sample workload
const WORKLOAD = [
  { id:'P1', burst:7, arrival:0 },
  { id:'P2', burst:4, arrival:1 },
  { id:'P3', burst:5, arrival:2 },
  { id:'P4', burst:3, arrival:3 }
];

// 3) Gantt generators
function ganttFCFS(){
  let t=0, bars=[];
  WORKLOAD.forEach(p=>{
    bars.push({ id:p.id, start:t, dur:p.burst, color:ALGORITHMS[0].color });
    t+=p.burst;
  });
  return bars;
}
function ganttSJF(){
  const sorted = [...WORKLOAD].sort((a,b)=>a.burst-b.burst);
  let t=0, bars=[];
  sorted.forEach(p=>{
    bars.push({ id:p.id, start:t, dur:p.burst, color:ALGORITHMS[1].color });
    t+=p.burst;
  });
  return bars;
}
function ganttPriority(){
  // for demo: treat burst descending as priority
  const sorted = [...WORKLOAD].sort((a,b)=>b.burst-a.burst);
  let t=0, bars=[];
  sorted.forEach(p=>{
    bars.push({ id:p.id, start:t, dur:p.burst, color:ALGORITHMS[2].color });
    t+=p.burst;
  });
  return bars;
}
function ganttRR(quantum=3){
  let t=0, queue = WORKLOAD.map(p=>({...p})), bars=[];
  while(queue.length){
    let p = queue.shift();
    let slice = Math.min(quantum, p.burst);
    bars.push({ id:p.id, start:t, dur:slice, color:ALGORITHMS[3].color });
    t+=slice;
    p.burst -= slice;
    if(p.burst>0) queue.push(p);
  }
  return bars;
}
function ganttMLFQ(){
  // demo: treat as RR with quantum 4 then FCFS tail
  const first = ganttRR(4);
  const done = WORKLOAD.map(p=>p).filter(p=>p.burst>4);
  let t = first.reduce((s,b)=>s+b.dur,0), bars=[...first];
  done.forEach(p=>{
    let rem = p.burst-4;
    bars.push({ id:p.id, start:t, dur:rem, color:ALGORITHMS[4].color });
    t+=rem;
  });
  return bars;
}

export default function Scheduling(){
  const [algoId, setAlgoId] = useState('fcfs');
  const [bars, setBars]     = useState(ganttFCFS());
  const [modal, setModal]   = useState(null);

  // update Gantt on algo change
  useEffect(()=>{
    switch(algoId){
      case 'fcfs':    setBars(ganttFCFS());    break;
      case 'sjf':     setBars(ganttSJF());     break;
      case 'priority':setBars(ganttPriority());break;
      case 'rr':      setBars(ganttRR(3));     break;
      case 'mlfq':    setBars(ganttMLFQ());    break;
    }
  },[algoId]);

  return (
    <div className="sched-page">

      <h2>CPU Scheduling</h2>

      {/* 4) Algorithm selector */}
      <div className="algo-cards">
        {ALGORITHMS.map(a=>(
          <motion.div
            key={a.id}
            className={`algo-card ${algoId===a.id?'active':''}`}
            style={{ background:a.color }}
            whileHover={{ scale:1.05 }}
            onClick={()=>setAlgoId(a.id)}
          >
            <h3>{a.name}</h3>
            <p>{a.summary}</p>
            <button className="btn details" onClick={e=>{e.stopPropagation(); setModal(a);}}>
              Details
            </button>
          </motion.div>
        ))}
      </div>

      {/* 5) Details modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="modal-backdrop"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setModal(null)}
          >
            <motion.div className="modal-content"
              initial={{scale:0.8}} animate={{scale:1}} exit={{scale:0.8}}
              transition={{type:'spring',stiffness:300,damping:20}}
              onClick={e=>e.stopPropagation()}
            >
              <h3>{modal.name}</h3>
              <pre>{modal.details}</pre>
              <button className="btn reset" onClick={()=>setModal(null)}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6) Gantt Chart */}
      <div className="gantt-wrapper">
        <GanttChart data={bars} />
      </div>

    </div>
  );
}
