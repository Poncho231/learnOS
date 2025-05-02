/******************************************************************************
 * FCFS visualiser – no external UI library, only native buttons & motion.
 ******************************************************************************/
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';   // motion import
import GanttChart from './GanttChart';
import './CPUVisualizer.css';


const INITIAL = [
  { id: 'P1', burst: 6 },
  { id: 'P2', burst: 4 },
  { id: 'P3', burst: 5 }
];
const fresh = () => INITIAL.map(p => ({ ...p, remaining: p.burst }));

export default function CPUVisualizer() {
  const [procs, setProcs] = useState(fresh());
  const [idx,   setIdx]   = useState(0);
  const [t,     setT]     = useState(0);
  const [auto,  setAuto]  = useState(false);
  const [log,   setLog]   = useState([]);
  const ref               = useRef(null);

  /* clock ----------------------------------------------------------------- */
  const tick = () => {
    setProcs(prev => {
      if (idx >= prev.length) return prev;
      const next = prev.map((p, i) =>
        i === idx && p.remaining ? { ...p, remaining: p.remaining - 1 } : p
      );
      const run  = next[idx];
      if (run.remaining === run.burst - 1) push(`t=${t}s  ▶ ${run.id} starts`);
      if (run.remaining === 0)             push(`t=${t+1}s ✓ ${run.id} done`);
      return next;
    });
    setT(c => c + 1);
  };
  const push = m => setLog(l => [...l.slice(-7), m]);

  /* auto ------------------------------------------------------------------ */
  useEffect(() => {
    if (auto && !ref.current) ref.current = setInterval(tick, 850);
    if (!auto && ref.current) { clearInterval(ref.current); ref.current = null; }
    return () => ref.current && clearInterval(ref.current);
  }, [auto]);

  useEffect(() => {
    const cur = procs[idx];
    if (cur?.remaining === 0) {
      if (idx < procs.length - 1) setIdx(i => i + 1);
      else setAuto(false);
    }
  }, [procs, idx]);

  const reset = () => { setProcs(fresh()); setIdx(0); setT(0); setLog([]); setAuto(false); };

  /* derived --------------------------------------------------------------- */
  const running = procs[idx];
  const ready   = procs.slice(idx + (running?.remaining ? 1 : 0)).filter(p => p.remaining);
  const done    = procs.filter(p => !p.remaining);
  const gantt   = [];
  let cursor = 0;
  procs.forEach(p => {
    const exec = p.burst - p.remaining;
    if (exec)       gantt.push({ id:p.id,start:cursor, dur:exec,      color:'#16a34a' });
    if (p.remaining)gantt.push({ id:p.id,start:cursor+exec,dur:p.remaining,color:'#64748b' });
    cursor += p.burst;
  });

  const spring = { type:'spring', stiffness:260, damping:20 };

  return (
    <div className="cpu-vis">
      <h4>First-Come, First-Served (FCFS)</h4>

      {/* legend */}
      <div className="legend">
        <span><span className="legend-dot running" /></span> running
        <span><span className="legend-dot" /></span> ready
        <span><span className="legend-dot done" /></span> done
      </div>

      {/* CPU */}
      <div className="lane">
        <div className="label">CPU:</div>
        <AnimatePresence mode="wait">
          {running && (
            <motion.div
              key={running.id}
              layout
              initial={{ scale:0 }}
              animate={{ scale:1 }}
              exit={{ scale:0 }}
              transition={spring}
              className="circle running"
            >
              {running.id}<small>{running.remaining}s</small>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ready */}
      <div className="lane">
        <div className="label">Ready:</div>
        <AnimatePresence mode="popLayout">
          {ready.map(p => (
            <motion.div
              key={p.id}
              layout
              initial={{ y:-25, opacity:0 }}
              animate={{ y:0, opacity:1 }}
              exit={{ y:25, opacity:0 }}
              transition={spring}
              className="circle"
            >{p.id}</motion.div>
          ))}
          {!ready.length && <em key="empty">empty</em>}
        </AnimatePresence>
      </div>

      {/* done */}
      <div className="lane">
        <div className="label">Done:</div>
        <AnimatePresence mode="popLayout">
          {done.map(p => (
            <motion.div
              key={p.id}
              layout
              initial={{ scale:0 }}
              animate={{ scale:1 }}
              transition={spring}
              className="circle done"
            >{p.id}</motion.div>
          ))}
          {!done.length && <em key="none">none yet</em>}
        </AnimatePresence>
      </div>

      {/* live Gantt */}
      <GanttChart data={gantt} />

      {/* controls */}
      <div className="controls">
        <button className="btn" onClick={tick} disabled={auto || idx >= procs.length}>Pass 1 s</button>
        <button className="btn" onClick={() => setAuto(a=>!a)} disabled={idx >= procs.length}>
          {auto ? 'Stop' : 'Auto'}
        </button>
        <button className="btn reset" onClick={reset}>Reset</button>
        <span className="clock">{t}s</span>
      </div>

      {/* log */}
      <div className="log">
        {log.length ? log.map((l,i)=><div key={i}>{l}</div>) : <em>events…</em>}
      </div>
    </div>
  );
}
