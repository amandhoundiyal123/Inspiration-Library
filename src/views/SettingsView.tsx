import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  Cpu, 
  HardDrive, 
  Check, 
  AlertCircle, 
  Loader2,
  FileArchive,
  FileCode,
  Database
} from 'lucide-react';
import { api } from '../services/api';

export const SettingsView: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Restore states
  const [restoring, setRestoring] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const data = await api.getSystemStatus();
        setSystemStatus(data);
      } catch (err) {
        console.error('Failed to get status:', err);
      } finally {
        setLoadingStatus(false);
      }
    }
    fetchStatus();
  }, []);

  const handleExportJson = () => {
    window.location.href = '/api/backup/export-json';
  };

  const handleExportZip = () => {
    window.location.href = '/api/backup/export-zip';
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    setRestoreFeedback(null);
    setRestoreError(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await api.restoreBackup(parsed);
      setRestoreFeedback(`Successfully restored ${res.importedCount} references without duplicates.`);
    } catch (err: any) {
      setRestoreError(err.message || 'Failed to restore backup file. Ensure it is a valid DesignVault JSON export.');
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F4E7CF]">
      {/* Header */}
      <div className="px-6 lg:px-10 pt-8 pb-6 border-b-2 border-[#29231C] bg-[#FFF0D7]">
        <div className="flex items-center gap-3.5">
          <h1 className="text-3xl lg:text-4xl font-heading font-black tracking-tight text-[#171511]">
            Backup & Export
          </h1>
          <span className="font-pixel text-[10px] font-bold uppercase tracking-wider text-[#171511] px-3 py-1 bg-[#FFE344] border-2 border-[#29231C] shadow-xs">
            PERSONAL LIBRARY
          </span>
        </div>
        <p className="text-base text-[#756858] font-medium mt-2">
          Your saved inspiration is stored locally. Export complete backups, download all images, or restore data anytime.
        </p>
      </div>

      <div className="p-6 lg:p-10 max-w-5xl space-y-8">
        {/* Backup & Export Actions */}
        <div className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-6 space-y-6">
          <div className="flex items-center gap-3 text-lg font-heading font-bold text-[#171511]">
            <HardDrive className="w-6 h-6 stroke-[2.5]" />
            <span>Export & Save Library</span>
          </div>

          <p className="text-sm text-[#756858] font-medium leading-relaxed">
            Download your entire library to keep offline copies. You can export structured metadata JSON or a complete ZIP package with all original screenshot images.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
            {/* JSON Metadata Export */}
            <div className="p-5 bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-base font-heading font-bold text-[#171511]">
                  <FileCode className="w-5 h-5 stroke-[2.5]" />
                  <span>Metadata JSON</span>
                </div>
                <p className="text-xs text-[#756858] font-medium mt-1.5 leading-relaxed">
                  Exports all reference titles, notes, website URLs, tags, collections, and AI design analyses in standard JSON format.
                </p>
              </div>

              <button
                onClick={handleExportJson}
                className="w-full h-12 flex items-center justify-center gap-2 bg-[#FFE344] hover:bg-[#ffe766] text-xs font-bold uppercase tracking-wider text-[#171511] border-2 border-[#29231C] shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Metadata JSON</span>
              </button>
            </div>

            {/* ZIP Full Export */}
            <div className="p-5 bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-base font-heading font-bold text-[#171511]">
                  <FileArchive className="w-5 h-5 stroke-[2.5]" />
                  <span>Full Archive ZIP</span>
                </div>
                <p className="text-xs text-[#756858] font-medium mt-1.5 leading-relaxed">
                  Bundles all metadata JSON alongside all uploaded images and full screenshot files into a single portable ZIP archive.
                </p>
              </div>

              <button
                onClick={handleExportZip}
                className="w-full h-12 flex items-center justify-center gap-2 bg-[#FF682D] hover:bg-[#ff7a45] text-xs font-bold uppercase tracking-wider text-white border-2 border-[#29231C] shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Full ZIP Backup</span>
              </button>
            </div>
          </div>

          {/* Restore from JSON */}
          <div className="pt-6 border-t-2 border-[#29231C]/15 space-y-3">
            <h4 className="text-base font-heading font-bold text-[#171511] flex items-center gap-2">
              <Upload className="w-5 h-5 stroke-[2.5]" />
              <span>Restore from Backup</span>
            </h4>
            <p className="text-xs text-[#756858] font-medium">
              Restore inspiration references from a previously exported DesignVault JSON file. Existing items will not be duplicated.
            </p>

            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={restoring}
                className="h-12 px-5 bg-[#FFE344] hover:bg-[#ffe766] text-xs font-bold uppercase tracking-wider text-[#171511] border-2 border-[#29231C] shadow-retro flex items-center gap-2 cursor-pointer transition-colors"
              >
                {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 stroke-[2.5]" />}
                <span>{restoring ? 'Restoring Library...' : 'Select JSON Backup File'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileRestore}
                className="hidden"
              />
            </div>

            {restoreFeedback && (
              <div className="p-4 bg-[#FFE344] border-2 border-[#29231C] text-xs font-bold text-[#171511] flex items-center gap-2">
                <Check className="w-5 h-5 shrink-0 stroke-[3]" />
                <span>{restoreFeedback}</span>
              </div>
            )}

            {restoreError && (
              <div className="p-4 bg-[#FF682D] border-2 border-[#29231C] text-xs font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 stroke-[3]" />
                <span>{restoreError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Local Storage & System Status */}
        <div className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-heading font-bold text-[#171511]">
            <Database className="w-5 h-5 stroke-[2.5]" />
            <span>Local Storage & Engine Status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-[#F4E7CF] border-2 border-[#29231C]">
              <span className="text-xs font-mono font-bold text-[#756858] uppercase block">Storage Engine</span>
              <span className="text-sm font-bold text-[#171511] font-mono mt-1 block">
                SQLite Local DB
              </span>
            </div>

            <div className="p-4 bg-[#F4E7CF] border-2 border-[#29231C]">
              <span className="text-xs font-mono font-bold text-[#756858] uppercase block">AI Analysis</span>
              <span className="text-sm font-bold text-[#171511] mt-1 flex items-center gap-1.5 font-mono">
                <Check className="w-4 h-4 text-[#171511] stroke-[3]" />
                Gemini Ready
              </span>
            </div>

            <div className="p-4 bg-[#F4E7CF] border-2 border-[#29231C]">
              <span className="text-xs font-mono font-bold text-[#756858] uppercase block">Saved Media</span>
              <span className="text-sm font-bold text-[#171511] font-mono mt-1 block">
                {systemStatus?.storage?.totalFormatted || '0 MB'} ({systemStatus?.storage?.filesCount || 0} files)
              </span>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-start gap-3 p-4 bg-[#F4E7CF] border-2 border-[#29231C] text-xs text-[#756858] leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-[#171511] stroke-[2.5] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#171511] font-bold block mb-0.5">Autonomous & Private:</strong>
                Your library is completely private for your personal use. Saved screenshots and URLs are stored directly in your local environment. AI analysis is completely optional and only runs when you ask for it.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
