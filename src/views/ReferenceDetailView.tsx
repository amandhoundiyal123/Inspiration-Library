import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  Edit2, 
  Trash2, 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  X, 
  Maximize2,
  Calendar,
  Layers,
  Palette,
  Type as TypeIcon,
  LayoutGrid,
  FileText,
  Terminal,
  Send
} from 'lucide-react';
import type { DesignReference, Collection } from '../types';
import { api } from '../services/api';
import { EditReferenceModal } from '../components/EditReferenceModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface ReferenceDetailViewProps {
  referenceId: string;
  onBack: () => void;
  collections: Collection[];
  onReferenceDeleted: (id: string) => void;
  onToggleFavoriteGlobal: (id: string) => void;
}

export const ReferenceDetailView: React.FC<ReferenceDetailViewProps> = ({
  referenceId,
  onBack,
  collections,
  onReferenceDeleted,
  onToggleFavoriteGlobal
}) => {
  const [reference, setReference] = useState<DesignReference | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Target project prompt adaptation
  const [targetProject, setTargetProject] = useState('');
  const [adaptingPrompt, setAdaptingPrompt] = useState(false);
  const [adaptedPrompt, setAdaptedPrompt] = useState<string | null>(null);

  // Copy feedbacks
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Editable fields for AI analysis
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [customBrief, setCustomBrief] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Image full view
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  // Trash confirm modal & error state
  const [showTrashConfirm, setShowTrashConfirm] = useState(false);
  const [adaptError, setAdaptError] = useState<string | null>(null);

  // Load reference
  React.useEffect(() => {
    let mounted = true;
    async function loadRef() {
      setLoading(true);
      try {
        const data = await api.getReferenceById(referenceId);
        if (mounted) {
          setReference(data);
          if (data.analysis) {
            setCustomBrief(data.analysis.creativeBrief);
            setCustomPrompt(data.analysis.reusablePrompt);
          }
        }
      } catch (err) {
        console.error('Failed to load reference:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadRef();
    return () => { mounted = false; };
  }, [referenceId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#F4E7CF]">
        <Loader2 className="w-10 h-10 animate-spin text-[#171511] mb-3" />
        <p className="text-sm font-bold text-[#756858]">Loading inspiration details...</p>
      </div>
    );
  }

  if (!reference) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#F4E7CF] text-center">
        <p className="text-base font-bold text-[#171511]">Reference could not be found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro text-sm font-bold text-[#171511] hover:bg-[#FFE344]"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const handleToggleFav = async () => {
    try {
      const res = await api.toggleFavorite(reference.id);
      setReference({ ...reference, isFavorite: res.isFavorite });
      onToggleFavoriteGlobal(reference.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrash = () => {
    setShowTrashConfirm(true);
  };

  const handleConfirmTrash = async () => {
    try {
      await api.moveToTrash(reference.id);
      onReferenceDeleted(reference.id);
      onBack();
    } catch (err) {
      console.error(err);
    } finally {
      setShowTrashConfirm(false);
    }
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const analysis = await api.analyzeReference(reference.id);
      setReference({ ...reference, analysis });
      setCustomBrief(analysis.creativeBrief);
      setCustomPrompt(analysis.reusablePrompt);
    } catch (err: any) {
      setAnalysisError(err.message || 'AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveBriefEdit = async () => {
    if (!reference.analysis) return;
    try {
      const updated = await api.updateAnalysis(reference.id, { creativeBrief: customBrief });
      setReference({ ...reference, analysis: updated });
      setIsEditingBrief(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePromptEdit = async () => {
    if (!reference.analysis) return;
    try {
      const updated = await api.updateAnalysis(reference.id, { reusablePrompt: customPrompt });
      setReference({ ...reference, analysis: updated });
      setIsEditingPrompt(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdaptPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProject.trim()) return;
    setAdaptingPrompt(true);
    setAdaptError(null);
    try {
      const res = await api.adaptPrompt(reference.id, targetProject.trim());
      setAdaptedPrompt(res.adaptedPrompt);
    } catch (err: any) {
      setAdaptError(err.message || 'Failed to adapt prompt');
    } finally {
      setAdaptingPrompt(false);
    }
  };

  const copyToClipboard = (text: string, type: 'brief' | 'prompt' | 'hex') => {
    navigator.clipboard.writeText(text);
    if (type === 'brief') {
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2000);
    } else if (type === 'prompt') {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else if (type === 'hex') {
      setCopiedHex(text);
      setTimeout(() => setCopiedHex(null), 1500);
    }
  };

  const analysis = reference.analysis;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F4E7CF]">
      {/* Top Header Navigation */}
      <div className="border-b-2 border-[#29231C] bg-[#FFF0D7] px-6 lg:px-10 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="h-10 px-3 bg-[#F4E7CF] hover:bg-[#FFE344] text-[#171511] border-2 border-[#29231C] shadow-retro flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors"
            aria-label="Back to library"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Library</span>
          </button>
          <div className="h-6 w-0.5 bg-[#29231C]/30" />
          <h1 className="text-base sm:text-lg font-heading font-bold text-[#171511] truncate max-w-sm sm:max-w-md">
            {reference.title}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleFav}
            className={`h-10 w-10 flex items-center justify-center border-2 border-[#29231C] shadow-retro transition-colors ${
              reference.isFavorite
                ? 'bg-[#FFE344] text-[#171511]'
                : 'bg-[#FFF0D7] text-[#756858] hover:text-[#171511] hover:bg-[#FFE344]'
            }`}
            title={reference.isFavorite ? 'Starred' : 'Star'}
            aria-label={reference.isFavorite ? 'Starred' : 'Star'}
          >
            <Star className={`w-4 h-4 stroke-[2.5] ${reference.isFavorite ? 'fill-[#171511]' : ''}`} />
          </button>

          <button
            onClick={() => setIsEditOpen(true)}
            className="h-10 px-4 flex items-center gap-2 bg-[#FFF0D7] hover:bg-[#FFE344] text-[#171511] border-2 border-[#29231C] shadow-retro text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Edit Details</span>
          </button>

          <button
            onClick={handleTrash}
            className="h-10 w-10 flex items-center justify-center text-[#FF682D] hover:bg-[#FFE344] border-2 border-[#29231C] shadow-retro transition-colors"
            title="Move to trash"
            aria-label="Move to trash"
          >
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10">
        {/* Top Split: Image Display + Reference Meta */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Visual Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative group bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro-md overflow-hidden flex items-center justify-center min-h-[360px] p-4">
              {reference.imageUrl ? (
                <>
                  <img
                    src={reference.imageUrl}
                    alt={reference.title}
                    className="w-full h-auto max-h-[640px] object-contain border-2 border-[#29231C]"
                  />
                  <button
                    onClick={() => setIsImageFullscreen(true)}
                    className="absolute bottom-6 right-6 h-10 w-10 flex items-center justify-center bg-[#FFE344] text-[#171511] border-2 border-[#29231C] shadow-retro opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Fullscreen view"
                  >
                    <Maximize2 className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </>
              ) : (
                <div className="p-12 text-center text-[#756858]">
                  <p className="text-sm font-bold text-[#171511]">No image preview uploaded</p>
                  {reference.sourceUrl && (
                    <a
                      href={reference.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#FFE344] text-[#171511] border-2 border-[#29231C] shadow-retro text-xs font-bold uppercase tracking-wider"
                    >
                      <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                      Visit {reference.sourceDomain || 'Source Website'}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Quick Meta under image */}
            <div className="flex items-center justify-between text-xs text-[#756858] font-bold px-1 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#171511] stroke-[2.5]" />
                Saved {new Date(reference.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {reference.originalFilename && (
                <span className="truncate max-w-[240px] text-[#171511] font-mono">{reference.originalFilename}</span>
              )}
            </div>
          </div>

          {/* Reference Information Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-6 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#756858] block mb-1">
                Reference Info
              </span>
              <h2 className="text-2xl font-heading font-black text-[#171511] leading-tight">
                {reference.title}
              </h2>
            </div>

            {/* Source Website */}
            {reference.sourceUrl && (
              <div className="space-y-1.5">
                <span className="text-xs text-[#756858] font-bold uppercase tracking-wider block">
                  Source Website
                </span>
                <a
                  href={reference.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-[#171511] hover:text-[#FF682D] bg-[#F4E7CF] border-2 border-[#29231C] px-3.5 py-2.5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 shrink-0 text-[#171511] stroke-[2.5]" />
                  <span className="truncate">{reference.sourceUrl}</span>
                </a>
              </div>
            )}

            {/* Personal Notes */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#756858] font-bold uppercase tracking-wider block">
                Personal Notes
              </span>
              {reference.personalNotes ? (
                <div className="text-sm text-[#171511] bg-[#F4E7CF] p-4 border-2 border-[#29231C] leading-relaxed whitespace-pre-wrap font-medium">
                  {reference.personalNotes}
                </div>
              ) : (
                <p className="text-sm text-[#756858] italic font-medium">No personal notes recorded.</p>
              )}
            </div>

            {/* Collections */}
            <div className="space-y-2">
              <span className="text-xs text-[#756858] font-bold uppercase tracking-wider block">
                Collections
              </span>
              <div className="flex flex-wrap gap-2">
                {reference.collections && reference.collections.length > 0 ? (
                  reference.collections.map((c) => (
                    <span
                      key={c.id}
                      className="px-3 py-1.5 text-xs font-bold uppercase bg-[#FFE344] border-2 border-[#29231C] shadow-xs text-[#171511]"
                    >
                      {c.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#756858] italic">Unassigned to collections.</span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <span className="text-xs text-[#756858] font-bold uppercase tracking-wider block">
                Tags & Vocabulary
              </span>
              <div className="flex flex-wrap gap-2">
                {reference.tags && reference.tags.length > 0 ? (
                  reference.tags.map((t) => (
                    <span
                      key={t.id}
                      className="px-3 py-1 text-xs font-semibold bg-[#F4E7CF] border-2 border-[#29231C] text-[#171511]"
                    >
                      #{t.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#756858] italic">No tags added yet.</span>
                )}
              </div>
            </div>

            {/* AI Analysis Trigger if not analyzed */}
            {!analysis && (
              <div className="pt-4 border-t-2 border-[#29231C] space-y-3">
                <div className="text-xs text-[#756858] font-medium leading-relaxed">
                  Analyze this design with Gemini to generate design keywords, harmonic colors, a creative brief, and reusable code prompts.
                </div>
                <button
                  onClick={handleRunAnalysis}
                  disabled={analyzing}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-[#FF682D] hover:bg-[#ff7a45] text-white disabled:opacity-50 text-xs font-bold uppercase tracking-wider border-2 border-[#29231C] shadow-retro transition-colors cursor-pointer"
                >
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 stroke-[2.5]" />}
                  <span>{analyzing ? 'Deconstructing Design DNA...' : 'Analyze Design with Gemini'}</span>
                </button>
                {analysisError && (
                  <p className="text-xs text-[#171511] font-bold bg-[#FFE344] p-3 border-2 border-[#29231C]">
                    {analysisError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION B: DESIGN DNA (If Analyzed) */}
        {analysis && (
          <section className="space-y-8 pt-6 border-t-2 border-[#29231C]">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-[#FFE344] text-[#171511] border-2 border-[#29231C] shadow-retro">
                    <Sparkles className="w-5 h-5 stroke-[2.5]" />
                  </span>
                  <h2 className="text-2xl font-heading font-black tracking-tight text-[#171511]">Design DNA Breakdown</h2>
                </div>
                <p className="text-sm text-[#756858] mt-1 font-medium">
                  Style classification, color palette, typography hierarchy, and creative direction.
                </p>
              </div>

              {/* Re-analyze Button */}
              <button
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="h-10 px-4 flex items-center gap-2 bg-[#FFF0D7] hover:bg-[#FFE344] text-[#171511] border-2 border-[#29231C] shadow-retro text-xs font-bold uppercase tracking-wider transition-colors"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 stroke-[2.5]" />}
                <span>{analyzing ? 'Re-analyzing...' : 'Re-run Analysis'}</span>
              </button>
            </div>

            {/* Primary Style Banner */}
            <div className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-6 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-mono text-[#756858] uppercase font-bold tracking-wider">
                  Primary Style:
                </span>
                <span className="text-sm font-heading font-black text-[#171511] px-3.5 py-1 bg-[#FFE344] border-2 border-[#29231C] shadow-xs uppercase">
                  {analysis.primaryStyle}
                </span>

                {analysis.secondaryStyles && analysis.secondaryStyles.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#756858] font-bold">/ Influences:</span>
                    {analysis.secondaryStyles.map((s, idx) => (
                      <span key={idx} className="text-xs text-[#171511] font-bold bg-[#F4E7CF] px-2.5 py-0.5 border border-[#29231C]">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-sm text-[#171511] leading-relaxed font-medium">
                {analysis.summary}
              </p>

              {analysis.visualMood && (
                <div className="pt-3 flex items-center gap-2 text-xs border-t-2 border-[#29231C]/15">
                  <span className="text-[#756858] font-bold uppercase tracking-wider">Mood & Tone:</span>
                  <span className="text-[#171511] font-bold">{analysis.visualMood}</span>
                </div>
              )}
            </div>

            {/* Extracted Color Palette */}
            {analysis.colorPalette && analysis.colorPalette.length > 0 && (
              <div className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Palette className="w-5 h-5 text-[#171511] stroke-[2.5]" />
                    <h3 className="text-lg font-heading font-bold text-[#171511]">Extracted Color Palette</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#756858]">Click to copy HEX</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {analysis.colorPalette.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => copyToClipboard(c.hex, 'hex')}
                      className="group/color flex flex-col items-start p-2.5 bg-[#F4E7CF] border-2 border-[#29231C] shadow-xs hover:bg-[#FFE344] transition-colors text-left cursor-pointer"
                    >
                      <div
                        className="w-full h-14 border-2 border-[#29231C] mb-2 flex items-end justify-end p-1 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      >
                        {copiedHex === c.hex && (
                          <span className="text-[10px] bg-[#171511] text-[#FFF0D7] px-1.5 py-0.5 font-bold uppercase">
                            Copied!
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-[#171511]">
                        {c.hex}
                      </span>
                      <span className="text-xs text-[#171511] truncate w-full mt-0.5 font-bold">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-[#756858] truncate w-full font-medium">
                        {c.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3-Column Breakdown: Typography, Layout & Composition, Visual Motifs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Typography */}
              <div className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-5 space-y-3">
                <div className="flex items-center gap-2 text-base font-heading font-bold text-[#171511]">
                  <TypeIcon className="w-5 h-5 stroke-[2.5]" />
                  <span>Typography</span>
                </div>
                <div className="space-y-3 text-xs font-medium">
                  <div>
                    <span className="text-[10px] font-mono text-[#756858] uppercase font-bold block">Classification</span>
                    <p className="text-[#171511] font-bold mt-0.5">{analysis.typography.classification}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#766457] uppercase font-bold block">Characteristics</span>
                    <p className="text-[#171511] leading-relaxed mt-0.5">{analysis.typography.characteristics}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#766457] uppercase font-bold block">Hierarchy</span>
                    <p className="text-[#171511] leading-relaxed mt-0.5">{analysis.typography.hierarchyNotes}</p>
                  </div>
                </div>
              </div>

              {/* Layout & Composition */}
              <div className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-5 space-y-3">
                <div className="flex items-center gap-2 text-base font-heading font-bold text-[#171511]">
                  <LayoutGrid className="w-5 h-5 stroke-[2.5]" />
                  <span>Layout & Composition</span>
                </div>
                <div className="space-y-3 text-xs font-medium">
                  <div>
                    <span className="text-[10px] font-mono text-[#756858] uppercase font-bold block">Grid Structure</span>
                    <p className="text-[#171511] font-bold mt-0.5">{analysis.layout.gridType}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#756858] uppercase font-bold block">Density & Whitespace</span>
                    <p className="text-[#171511] leading-relaxed mt-0.5">{analysis.layout.density} • {analysis.layout.whitespace}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#756858] uppercase font-bold block">Rhythm Notes</span>
                    <p className="text-[#171511] leading-relaxed mt-0.5">{analysis.layout.compositionNotes}</p>
                  </div>
                </div>
              </div>

              {/* Shapes, Textures & Motifs */}
              <div className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-5 space-y-3">
                <div className="flex items-center gap-2 text-base font-heading font-bold text-[#171511]">
                  <Layers className="w-5 h-5 stroke-[2.5]" />
                  <span>Motifs & Elements</span>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {analysis.shapesAndTextures.map((shape, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-bold bg-[#FFE344] border-2 border-[#29231C] text-[#171511]">
                        {shape}
                      </span>
                    ))}
                  </div>

                  {analysis.interactionObservations && (
                    <div className="pt-2 text-xs border-t-2 border-[#29231C]/15">
                      <span className="text-[10px] font-mono text-[#756858] uppercase font-bold block">Interaction Patterns</span>
                      <p className="text-[#171511] mt-0.5 leading-relaxed font-medium">{analysis.interactionObservations}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Why it works & Potential Uses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-6 space-y-2">
                <h4 className="text-base font-heading font-bold text-[#171511]">Why This Design Works</h4>
                <p className="text-sm text-[#171511] leading-relaxed font-medium">
                  {analysis.whyItWorks}
                </p>
              </div>

              <div className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-6 space-y-2">
                <h4 className="text-base font-heading font-bold text-[#171511]">Recommended Use Cases</h4>
                <ul className="text-sm text-[#171511] space-y-1.5 list-disc list-inside font-medium">
                  {analysis.potentialUses.map((useCase, idx) => (
                    <li key={idx}>{useCase}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* SECTION D: CREATIVE BRIEF */}
            <div className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#171511] stroke-[2.5]" />
                  <h3 className="text-lg font-heading font-bold text-[#171511]">Concise Creative Brief</h3>
                </div>

                <div className="flex items-center gap-2">
                  {isEditingBrief ? (
                    <button
                      onClick={handleSaveBriefEdit}
                      className="px-3 py-1.5 bg-[#FFE344] border-2 border-[#29231C] text-xs font-bold uppercase text-[#171511]"
                    >
                      Save Brief
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingBrief(true)}
                      className="px-3 py-1.5 bg-[#F4E7CF] border-2 border-[#29231C] text-xs font-bold uppercase text-[#171511] hover:bg-[#FFE344]"
                    >
                      Edit Brief
                    </button>
                  )}

                  <button
                    onClick={() => copyToClipboard(customBrief || analysis.creativeBrief, 'brief')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE344] text-xs font-bold uppercase text-[#171511] border-2 border-[#29231C] shadow-xs hover:bg-[#ffe766]"
                  >
                    {copiedBrief ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span>{copiedBrief ? 'Copied' : 'Copy Brief'}</span>
                  </button>
                </div>
              </div>

              {isEditingBrief ? (
                <textarea
                  value={customBrief}
                  onChange={(e) => setCustomBrief(e.target.value)}
                  rows={4}
                  className="w-full bg-[#F4E7CF] border-2 border-[#29231C] p-3 text-sm text-[#171511] font-mono focus:outline-none focus:bg-white"
                />
              ) : (
                <div className="bg-[#F4E7CF] border-2 border-[#29231C] p-4 text-sm text-[#171511] whitespace-pre-wrap leading-relaxed font-medium">
                  {customBrief || analysis.creativeBrief}
                </div>
              )}
            </div>

            {/* SECTION E: REUSABLE PROMPT GENERATOR & TARGET PROJECT ADAPTER */}
            <div className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-5 h-5 text-[#171511] stroke-[2.5]" />
                  <h3 className="text-lg font-heading font-bold text-[#171511]">Reusable AI Prompt</h3>
                </div>

                <div className="flex items-center gap-2">
                  {isEditingPrompt ? (
                    <button
                      onClick={handleSavePromptEdit}
                      className="px-3 py-1.5 bg-[#FFE344] border-2 border-[#29231C] text-xs font-bold uppercase text-[#171511]"
                    >
                      Save Prompt
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingPrompt(true)}
                      className="px-3 py-1.5 bg-[#F4E7CF] border-2 border-[#29231C] text-xs font-bold uppercase text-[#171511] hover:bg-[#FFE344]"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => copyToClipboard(customPrompt || analysis.reusablePrompt, 'prompt')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#FF682D] hover:bg-[#ff7a45] text-xs font-bold uppercase text-white border-2 border-[#29231C] shadow-retro cursor-pointer"
                  >
                    {copiedPrompt ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
                    <span>{copiedPrompt ? 'Copied Prompt' : 'Copy Reusable Prompt'}</span>
                  </button>
                </div>
              </div>

              {isEditingPrompt ? (
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={5}
                  className="w-full bg-[#171511] text-[#FFE344] border-2 border-[#29231C] p-4 text-xs font-mono focus:outline-none"
                />
              ) : (
                <div className="bg-[#171511] border-2 border-[#29231C] p-4 text-xs text-[#FFF0D7] font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                  {customPrompt || analysis.reusablePrompt}
                </div>
              )}

              {/* Adapt Prompt to Target Project Form */}
              <div className="pt-4 border-t-2 border-[#29231C] space-y-3">
                <div className="text-sm font-heading font-bold text-[#171511]">
                  Adapt Design Direction to Target Project
                </div>
                <p className="text-xs text-[#756858] font-medium">
                  Translate this reference's visual language into tailored prompt instructions for your specific project.
                </p>

                <form onSubmit={handleAdaptPrompt} className="flex gap-2">
                  <input
                    type="text"
                    value={targetProject}
                    onChange={(e) => setTargetProject(e.target.value)}
                    placeholder="e.g. Developer portfolio, SaaS dashboard, e-commerce landing page..."
                    className="flex-1 h-12 bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro px-4 text-sm font-medium text-[#171511] placeholder:text-[#756858] focus:outline-none focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={adaptingPrompt || !targetProject.trim()}
                    className="h-12 px-5 bg-[#FFE344] hover:bg-[#ffe766] text-xs font-bold uppercase tracking-wider text-[#171511] border-2 border-[#29231C] shadow-retro disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {adaptingPrompt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 stroke-[2.5]" />}
                    <span>{adaptingPrompt ? 'Translating...' : 'Generate Adapted Prompt'}</span>
                  </button>
                </form>

                {adaptError && (
                  <div className="p-3 bg-[#FF682D] text-white border-2 border-[#29231C] text-xs font-bold">
                    {adaptError}
                  </div>
                )}

                {adaptedPrompt && (
                  <div className="mt-3 p-4 bg-[#171511] border-2 border-[#29231C] shadow-retro space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#FFE344]">
                        Adapted for: {targetProject}
                      </span>
                      <button
                        onClick={() => copyToClipboard(adaptedPrompt, 'prompt')}
                        className="text-xs font-bold uppercase text-[#FFE344] hover:underline flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Adapted Prompt</span>
                      </button>
                    </div>
                    <p className="text-xs text-[#FFF0D7] font-mono whitespace-pre-wrap leading-relaxed">
                      {adaptedPrompt}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Delete / Trash Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showTrashConfirm}
        title="Move to Trash"
        message={`Move "${reference.title}" to Trash? You can restore it anytime from the Trash view.`}
        confirmLabel="Move to Trash"
        onConfirm={handleConfirmTrash}
        onCancel={() => setShowTrashConfirm(false)}
      />

      {/* Edit Reference Modal */}
      {isEditOpen && (
        <EditReferenceModal
          reference={reference}
          collections={collections}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onUpdated={(updated) => setReference(updated)}
        />
      )}

      {/* Fullscreen Image Lightbox */}
      {isImageFullscreen && reference.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-[#171511]/95 flex items-center justify-center p-6"
          onClick={() => setIsImageFullscreen(false)}
        >
          <button
            onClick={() => setIsImageFullscreen(false)}
            className="absolute top-6 right-6 h-12 w-12 flex items-center justify-center bg-[#FFE344] text-[#171511] border-2 border-[#29231C] shadow-retro"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
          <img
            src={reference.imageUrl}
            alt={reference.title}
            className="max-w-full max-h-[90vh] object-contain border-4 border-[#29231C] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
