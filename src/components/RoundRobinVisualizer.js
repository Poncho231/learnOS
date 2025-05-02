/******************************************************************************
 * Simple RR with time-quantum 4s for same INITIAL workload.
 ******************************************************************************/
import React, { useMemo } from 'react';
import GanttChart from './GanttChart';

const Q = 4;
const LOAD = [
  { id:'P1', burst:6 },
  { id:'P2', burst:4 },
  { id:'P3', burst:5 }
];

export default function RoundRobinVisualizer(){
  const schedule = useMemo(() => {
    let clock=0, queue=[...LOAD], done=[], bars=[];
    while(queue.length){
      const p = queue.shift();
      const slice = Math.min(Q, p.burst);
      bars.push({ id:p.id, start:clock, dur:slice, color:'#17a2b8' });
      clock += slice;
      p.burst -= slice;
      if(p.burst) queue.push(p); else done.push(p.id);
    }
    return bars;
  },[]);

  return(
    <section>
      <h3>Round-Robin (Quantum&nbsp;=&nbsp;4&nbsp;s)</h3>
      <GanttChart data={schedule} />
      <p>The CPU switches every <strong>time quantum</strong> to give each
         ready process a share – classic for <em>time-sharing</em> systems.</p>
    </section>
  );
}
