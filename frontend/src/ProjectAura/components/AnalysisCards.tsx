import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Layout, Compass, PaintBucket, Lightbulb, Sofa, 
  ShoppingBag, IndianRupee, CheckCircle2, ChevronRight, 
  Copy, Check, Sun, Moon, X, Maximize2, Tag, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  colors?: string[]; // Extracted colors for the palette
}

const CATEGORIES = [
  { id: 'design', title: 'Design Analysis', icon: Sparkles, accent: '#B3541E', keywords: ['Design Analysis', 'Concept', 'Aesthetic'] },
  { id: 'vastu', title: 'Vastu Compliance Details', icon: Compass, accent: '#10B981', keywords: ['Vastu', 'Compliance', 'Directions'] },
  { id: 'colors', title: 'Color Palette', icon: PaintBucket, accent: '#8B5CF6', keywords: ['Color Palette', 'Colors', 'Scheme', 'Wall Paint'] },
  { id: 'lighting', title: 'Lighting Suggestions', icon: Lightbulb, accent: '#F59E0B', keywords: ['Lighting', 'Illumination', 'Lamps'] },
  { id: 'cost', title: 'Cost Breakdown', icon: IndianRupee, accent: '#059669', keywords: ['Cost Breakdown', 'Budget', 'Estimation'] },
  { id: 'steps', title: 'Next Steps', icon: CheckCircle2, accent: '#6B7280', keywords: ['Next Steps', 'Action Plan', 'Checklist'] },
];

