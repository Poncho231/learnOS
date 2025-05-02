
// src/components/Deadlocks.js

import React from 'react';
import DeadlockAnimation from './DeadlockAnimation';
import Section from './Section';
import './Deadlocks.css';

const deadlockDefinition =
  "A situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process in the set.";

const deadlockConditions = [
  {
    name: "Mutual Exclusion",
    description:
      "At least one resource must be held in a non-sharable mode; only one process can use it at a time.",
    icon: "🔒",
  },
  {
    name: "Hold and Wait",
    description:
      "A process must be holding at least one resource and waiting to acquire additional resources currently held by others.",
    icon: "⏳",
  },
  {
    name: "No Preemption",
    description:
      "Resources cannot be forcibly taken away; they must be released voluntarily by the holding process.",
    icon: "🚫",
  },
  {
    name: "Circular Wait",
    description:
      "A set of waiting processes {P0...Pn} must exist such that P0 waits for P1, P1 waits for P2, ..., Pn waits for P0.",
    icon: "🔄",
  },
];

const handlingMethods = [
  {
    name: "Prevention",
    description:
      "Ensure the system *never* enters a deadlock state by negating one of the four conditions (e.g., resource ordering, request all upfront).",
    icon: "🛡️",
  },
  {
    name: "Avoidance",
    description:
      "Use future knowledge (max needs) to ensure the system always stays in a 'safe state' (e.g., Banker's Algorithm).",
    icon: "🚦",
  },
  {
    name: "Detection & Recovery",
    description:
      "Allow deadlocks, detect them (e.g., wait-for graph cycle), and recover (e.g., process termination, resource preemption).",
    icon: "🔍",
  },
  {
    name: "Ignorance",
    description:
      "Assume deadlocks are rare and do nothing (common in many general-purpose OS like Linux/Windows). The 'Ostrich Algorithm'.",
    icon: "🤷",
  },
];

const ragInfo = {
  definition:
    "A Resource Allocation Graph (RAG) uses circles for processes and rectangles for resources; edges represent requests (P → R) and assignments (R → P).",
};

const safeStateInfo = {
  definition:
    "A system is in a safe state if there exists a safe sequence of processes where each can obtain required resources and complete.",
  importance:
    "Maintaining a safe state prevents deadlock by ensuring resources are allocated in a way that all processes can finish.",
};

const RagSvgPlaceholder = () => (
  <svg
    viewBox="0 0 200 100"
    xmlns="http://www.w3.org/2000/svg"
    className="rag-placeholder-svg"
  >
    {/* P1 */}
    <circle
      cx="30"
      cy="50"
      r="15"
      fill="none"
      stroke="var(--text-secondary)"
      strokeWidth="2"
    />
    <text
      x="30"
      y="55"
      textAnchor="middle"
      fontSize="10"
      fill="var(--text-secondary)"
    >
      P1
    </text>
    {/* R1 */}
    <rect
      x="75"
      y="35"
      width="30"
      height="30"
      fill="none"
      stroke="var(--text-secondary)"
      strokeWidth="2"
    />
    <text
      x="90"
      y="55"
      textAnchor="middle"
      fontSize="10"
      fill="var(--text-secondary)"
    >
      R1
    </text>
    <circle
      cx="90"
      cy="50"
      r="3"
      fill="var(--text-secondary)"
    />
    {/* P2 */}
    <circle
      cx="170"
      cy="50"
      r="15"
      fill="none"
      stroke="var(--text-secondary)"
      strokeWidth="2"
    />
    <text
      x="170"
      y="55"
      textAnchor="middle"
      fontSize="10"
      fill="var(--text-secondary)"
    >
      P2
    </text>
    {/* Edges */}
    <line
      x1="45"
      y1="50"
      x2="75"
      y2="50"
      stroke="var(--text-secondary)"
      strokeWidth="1.5"
      markerEnd="url(#arrowhead)"
    />
    <line
      x1="105"
      y1="50"
      x2="155"
      y2="50"
      stroke="var(--text-secondary)"
      strokeWidth="1.5"
      markerEnd="url(#arrowhead)"
    />
    <defs>
      <marker
        id="arrowhead"
        markerWidth="5"
        markerHeight="3.5"
        refX="5"
        refY="1.75"
        orient="auto"
      >
        <polygon
          points="0 0, 5 1.75, 0 3.5"
          fill="var(--text-secondary)"
        />
      </marker>
    </defs>
  </svg>
);

export default function Deadlocks() {
  return (
    <div className="deadlocks-page">
      <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
        Understanding Deadlocks
      </h2>
      <p className="page-intro">
        {deadlockDefinition} Explore the conditions, detection methods, and how systems handle this
        critical issue.
      </p>

      <Section>
        <div className="content-grid two-cols">
          <div className="grid-item">
            <h3>Necessary Conditions</h3>
            <p>All four must hold simultaneously:</p>
            <ul className="icon-list">
              {deadlockConditions.map((cond) => (
                <li key={cond.name}>
                  <span className="icon" aria-hidden="true">{cond.icon}</span>
                  <div>
                    <strong>{cond.name}:</strong> {cond.description}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid-item">
            <h3>Resource Allocation Graph (RAG)</h3>
            <p>{ragInfo.definition}</p>
            <div className="rag-visual-container">
              <RagSvgPlaceholder />
            </div>
            <ul>
              <li>
                <strong>Nodes:</strong> Circles (Processes), Rectangles (Resources).
              </li>
              <li>
                <strong>Edges:</strong> Request (P → R), Assignment (R instance → P).
              </li>
              <li>
                <strong>Cycles:</strong> No cycle = No deadlock. Cycle = Possible deadlock (definite if single
                instance per resource).
              </li>
            </ul>

            <h3 style={{ marginTop: 'var(--spacing-lg)' }}>Safe State</h3>
            <p>{safeStateInfo.definition}</p>
            <p className="safe-state-importance">
              {safeStateInfo.importance}
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="animation-section">
          <h3>Deadlock Formation: Animation</h3>
          <p>
            Watch how the four conditions lead to a deadlock between two processes (P1, P2)
            competing for two resources (R1, R2).
          </p>
          <DeadlockAnimation />
        </div>
      </Section>

      <Section>
        <h3>Handling Deadlocks</h3>
        <p>Strategies to deal with potential deadlocks:</p>
        <div className="content-grid three-cols">
          {handlingMethods.map((method) => (
            <div key={method.name} className="info-card">
              <div className="card-icon" aria-hidden="true">{method.icon}</div>
              <h4>{method.name}</h4>
              <p>{method.description}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
