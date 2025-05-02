// src/components/Processes.js
import React, { useState, useRef, useEffect } from 'react';
import './Processes.css';
import Section from './Section';

const TABS = [
  { id: 'intro',     label: 'Introduction' },
  { id: 'define',    label: 'Definition' },
  { id: 'states',    label: 'States' },
  { id: 'pcb',       label: 'PCB' },
  { id: 'sched',     label: 'Scheduling' },
  { id: 'create',    label: 'Creation' },
  { id: 'terminate', label: 'Termination' },
  { id: 'ipc',       label: 'IPC' },
  { id: 'pc',        label: 'Producer-Consumer' },
  { id: 'sim',       label: 'Simulation' }
];

const STATES = [
  { id:'new',        title:'New',        bg:'#64748b' },
  { id:'ready',      title:'Ready',      bg:'#0ea5e9' },
  { id:'running',    title:'Running',    bg:'#22c55e' },
  { id:'waiting',    title:'Waiting',    bg:'#f59e0b' },
  { id:'terminated', title:'Terminated', bg:'#ef4444' }
];

const TRANS = {
  new:       ['ready'],
  ready:     ['running'],
  running:   ['waiting','terminated'],
  waiting:   ['ready'],
  terminated:[]
};

const INTERVAL = 1200;

export default function Processes() {
  const [tab, setTab]       = useState('intro');
  const [state, setState]   = useState('new');
  const [log,   setLog]     = useState(['Simulation Idle']);
  const [auto,  setAuto]    = useState(false);
  const timer = useRef(null);

  const step = () => {
    const opts = TRANS[state];
    if (!opts.length) return stopAuto();
    const nxt = opts[Math.floor(Math.random()*opts.length)];
    setState(nxt);
    setLog(l=>[`→ ${capitalize(nxt)}`,...l].slice(0,7));
    if (nxt==='terminated') stopAuto();
  };

  const ioRequest = () => {
    if (state==='running') {
      setState('waiting');
      setLog(l=>['→ Waiting (I/O)',...l].slice(0,7));
    }
  };

  const startAuto = () => {
    setAuto(true);
    setLog(l=>['Auto Started',...l].slice(0,7));
    step();
    timer.current = setInterval(step, INTERVAL);
  };
  const stopAuto = () => {
    clearInterval(timer.current);
    setAuto(false);
    setLog(l=>['Auto Paused',...l].slice(0,7));
  };
  const toggleAuto = () => auto ? stopAuto() : startAuto();

  const reset = () => {
    clearInterval(timer.current);
    setAuto(false);
    setState('new');
    setLog(['Simulation Reset']);
  };

  useEffect(()=>()=>clearInterval(timer.current), []);

  return (
    <div className="proc-page">
      <h2>Processes Deep Dive</h2>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t=>(
          <button
            key={t.id}
            className={`tab${tab===t.id?' active':''}`}
            onClick={()=>setTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div className="tab-content">

        {tab==='intro' && <Section>
          <details>
            <summary>Why study Processes?</summary>
            <p>Modern OS run many programs concurrently—managing CPU, memory, and I/O for each “process.”</p>
          </details>
          <details>
            <summary>Lesson Goals</summary>
            <ul>
              <li>Define “process”</li>
              <li>Explore states, PCB, scheduling, creation, termination, IPC</li>
            </ul>
          </details>
        </Section>}

        {tab==='define' && <Section>
          <details>
            <summary>Program vs. Process</summary>
            <p>A <em>program</em> is passive code on disk; a <em>process</em> is its execution in memory.</p>
          </details>
          <details>
            <summary>Virtual Memory Layout</summary>
            <ul>
              <li>Text (code) segment</li>
              <li>Data (globals)</li>
              <li>Heap (dynamic)</li>
              <li>Stack (locals/return addresses)</li>
            </ul>
          </details>
        </Section>}

        {tab==='states' && <Section>
          <details>
            <summary>Process State Diagram</summary>
            <p>new → ready → running → waiting ↔ ready; running → terminated</p>
          </details>
          <details>
            <summary>State Descriptions</summary>
            <ul>
              <li><strong>new:</strong> being created</li>
              <li><strong>ready:</strong> waiting for CPU</li>
              <li><strong>running:</strong> executing</li>
              <li><strong>waiting:</strong> blocked for I/O</li>
              <li><strong>terminated:</strong> finished</li>
            </ul>
          </details>
        </Section>}

        {tab==='pcb' && <Section>
          <details>
            <summary>Process Control Block (PCB)</summary>
            <ul>
              <li>Process state</li>
              <li>Program counter & CPU registers</li>
              <li>Scheduling info (priority, queues)</li>
              <li>Memory management (base/limit, page tables)</li>
              <li>I/O status (open files/devices)</li>
            </ul>
          </details>
        </Section>}

        {tab==='sched' && <Section>
          <details>
            <summary>Queues</summary>
            <ul>
              <li>Job queue: all processes</li>
              <li>Ready queue: in-memory, awaiting CPU</li>
              <li>Device queues: awaiting I/O</li>
            </ul>
          </details>
          <details>
            <summary>Schedulers</summary>
            <ul>
              <li>Long-term: admits jobs to memory</li>
              <li>Short-term: dispatches CPU</li>
            </ul>
          </details>
        </Section>}

        {tab==='create' && <Section>
          <details>
            <summary>fork() & exec()</summary>
            <p>
              <code>fork()</code> clones the process; child returns 0, parent gets PID.<br/>
              <code>exec()</code> swaps in a new program.
            </p>
          </details>
          <details>
            <summary>wait()</summary>
            <p>Parent blocks until child terminates and collects its exit status.</p>
          </details>
        </Section>}

        {tab==='terminate' && <Section>
          <details>
            <summary>exit()</summary>
            <p>Reclaims resources, removes PCB, notifies parent.</p>
          </details>
          <details>
            <summary>Abort</summary>
            <p>Parent can abort child for resource overuse or own exit.</p>
          </details>
        </Section>}

        {tab==='ipc' && <Section>
          <details>
            <summary>Shared Memory</summary>
            <p>Fastest, but needs synchronization primitives (semaphores, mutexes).</p>
          </details>
          <details>
            <summary>Message Passing</summary>
            <p>Send/receive calls; can be blocking (synchronous) or non-blocking.</p>
          </details>
        </Section>}

        {tab==='pc' && <Section>
          <details>
            <summary>Producer-Consumer</summary>
            <p>Use a circular buffer; producer blocks if full, consumer if empty.</p>
          </details>
        </Section>}

        {tab==='sim' && <Section>
          <h3>State Simulation</h3>

          <div className="machine-box grid-2col">
            {/* Left: vertical circles */}
            <div className="vertical-circles">
              {STATES.map(s=>(
                <div
                  key={s.id}
                  className={`mcircle${state===s.id?' active':''}`}
                  style={{
                    borderColor: s.bg,
                    background: state===s.id?s.bg:'transparent',
                    color: state===s.id?'#fff':'var(--text-secondary)'
                  }}
                >
                  {s.title[0]}
                </div>
              ))}
            </div>

            {/* Right: controls, log, waiting tip */}
            <div>
              <div className="controls-col">
                <button className="btn primary"   onClick={step}      disabled={auto}>Step</button>
                <button className="btn secondary" onClick={ioRequest} disabled={state!=='running'}>I/O Request</button>
                <button className="btn secondary" onClick={toggleAuto}>{auto?'Stop':'Auto'}</button>
                <button className="btn reset"     onClick={reset}>Reset</button>
              </div>

              <div className="log">
                {log.map((e,i)=><div key={i}>{e}</div>)}
              </div>

              {state==='waiting' && (
                <div className="waiting-tip">
                  ⚠️ This process is waiting for I/O to complete before returning to Ready.
                </div>
              )}
            </div>
          </div>
        </Section>}

      </div>
    </div>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase()+s.slice(1);
}
