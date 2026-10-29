import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface StyleItem {
  name: string;
  count: number;
  sampleKeywords: string[];
  description?: string;
}

interface StylesViewProps {
  onSelectStyle: (styleName: string) => void;
}

export const StylesView: React.FC<StylesViewProps> = ({ onSelectStyle }) => {
  const [styles, setStyles] = useState<StyleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStyles() {
      try {
        const data = await api.getStyles();
        setStyles(data);
      } catch (err) {
        console.error('Failed to load design styles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStyles();
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F4E7CF]">
      {/* Header */}
      <div className="px-6 lg:px-10 pt-8 pb-6 border-b-2 border-[#29231C] bg-[#FFF0D7]">
        <div className="flex items-center gap-3.5">
          <h1 className="text-3xl lg:text-4xl font-heading font-black tracking-tight text-[#171511]">
            Design Styles
          </h1>
          <span className="font-pixel text-[10px] font-bold uppercase tracking-wider text-[#171511] px-3 py-1 bg-[#FFE344] border-2 border-[#29231C] shadow-xs">
            {styles.length} {styles.length === 1 ? 'STYLE' : 'STYLES'}
          </span>
        </div>
        <p className="text-base text-[#756858] font-medium mt-2">
          Design styles, visual vocabularies, and aesthetic trends detected in your library.
        </p>
      </div>

      {/* Grid */}
      <div className="p-6 lg:p-10 flex-1">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#171511]" />
          </div>
        ) : styles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {styles.map((style) => (
              <div
                key={style.name}
                onClick={() => onSelectStyle(style.name)}
                className="group p-6 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro hover:shadow-retro-md hover:-translate-y-0.5 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-heading font-black uppercase tracking-wider bg-[#FFE344] border-2 border-[#29231C] shadow-xs text-[#171511]">
                      <Sparkles className="w-4 h-4 stroke-[2.5]" />
                      {style.name}
                    </span>

                    <span className="text-xs font-mono font-bold text-[#171511]">
                      {style.count} {style.count === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {style.description && (
                    <p className="text-sm text-[#756858] line-clamp-2 leading-relaxed mt-2 font-medium">
                      {style.description}
                    </p>
                  )}

                  {/* Vocabulary keywords */}
                  {style.sampleKeywords && style.sampleKeywords.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {style.sampleKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-medium px-2.5 py-1 bg-[#F4E7CF] text-[#171511] border border-[#29231C]"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t-2 border-[#29231C]/15 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#171511] group-hover:text-[#FF682D] transition-colors">
                  <span>View references</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto my-16 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro-md">
            <div className="w-16 h-16 bg-[#FFE344] border-2 border-[#29231C] shadow-retro flex items-center justify-center text-[#171511] mb-5">
              <Sparkles className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h3 className="text-2xl font-heading font-black text-[#171511]">No styles categorized yet</h3>
            <p className="text-base text-[#756858] mt-2.5 leading-relaxed font-medium">
              Analyze saved designs with Gemini to automatically extract aesthetic movements and keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
