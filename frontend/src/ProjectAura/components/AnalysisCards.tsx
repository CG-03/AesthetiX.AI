import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Layout, Compass, PaintBucket, Lightbulb, Sofa, 
  ShoppingBag, IndianRupee, CheckCircle2, ChevronRight, 
  Copy, Check, Sun, Moon 
} from 'lucide-react';

interface AnalysisCardsProps {
  text: string;
}

interface SectionData {
  title: string;
  count?: number;
  preview: string;
  content: string;
  icon: any;
  accent: string;
  id: string;
}

const CATEGORIES = [
  { id: 'design', title: 'Design Analysis', icon: Sparkles, accent: '#B3541E', keywords: ['Design Analysis', 'Concept', 'Aesthetic'] },
  { id: 'vastu', title: 'Vastu Compliance Details', icon: Compass, accent: '#10B981', keywords: ['Vastu', 'Compliance', 'Directions'] },
  { id: 'lighting', title: 'Lighting Suggestions', icon: Lightbulb, accent: '#F59E0B', keywords: ['Lighting', 'Illumination', 'Lamps'] },
  { id: 'cost', title: 'Cost Breakdown', icon: IndianRupee, accent: '#059669', keywords: ['Cost Breakdown', 'Budget', 'Estimation'] },
  { id: 'steps', title: 'Next Steps', icon: CheckCircle2, accent: '#6B7280', keywords: ['Next Steps', 'Action Plan', 'Checklist'] },
];

