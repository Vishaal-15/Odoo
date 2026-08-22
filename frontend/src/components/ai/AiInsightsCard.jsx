import React from 'react';
import { Sparkles, Brain, Lightbulb, CheckCircle2 } from 'lucide-react';

export const AiInsightsCard = () => {
  const sampleInsights = [
    {
      title: 'Optimal Staffing Coverage',
      desc: 'No scheduling conflicts detected for next week. Engineering team coverage remains at 91%.',
      confidence: '98%',
    },
    {
      title: 'Leave Pattern Observation',
      desc: '3 team members requested leaves surrounding Labor Day weekend. Early approval recommended to maintain support roster.',
      confidence: '92%',
    },
  ];

  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(49, 46, 129, 0.25) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--primary-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e0e7ff' }}>
            Dayflow AI Workforce Intelligence
          </h3>
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            color: '#c7d2fe',
            border: '1px solid rgba(99, 102, 241, 0.4)',
          }}
        >
          AI UI Ready
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sampleInsights.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {item.title}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>
                Confidence: {item.confidence}
              </span>
            </div>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiInsightsCard;
