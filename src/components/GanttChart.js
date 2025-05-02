/******************************************************************************
 * Simple Gantt – fixed width version (no shrink-in animation).
 ******************************************************************************/
import React from 'react';
import './GanttChart.css';

export default function GanttChart({ data }) {
  const total = Math.max(...data.map(d => d.start + d.dur), 1);

  return (
    <div className="gantt-row">
      {data.map(d => (
        <div
          key={d.id + d.start}
          className="gantt-bar"
          style={{
            left  : `${(d.start / total) * 100}%`,
            width : `${(d.dur   / total) * 100}%`,
            background: d.color
          }}
          title={`${d.id}: ${d.start}–${d.start + d.dur}`}
        >
          {d.id}
        </div>
      ))}

      <div className="gantt-axis">
        {Array.from({ length: total + 1 }, (_, t) => (
          <span key={t} style={{ left: `${(t / total) * 100}%` }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
