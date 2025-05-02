/******************************************************************************
 * Deadlock demo with live check-list of the four necessary conditions.
 ******************************************************************************/
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './DeadlockAnimation.css';

export default function DeadlockAnimation() {
  const steps = [
    { text: 'P1 requests R1 and obtains it',                 state:1 },
    { text: 'P2 requests R2 and obtains it',                 state:2 },
    { text: 'P1 now requests R2 (held by P2) – P1 blocks',   state:3 },
    { text: 'P2 requests R1 (held by P1) – P2 blocks',       state:4 }
  ];
  /* state index: 0-4 (0 = initial) */
  const [stepIdx, setStepIdx] = useState(0);
  const [auto,    setAuto]    = useState(false);
  const ref = useRef(null);

  const next = () => setStepIdx(i => Math.min(i + 1, steps.length));
  const reset= () => { setStepIdx(0); setAuto(false); };

  useEffect(() => {
    if (auto && !ref.current) ref.current = setInterval(next, 1200);
    if (!auto && ref.current) { clearInterval(ref.current); ref.current=null; }
    return () => ref.current && clearInterval(ref.current);
  }, [auto]);

  /* condition booleans */
  const mutual   = stepIdx >= 1;            // non-shareable R1/R2
  const holdWait = stepIdx >= 3;            // each holds one & waits one
  const noPreempt= true;                    // fixed in this demo
  const circular = stepIdx >= 4;            // P1→R2, P2→R1 loop

  /* visual helpers */
  const p1Blocked = stepIdx >= 3;
  const p2Blocked = stepIdx >= 4;
  const holdsR1   = stepIdx >= 1;
  const holdsR2   = stepIdx >= 2;

  return (
    <div className="deadlock-demo">
      <h4>How a Deadlock Forms (2 processes, 2 resources)</h4>

      {/* resource graph --------------------------------------------------- */}
      <div className="resource-lane">
        <div className={`circle ${p1Blocked ? 'blocked' : holdsR1 ? 'running': ''}`}>P1</div>
        <div className={`square ${holdsR1 ? 'held' : ''}`}>R1</div>
        <div className={`square ${holdsR2 ? 'held' : ''}`}>R2</div>
        <div className={`circle ${p2Blocked ? 'blocked' : holdsR2 ? 'running': ''}`}>P2</div>
      </div>
      {/* animated arrows */}
<motion.div
  className="arrow"
  initial={{ pathLength:0 }}
  animate={{ pathLength: stepIdx>=3 ? 1 : stepIdx>=2? .66 : stepIdx>=1? .33 : 0 }}
  transition={{ duration:0.9, ease:'easeInOut' }}
/>


      {stepIdx>0 && stepIdx<=steps.length && (
        <p className="step">{steps[stepIdx-1].text}</p>
      )}
      {stepIdx===steps.length && (
        <p className="deadlock-msg">Deadlock! – each process waits forever.</p>
      )}

      {/* condition checklist --------------------------------------------- */}
      <div className="conditions">
        <h5>Coffman Conditions</h5>
        <ul>
          <li className={mutual   ? 'met':''}>✔ Mutual Exclusion</li>
          <li className={holdWait ? 'met':''}>✔ Hold & Wait</li>
          <li className={noPreempt? 'met':''}>✔ No Pre-emption</li>
          <li className={circular ? 'met':''}>✔ Circular Wait</li>
        </ul>
      </div>

      {/* controls --------------------------------------------------------- */}
      <div className="controls">
        <button onClick={next}  disabled={auto || stepIdx===steps.length}>Next</button>
        <button onClick={() => setAuto(a=>!a)} disabled={stepIdx===steps.length}>
          {auto?'Stop':'Auto'}
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      <p className="explain">
        Watch each box tick: **all four conditions together** create a deadlock.
        In real systems we break at least one (for example, *No Pre-emption* by
        forcibly reclaiming a resource, or avoid *Circular Wait* with a global
        ordering).
      </p>
    </div>
  );
}