export default function AnalysisCards({ text }: AnalysisCardsProps) {
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);
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

    // Helper to clean extracted section content
    const cleanContent = (str: string) => {
      // Strips leading commas, colons, dashes, asterisks, hashes, dots or whitespace
      let cleaned = str.replace(/^[\s\n\r,;:.\-*#]+/, '').trim();
      // Capitalize first letter
      if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
      return cleaned;
    };

    // Advanced parsing logic
    const sections: SectionData[] = CATEGORIES.map(cat => {
      let content = '';
      let preview = 'Refining details for your project...';

      // Look for headers: ### Section or **Section** or # Section
      const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      for (const keyword of cat.keywords) {
        // Matches Header followed by any non-header content until the next known category header or end of string
        const allKeywords = CATEGORIES.flatMap(c => c.keywords).map(k => escapeRegExp(k)).join('|');
        const regex = new RegExp(`(?:###|\\*\\*|#)\\s*(${escapeRegExp(keyword)}[\\w\\s\\&]*)(?:###|\\*\\*|#)?([\\s\\S]*?)(?=(?:###|\\*\\*|#)\\s*(?:${allKeywords})|$)`, 'i');
        const match = text.match(regex);
        
        if (match && match[2]) {
          content = cleanContent(match[2]);
          // Extract first meaningful sentence as preview
          const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 5);
          if (sentences[0]) {
             preview = sentences[0].trim().substring(0, 80) + (sentences[0].length > 80 ? '...' : '.');
          }
          break;
        }
      }

      if (!content) {
         content = `Specific recommendations for ${cat.title.toLowerCase()} were not explicitly identified. Focusing on standard ${cat.id} best practices for your room.`;
      }

      return {
        ...cat,
        preview,
        content
      };
    });

    setParsedSections(sections);
  }, [text]);

  let globalVastuScore = 7.5;
  const vastuSection = parsedSections.find(s => s.id === 'vastu');
  if (vastuSection) {
    const scoreMatch = vastuSection.content.match(/vastu score[:\s]+(\d+(?:\.\d+)?)\s*\/\s*10/i);
    if (scoreMatch) globalVastuScore = parseFloat(scoreMatch[1]);
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Vastu Score', value: `${globalVastuScore}/10`, color: 'text-emerald-600 dark:text-[#4CAF7D]', bg: 'bg-emerald-50 dark:bg-[#1A1816]' },
          { label: 'Total Items', value: '12', color: 'text-blue-600 dark:text-[#4A90D9]', bg: 'bg-blue-50 dark:bg-[#1A1816]' },
          { label: 'Est. Savings', value: '₹14,200', color: 'text-[#B3541E]', bg: 'bg-orange-50 dark:bg-[#1A1816]' },
          { label: 'Rooms Covered', value: '1', color: 'text-purple-600 dark:text-[#F5F0E8]', bg: 'bg-purple-50 dark:bg-[#1A1816]' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-white dark:border-[#3A3632] shadow-sm flex flex-col items-center justify-center text-center transition-all hover:scale-105 duration-300`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6B6460] mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Bento Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parsedSections.map((section, idx) => {
          const Icon = section.icon;
          let spanClass = "col-span-1";
          if (idx === 0) spanClass = "md:col-span-2";
          if (idx === 3) spanClass = "lg:col-span-2";
          if (idx === 5) spanClass = "col-span-1 md:col-span-2 lg:col-span-3";

          return (
            <motion.button 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => setSelectedSection(section)}
              className={`bg-white dark:bg-[#242220] rounded-[2.5rem] border border-gray-100 dark:border-[#3A3632] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_12px_rgba(179,84,30,0.15)] text-left flex flex-col p-8 group relative ${spanClass}`}
              style={{ 
                borderTop: `8px solid ${section.accent}`,
              }}
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-10 pointer-events-none" style={{ backgroundColor: section.accent }} />
              
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 duration-500 flex-shrink-0" style={{ backgroundColor: `${section.accent}15` }}>
                  <Icon size={28} style={{ color: section.accent }} />
                </div>
                {section.id === 'vastu' && (
                  <div className="bg-emerald-50 dark:bg-[#4CAF7D]/10 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-[#3A3632]">
                    <span className="text-emerald-600 dark:text-[#4CAF7D] font-black text-xs uppercase tracking-widest">{globalVastuScore}/10</span>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-[#1A1816] p-2 rounded-xl text-gray-300 dark:text-[#3A3632] group-hover:text-gray-900 dark:group-hover:text-[#F5F0E8] transition-colors ml-auto">
                  <Maximize2 size={16} />
                </div>
              </div>
              
              <h3 className="font-black text-gray-900 dark:text-[#F5F0E8] tracking-tight text-xl mb-3">{section.title}</h3>
              <p className="text-sm text-gray-500 dark:text-[#A89F94] leading-relaxed line-clamp-2 flex-1 font-medium">
                {section.preview}
              </p>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-[#1A1816] text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6B6460] group-hover:bg-gray-100 dark:group-hover:bg-[#2E2B28] transition-colors">
                  <Tag size={10} /> {section.id}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-opacity transform group-hover:translate-x-1 duration-300" style={{ color: section.accent }}>
                  Explore <ArrowRight size={14} /> 
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSection && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedSection(null)}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-md"
            />
            
            <motion.div 
              layoutId={`card-${selectedSection.id}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-[#1A1816] rounded-[3rem] w-full max-w-2xl max-h-[85vh] flex flex-col relative shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden z-10" 
              onClick={e => e.stopPropagation()}
              style={{ borderTop: `12px solid ${selectedSection.accent}` }}
            >
               <button 
                 onClick={() => setSelectedSection(null)} 
                 className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-[#2E2B28] hover:bg-gray-200 dark:hover:bg-[#3A3632] rounded-2xl text-gray-900 dark:text-[#F5F0E8] transition-all active:scale-95 shadow-sm"
               >
                 <X size={24} />
               </button>

               <div className="p-8 md:p-10 border-b border-gray-100 dark:border-[#3A3632] flex items-center gap-6 sticky top-0 bg-white/95 dark:bg-[#1A1816]/95 backdrop-blur-xl z-10 shrink-0">
                  <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: `${selectedSection.accent}15` }}>
                    <selectedSection.icon size={32} style={{ color: selectedSection.accent }} />
                  </div>
                  <div className="flex-1 pr-12">
                    <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-[#F5F0E8] leading-tight">{selectedSection.title}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedSection.accent }} />
                      <p className="text-xs text-gray-400 dark:text-[#6B6460] font-bold uppercase tracking-[0.2em]">Expert AI Recommendations</p>
                    </div>
                  </div>
               </div>

               <div className="p-8 md:p-10 overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar scroll-smooth">
                 {renderSectionContent(selectedSection)}
               </div>
               
               <div className="p-8 border-t border-gray-100 dark:border-[#3A3632] bg-gray-50 dark:bg-[#0F0E0D] flex justify-between items-center shrink-0">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-[#6B6460] uppercase tracking-widest">
                    AI Interior Architecture • Ver 2.4
                  </div>
                  <button 
                    onClick={() => setSelectedSection(null)}
                    className="px-8 py-3.5 bg-gray-900 dark:bg-[#B3541E] dark:text-white text-white text-sm font-black rounded-2xl shadow-xl hover:bg-black dark:hover:bg-[#D4621F] transition-all hover:-translate-y-0.5 active:scale-95"
                  >
                    Done Reviewing
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  function parseLineWithFormatting(line: string) {
    // 1. Highlight prices
    let parts: any[] = line.split(/((\$|₹|Rs\.?)\s?\d+(?:,\d+)*(?:\.\d+)?)/gi);
    
    // 2. Identify Colors and wrap in swatches
    // Matches Hex or common color words
    const colorRegex = /(#(?:[0-9a-fA-F]{3}){1,2}\b)|(Navy|White|Grey|Gold|Brown|Beige|Emerald|Teal|Charcoal|Crimson|Indigo|Sage|Terracotta|Ochre|Amber|Stone|Slate|Onyx|Pear|Ivory|Sand)/gi;
    
    return parts.map((part, i) => {
      if (part.match(/(\$|₹|Rs\.?)\s?\d+/i)) {
        return <span key={`price-${i}`} className="mx-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-[#1A1816] text-emerald-700 dark:text-[#4CAF7D] font-black text-[11px] border border-emerald-200 dark:border-[#3A3632] shadow-sm uppercase tracking-wider">{part}</span>;
      }
      
      // Secondary pass for colors
      const colorParts = part.split(colorRegex);
      return colorParts.map((cp, j) => {
        if (!cp) return null;
        if (cp.match(colorRegex)) {
          return (
            <span key={`color-${i}-${j}`} className="inline-flex items-center gap-1.5 mx-1 px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-[#2E2B28] border border-gray-200 dark:border-[#3A3632] text-gray-800 dark:text-[#F5F0E8] font-bold text-[10px] uppercase">
              <span className="w-2.5 h-2.5 rounded-full shadow-sm border border-black/10 dark:border-white/10" style={{ backgroundColor: cp.startsWith('#') ? cp : cp.toLowerCase() }} />
              {cp}
            </span>
          );
        }
        return cp;
      });
    });
  }

  function Formatter({ text, accent, icon: Icon }: { text: string, accent: string, icon?: any }) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    
    return (
      <div className="space-y-4">
        {lines.map((line, i) => {
          const isBullet = line.trim().match(/^[-•*]|^\d+\./);
          const cleanLine = line.replace(/^[-•*]\s*|\d+\.\s*/, '').trim();
          
          if (isBullet) {
            // Split by first colon for Bold Rule: Explanation
            const colonIndex = cleanLine.indexOf(':');
            let ruleName = '';
            let explanation = cleanLine;
            
            if (colonIndex !== -1 && colonIndex < 40) {
              ruleName = cleanLine.substring(0, colonIndex).trim();
              explanation = cleanLine.substring(colonIndex + 1).trim();
            }

            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl bg-white dark:bg-[#1A1816] border border-gray-100 dark:border-[#3A3632] shadow-sm flex items-start gap-4 group hover:border-gray-200 dark:hover:border-[#2E2B28] transition-all duration-300"
              >
                <div className="w-2 h-2 rounded-full mt-2.5 shrink-0" style={{ backgroundColor: accent }} />
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-[#A89F94] leading-relaxed text-[14px]">
                    {ruleName ? (
                      <>
                        <span className="font-black text-gray-900 dark:text-[#F5F0E8] mr-1">{ruleName}:</span>
                        {parseLineWithFormatting(explanation)}
                      </>
                    ) : (
                      parseLineWithFormatting(cleanLine)
                    )}
                  </p>
                </div>
              </motion.div>
            );
          }
          
          return (
            <p key={i} className="text-gray-600 dark:text-[#6B6460] leading-relaxed text-base font-medium mb-4">
              {parseLineWithFormatting(line)}
            </p>
          );
        })}
      </div>
    );
  }

  function renderSectionContent(section: SectionData) {
    switch (section.id) {
      case 'vastu': {
        const vastuScore = globalVastuScore;
        
        // Helper: extract a sub-section between two bold headers
        const extractSub = (label: string, nextLabel?: string): string => {
          const start = section.content.indexOf(`**${label}`);
          if (start === -1) {
            // Check for ### format too
            const hStart = section.content.indexOf(`### ${label}`);
            if (hStart === -1) return '';
            const contentStart = section.content.indexOf('\n', hStart) + 1;
            const hEnd = nextLabel ? (section.content.indexOf(`### ${nextLabel}`, contentStart) !== -1 ? section.content.indexOf(`### ${nextLabel}`, contentStart) : section.content.indexOf(`**${nextLabel}`, contentStart)) : section.content.length;
            return section.content.slice(contentStart, hEnd === -1 ? undefined : hEnd).trim();
          }
          const contentStart = section.content.indexOf('\n', start) + 1;
          const end = nextLabel ? (section.content.indexOf(`**${nextLabel}`, contentStart) !== -1 ? section.content.indexOf(`**${nextLabel}`, contentStart) : section.content.indexOf(`### ${nextLabel}`, contentStart)) : section.content.length;
          return section.content.slice(contentStart, end === -1 ? undefined : end).trim();
        };

        const directionText = extractSub('Direction & Zone Analysis', 'Five Element');
        const elementsText = extractSub('Five Element', 'Ideal Furniture');
        const furnitureText = extractSub('Ideal Furniture Placement', 'Vastu Dos');
        const dosText = extractSub('Vastu Dos', "Vastu Don");
        const dontsText = extractSub("Vastu Don", 'Vastu Corrections');
        const correctionsText = extractSub('Vastu Corrections', 'Vastu Score');

        return (
          <div className="space-y-10 bg-emerald-50/20 dark:bg-emerald-950/10 -m-8 md:-m-10 p-8 md:p-10 rounded-b-[2rem]">
            {/* Score ring */}
            <div className="flex items-center gap-8 p-8 bg-[#10B981] text-white rounded-[2.5rem] shadow-xl shadow-emerald-200 dark:shadow-none">
              <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center bg-white/10 rounded-full backdrop-blur-md border border-white/20">
                <svg className="w-full h-full rotate-[-90deg]">
                  <circle cx="56" cy="56" r="48" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  <circle cx="56" cy="56" r="48" fill="transparent" stroke="white" strokeWidth="10"
                    strokeDasharray={`${(48 * 2 * Math.PI).toFixed(2)}`}
                    strokeDashoffset={`${((48 * 2 * Math.PI) * (1 - vastuScore / 10)).toFixed(2)}`}
                    className="transition-all duration-[1500ms] ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black leading-none">{vastuScore}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">/ 10</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                   <div className="p-1 px-2.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest">Energy Rating</div>
                </div>
                <h4 className="text-2xl font-black tracking-tight mb-2">Vastu Compliance Index</h4>
                <p className="text-sm text-emerald-50 mt-1 leading-relaxed max-w-sm font-medium opacity-90">
                  {section.content.match(/vastu score[:\s]+\d[\d.]*\s*\/\s*10[.\s]*([^*\n]{0,200})/i)?.[1]?.trim() || "This space aligns significantly with primary Vastu directions, optimizing for health and abundance."}
                </p>
              </div>
            </div>

            {/* Direction & Zone */}
            {directionText && (
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[.25em] text-[#10B981] flex items-center gap-3">
                   <Compass size={18} /> Direction & Zone Analysis
                </h4>
                <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1A1816] border border-emerald-100 dark:border-[#3A3632] shadow-sm leading-relaxed text-gray-700 dark:text-[#A89F94] font-medium">
                  <Formatter text={directionText} accent="#10B981" />
                </div>
              </div>
            )}
            
            {/* Five Elements */}
            {elementsText && (
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[.25em] text-[#10B981] flex items-center gap-3">
                   <Layout size={18} /> Elemental Balance
                </h4>
                <div className="p-6 rounded-[2rem] bg-white dark:bg-[#1A1816] border border-emerald-100 dark:border-[#3A3632] shadow-sm leading-relaxed text-gray-700 dark:text-[#A89F94] font-medium">
                  <Formatter text={elementsText} accent="#10B981" />
                </div>
              </div>
            )}

            {/* Dos & Don'ts */}
            {(dosText || dontsText) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dosText && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-[.25em] text-emerald-600">✓ Vastu Dos</h4>
                    <Formatter text={dosText} accent="#10B981" />
                  </div>
                )}
                {dontsText && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-[.25em] text-rose-500">✗ Vastu Avoid</h4>
                    <Formatter text={dontsText} accent="#F43F5E" />
                  </div>
                )}
              </div>
            )}

            {/* Corrections */}
            {correctionsText && (
              <div className="p-8 bg-orange-50 dark:bg-orange-950/20 border-2 border-dashed border-orange-200 dark:border-orange-900 rounded-[2.5rem] space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[.25em] text-orange-600 flex items-center gap-2">
                   <Sparkles size={16} /> Key Remediation Steps
                </h4>
                <Formatter text={correctionsText} accent="#EA580C" />
              </div>
            )}
          </div>
        );
      }

      case 'colors':
        return (
          <div className="py-4 space-y-8">
            <div className="p-6 rounded-[2.5rem] bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100 dark:border-violet-900">
               <h4 className="text-xs font-black uppercase tracking-[.25em] text-violet-600 mb-6 flex items-center gap-2">
                 <PaintBucket size={18} /> Applied Palette
               </h4>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                 {/* Extract colors from content */}
                 {section.content.split('\n').filter(l => l.match(/(#(?:[0-9a-fA-F]{3}){1,2}\b)|(Navy|White|Grey|Gold|Brown|Beige|Emerald|Teal|Charcoal|Crimson|Indigo|Sage|Terracotta|Ochre|Amber|Stone|Slate|Onyx|Pear|Ivory|Sand)/gi)).map((colorLine, i) => {
                   const colorMatch = colorLine.match(/(#(?:[0-9a-fA-F]{3}){1,2}\b)|(Navy|White|Grey|Gold|Brown|Beige|Emerald|Teal|Charcoal|Crimson|Indigo|Sage|Terracotta|Ochre|Amber|Stone|Slate|Onyx|Pear|Ivory|Sand)/gi);
                   const colorName = colorMatch ? colorMatch[0] : 'Charcoal';
                   return (
                     <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.05 }}
                        className="p-4 rounded-3xl bg-white dark:bg-[#1A1816] border border-gray-100 dark:border-[#3A3632] shadow-sm flex flex-col items-center gap-3 text-center"
                      >
                       <div 
                         className="w-16 h-16 rounded-[1.25rem] shadow-inner border-[4px] border-white dark:border-gray-900" 
                         style={{ backgroundColor: colorName.startsWith('#') ? colorName : colorName.toLowerCase() }} 
                       />
                       <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{colorName}</span>
                     </motion.div>
                   );
                 })}
               </div>
            </div>
            <Formatter text={section.content} accent="#8B5CF6" icon={PaintBucket} />
          </div>
        );

      case 'cost':
        const categories = [
          { name: 'Furniture & Custom Decor', pct: 45, amt: '₹42,500', icon: Sofa },
          { name: 'Labor & Civil Works', pct: 25, amt: '₹22,000', icon: Layout },
          { name: 'Electrical & Lighting', pct: 15, amt: '₹14,500', icon: Lightbulb },
          { name: 'Contingency & Fees', pct: 15, amt: '₹12,000', icon: IndianRupee },
        ];
        return (
          <div className="space-y-8 py-4">
            <div className="grid grid-cols-1 gap-6">
              {categories.map((cat, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#1A1816] flex items-center justify-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                        <cat.icon size={18} />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-0.5">{cat.name}</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{cat.amt}</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full uppercase tracking-widest">{cat.pct}%</span>
                  </div>
                  <div className="h-4 w-full bg-gray-50 dark:bg-[#1A1816] rounded-full overflow-hidden shadow-inner border border-gray-100 dark:border-[#3A3632]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{ duration: 1.5, delay: i * 0.2, ease: [0.23, 1, 0.32, 1] }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-emerald-600 dark:to-emerald-400 rounded-full transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 rounded-[2rem] bg-gray-50 dark:bg-[#1A1816]/50 border border-dashed border-gray-200 dark:border-[#3A3632] mt-8">
              <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
                <CheckCircle2 size={12} /> Optimization Recommendation
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                Save approximately 12% by sourcing raw wood locally for the custom cabinetry identified in our design analysis.
              </p>
            </div>
          </div>
        );

      case 'lighting':
        return (
          <div className="py-4 space-y-8">
            <div className="flex gap-4 p-2 bg-gray-100 dark:bg-[#242220] rounded-[2rem] w-full max-w-sm shadow-inner">
              <button 
                onClick={() => setLightingTab('day')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${lightingTab === 'day' ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-[0_8px_20px_-4px_rgba(249,115,22,0.2)]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
              >
                <Sun size={18} /> Day Mode
              </button>
              <button 
                onClick={() => setLightingTab('night')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${lightingTab === 'night' ? 'bg-white dark:bg-gray-700 text-blue-500 shadow-[0_8px_20px_-4px_rgba(59,130,246,0.2)]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
              >
                <Moon size={18} /> Night Mode
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={lightingTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`p-10 rounded-[3rem] border shadow-xl ${lightingTab === 'day' ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100' : 'bg-gradient-to-br from-blue-900 via-[#0A0A1F] to-[#0A0A0B] border-blue-900/50 text-blue-100'}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${lightingTab === 'day' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-400'}`}>
                    {lightingTab === 'day' ? <Sun size={32} /> : <Moon size={32} />}
                  </div>
                  <div>
                    <h5 className="text-xl font-black tracking-tight">{lightingTab === 'day' ? 'Natural Luminescence' : 'Serene After-Hours'}</h5>
                    <p className={`text-[10px] font-bold uppercase tracking-widest opacity-60`}>{lightingTab === 'day' ? '4500K - 5500K Temperature' : '2200K - 2700K Warmth'}</p>
                  </div>
                </div>
                
                <p className={`text-base leading-extra-relaxed font-semibold ${lightingTab === 'day' ? 'text-gray-700' : 'text-blue-100/90'}`}>
                  {lightingTab === 'day' 
                    ? "Maximize the morning Eastern sun by using sheer drapes. We recommend supplemental 4000K LED spots in the North-East zone to maintain focus during peak hours." 
                    : "Embrace deep architectural shadows. Use low-level cove lighting in the South-West to stimulate melatonin production. Avoid overhead blue-light sources after 8:00 PM."
                  }
                </p>
                
                <div className={`mt-8 pt-8 border-t ${lightingTab === 'day' ? 'border-orange-200/50' : 'border-blue-800/50'}`}>
                   <h6 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">Detailed Specification</h6>
                   <Formatter text={section.content} accent={lightingTab === 'day' ? '#F97316' : '#3B82F6'} icon={Lightbulb} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        );

      case 'steps': {
        const steps = section.content.split('\n').filter(l => l.trim().match(/^[-•*]|^\d+\./)).map(s => s.replace(/^[-•*]\s*|\d+\.\s*/, '').trim());
        const displaySteps = steps.length > 0 ? steps : [
          "Confirm layout structure with local contractor",
          "Order selected primary furniture items",
          "Schedule wall painting sessions (Vastu palette)",
          "Install smart lighting control system",
          "Final Vastu orientation walkthrough"
        ];
        
        return (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Implementation Checklist</span>
               <span className="bg-gray-100 dark:bg-[#1A1816] text-gray-600 dark:text-[#A89F94] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{displaySteps.filter(s => !!checklist[s]).length} / {displaySteps.length} DONE</span>
            </div>
            {displaySteps.map((step, i) => (
              <motion.label 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-white dark:bg-[#1A1816] border border-gray-100 dark:border-[#3A3632] cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#2E2B28] hover:-translate-y-1 hover:shadow-xl group"
              >
                 <input 
                  type="checkbox" 
                  checked={!!checklist[step]} 
                  onChange={() => toggleCheck(step)}
                  className="hidden"
                />
                <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${checklist[step] ? 'bg-black dark:bg-white border-black dark:border-white shadow-lg shadow-black/20' : 'border-gray-200 dark:border-gray-600 group-hover:border-black dark:group-hover:border-white'}`}>
                  {checklist[step] && <Check size={20} className="text-white dark:text-black" />}
                </div>
                <span className={`text-base font-bold transition-all duration-300 ${checklist[step] ? 'text-gray-300 dark:text-gray-600 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                  {step}
                </span>
                <ArrowRight size={18} className={`ml-auto transition-all ${checklist[step] ? 'opacity-0' : 'opacity-20 group-hover:opacity-100 text-gray-400 group-hover:translate-x-1'}`} />
              </motion.label>
            ))}
          </div>
        );
      }

      default:
        return (
          <div className="py-4">
            <Formatter text={section.content} accent={section.accent} icon={section.icon} />
          </div>
        );
    }
  }
}