export default function AnalysisCards({ text }: AnalysisCardsProps) {
  const [expandedId, setExpandedId] = useState<string | null>('design');
  const [parsedSections, setParsedSections] = useState<SectionData[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [lightingTab, setLightingTab] = useState<'day' | 'night'>('day');

  // Load checklist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vastu_analysis_checklist');
    if (saved) setChecklist(JSON.parse(saved));
  }, []);

  const toggleCheck = (item: string) => {
    const newChecklist = { ...checklist, [item]: !checklist[item] };
    setChecklist(newChecklist);
    localStorage.setItem('vastu_analysis_checklist', JSON.stringify(newChecklist));
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  useEffect(() => {
    if (!text) return;

    // Advanced parsing logic
    const sections: SectionData[] = CATEGORIES.map(cat => {
      let content = '';
      let preview = 'Refining details for your project...';

      // Look for headers: ### Section or **Section**
      const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      for (const keyword of cat.keywords) {
        const regex = new RegExp(`(?:###|\\*\\*|#)\\s*(${escapeRegExp(keyword)}[\\w\\s\\&]*)(?:###|\\*\\*|#)?([\\s\\S]*?)(?=(?:###|\\*\\*|#)\\s*(?:${CATEGORIES.map(c => c.keywords.map(k => escapeRegExp(k)).join('|')).join('|')})|$)`, 'i');
        const match = text.match(regex);
        
        if (match && match[2]) {
          content = match[2].trim();
          // Extract first sentence as preview
          const sentences = content.split(/[.!?]/);
          if (sentences[0]) preview = sentences[0].substring(0, 80) + '...';
          break;
        }
      }

      if (!content) {
         content = `Specific recommendations for ${cat.title.toLowerCase()} were not explicitly identified in this generation. Our AI designer suggests focusing on standard ${cat.id} best practices for a ${cat.accent === '#B3541E' ? 'Vastu-compliant' : 'modern'} home.`;
      }

      return {
        ...cat,
        preview,
        content
      };
    });

    setParsedSections(sections);
  }, [text]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Vastu Score', value: '8.5/10', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Items', value: '12', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Est. Savings', value: '₹14,200', color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Rooms Covered', value: '1', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-white shadow-sm flex flex-col items-center justify-center text-center transition-all hover:scale-105 duration-300`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Accordion Cards */}
      <div className="space-y-4">
        {parsedSections.map((section, idx) => {
          const Icon = section.icon;
          const isExpanded = expandedId === section.id;

          return (
            <div 
              key={section.id}
              className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'ring-2 ring-offset-2' : ''}`}
              style={{ 
                borderLeft: `6px solid ${section.accent}`,
                animationDelay: `${idx * 150}ms`,
                // @ts-ignore
                '--ring-color': section.accent 
              }}
            >
              <button 
                onClick={() => setExpandedId(isExpanded ? null : section.id)}
                className="w-full p-6 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300" style={{ backgroundColor: `${section.accent}15` }}>
                    <Icon size={24} style={{ color: section.accent }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 tracking-tight">{section.title}</h3>
                    <p className={`text-xs text-gray-400 transition-opacity duration-300 ${isExpanded ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 mt-1'}`}>
                      {section.preview}
                    </p>
                  </div>
                </div>
                <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-90' : ''}`} style={{ color: section.accent }}>
                  <ChevronRight size={20} />
                </div>
              </button>

              <div className={`transition-all duration-700 ease-in-out px-6 ${isExpanded ? 'max-h-[800px] pb-8 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <div className="pt-2 border-t border-gray-50 mt-2">
                   {renderSectionContent(section)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  function renderSectionContent(section: SectionData) {
    switch (section.id) {
      case 'vastu': {
        // Extract Vastu Score from content
        const scoreMatch = section.content.match(/vastu score[:\s]+(\d+(?:\.\d+)?)\s*\/\s*10/i);
        const vastuScore = scoreMatch ? parseFloat(scoreMatch[1]) : 7.5;
        const scorePct = (vastuScore / 10) * 100;
        const circumference = 364.42;
        const offset = circumference - (scorePct / 100) * circumference;

        // Helper: extract a sub-section between two bold headers
        const extractSub = (label: string, nextLabel?: string): string => {
          const start = section.content.indexOf(`**${label}`);
          if (start === -1) return '';
          const contentStart = section.content.indexOf('\n', start) + 1;
          const end = nextLabel ? section.content.indexOf(`**${nextLabel}`, contentStart) : section.content.length;
          return section.content.slice(contentStart, end === -1 ? undefined : end).trim();
        };

        const directionText = extractSub('Direction & Zone Analysis', 'Five Element');
        const elementsText = extractSub('Five Element', 'Ideal Furniture');
        const furnitureText = extractSub('Ideal Furniture Placement', 'Vastu Dos');
        const dosText = extractSub('Vastu Dos', "Vastu Don");
        const dontsText = extractSub("Vastu Don", 'Vastu Corrections');
        const correctionsText = extractSub('Vastu Corrections', 'Vastu Score');

        // Parse bullet lists
        const parseBullets = (text: string) => text.split('\n').filter(l => l.trim().match(/^[-•*]|^\d+\./));
        const dosList = parseBullets(dosText);
        const dontsList = parseBullets(dontsText);
        const correctionsList = parseBullets(correctionsText);

        return (
          <div className="py-4 space-y-6">
            {/* Score ring */}
            <div className="flex items-center gap-6 p-4 bg-emerald-50 rounded-2xl">
              <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full rotate-[-90deg]">
                  <circle cx="48" cy="48" r="42" fill="transparent" stroke="#D1FAE5" strokeWidth="7" />
                  <circle cx="48" cy="48" r="42" fill="transparent" stroke="#10B981" strokeWidth="7"
                    strokeDasharray={`${(42 * 2 * Math.PI).toFixed(2)}`}
                    strokeDashoffset={`${((42 * 2 * Math.PI) * (1 - vastuScore / 10)).toFixed(2)}`}
                    className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-gray-900 leading-none">{vastuScore}</span>
                  <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">/10</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-emerald-800 text-sm">Vastu Compliance Score</p>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed max-w-xs">
                  {section.content.match(/vastu score[:\s]+\d[\d.]*\s*\/\s*10[.\s]*([^*\n]{0,200})/i)?.[1]?.trim() || "Vastu energy assessment for this space."}
                </p>
              </div>
            </div>

            {/* Direction & Zone */}
            {directionText && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#10B981] flex items-center gap-2">
                  <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-[10px]">N</span>
                  Direction & Zone Analysis
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">{directionText}</p>
              </div>
            )}

            {/* Five Elements */}
            {elementsText && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#10B981]">⬡ Five Element Placement (Pancha Bhuta)</h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{elementsText}</p>
              </div>
            )}

            {/* Furniture Placement */}
            {furnitureText && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#10B981]">🛋 Ideal Furniture Placement</h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{furnitureText}</p>
              </div>
            )}

            {/* Dos & Don'ts */}
            {(dosList.length > 0 || dontsList.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dosList.length > 0 && (
                  <div className="bg-emerald-50 p-4 rounded-2xl space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700">✓ Vastu Dos</h4>
                    <ul className="space-y-1.5">
                      {dosList.map((item, i) => (
                        <li key={i} className="flex gap-2 text-xs text-emerald-800">
                          <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                          <span>{item.replace(/^[-•*]\s*|\d+\.\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {dontsList.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-2xl space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-700">✗ Vastu Don'ts</h4>
                    <ul className="space-y-1.5">
                      {dontsList.map((item, i) => (
                        <li key={i} className="flex gap-2 text-xs text-red-800">
                          <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                          <span>{item.replace(/^[-•*]\s*|\d+\.\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Corrections */}
            {correctionsList.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-2xl space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-700">⚠ Vastu Corrections Needed</h4>
                <ul className="space-y-2">
                  {correctionsList.map((item, i) => (
                    <li key={i} className="flex gap-2 text-xs text-amber-900">
                      <span className="w-5 h-5 bg-amber-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-amber-700">{i + 1}</span>
                      <span className="leading-relaxed">{item.replace(/^[-•*]\s*|\d+\.\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fallback: show raw text if no sub-sections parsed */}
            {!directionText && !dosList.length && (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{section.content}</p>
            )}
          </div>
        );
      }

      case 'cost':
        const categories = [
          { name: 'Furniture & Decor', pct: 40, amt: '₹22,400' },
          { name: 'Civil & Paint', pct: 25, amt: '₹14,000' },
          { name: 'Electrical/Lighting', pct: 20, amt: '₹11,200' },
          { name: 'Designer Fees', pct: 15, amt: '₹8,400' },
        ];
        return (
          <div className="space-y-6 py-4">
            {categories.map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  <span>{cat.name}</span>
                  <span>{cat.amt} ({cat.pct}%)</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: expandedId === 'cost' ? `${cat.pct}%` : '0%', transitionDelay: `${i * 200}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'lighting':
        return (
          <div className="py-4">
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
              <button 
                onClick={() => setLightingTab('day')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${lightingTab === 'day' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'}`}
              >
                <Sun size={14} /> Day Configuration
              </button>
              <button 
                onClick={() => setLightingTab('night')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${lightingTab === 'night' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-400'}`}
              >
                <Moon size={14} /> Night Ambience
              </button>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-500">
              {lightingTab === 'day' 
                ? "Prioritize maximum natural light from North/East windows. Use sheer linen curtains to soften shadows. Supplement with high-CRI 4000K daylight LEDs in recessed ceiling mounts for task areas." 
                : "Switch to 2700K warm ambient lighting. Create focal pools of light using floor lamps and picture lights. Ensure the South-West quadrant has the softest, dimmest lighting for relaxation."
              }
              <div className="mt-4 pt-4 border-t border-gray-50 text-[11px] italic font-medium opacity-70">
                {section.content.substring(0, 150)}...
              </div>
            </div>
          </div>
        );

      case 'steps':
        const steps = [
          "Confirm layout structure with local contractor",
          "Order selected primary furniture items",
          "Schedule wall painting sessions (Vastu palette)",
          "Install smart lighting control system",
          "Final Vastu orientation walkthrough"
        ];
        return (
          <div className="space-y-3 py-4">
            {steps.map((step, i) => (
              <label key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer transition-colors hover:bg-white group">
                 <input 
                  type="checkbox" 
                  checked={!!checklist[step]} 
                  onChange={() => toggleCheck(step)}
                  className="hidden"
                />
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checklist[step] ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 group-hover:border-emerald-300'}`}>
                  {checklist[step] && <Check size={14} className="text-white" />}
                </div>
                <span className={`text-[13px] font-semibold transition-all ${checklist[step] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {step}
                </span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap py-4">
            {section.content}
          </div>
        );
    }
  }
}
