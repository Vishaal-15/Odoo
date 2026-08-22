import React from 'react';
import { Sparkles, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card';

export const AiInsightsCard = () => {
  const sampleInsights = [
    {
      title: 'Optimal Shift & Schedule Coverage',
      desc: 'Engineering sprint coverage is projected at 94% next week. No critical staffing bottlenecks detected.',
      confidence: '98%',
      type: 'success',
    },
    {
      title: 'Seasonal Leave Pattern Forecast',
      desc: '3 team members requested time off near upcoming holiday window. Automated coverage checks suggest early approval.',
      confidence: '92%',
      type: 'info',
    },
  ];

  return (
    <Card
      className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-brand-950/40 border-brand-500/25 shadow-glow-brand"
      title="Workforce Intelligence"
      subtitle="AI-driven operational alerts & patterns"
      headerIcon={Sparkles}
      action={
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
          AI Active
        </span>
      }
    >
      <div className="space-y-3">
        {sampleInsights.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {item.title}
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                {item.confidence} match
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-5">{item.desc}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AiInsightsCard;
