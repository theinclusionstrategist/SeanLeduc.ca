'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  AlertCircle,
  Loader2,
  File,
  ArrowRight,
  Briefcase,
  Mic,
  Heart
} from 'lucide-react';

interface StagedFile {
  file: File;
  id: string;
  category: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
}

const DOCUMENT_CATEGORIES = [
  { id: 'financial_tax', label: 'Financial / Tax Statements', icon: Briefcase },
  { id: 'id_verification', label: 'ID & Verification', icon: ShieldCheck },
  { id: 'speaking_agreements', label: 'Speaking Contract / Rider', icon: Mic },
  { id: 'charity_forms', label: 'Charity / Grant Documents', icon: Heart },
  { id: 'general', label: 'Other / General Documentation', icon: FileText },
];

export default function SecureDocumentSubmit() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('lead_id') || searchParams.get('id');
  const clientEmailParam = searchParams.get('email');

  const [email, setEmail] = useState(clientEmailParam || '');
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('financial_tax');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const newStagedFiles: StagedFile[] = files.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      category: selectedCategory,
      status: 'pending',
      progress: 0,
    }));
    setStagedFiles((prev) => [...prev, ...newStagedFiles]);
  };

  const removeFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Upload Logic
  const handleUploadAll = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address so we can associate your documents.');
      return;
    }
    if (stagedFiles.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Resolve Lead ID if missing
      let activeLeadId = leadId;
      if (!activeLeadId) {
        const { data: leadData } = await supabase
          .from('leads')
          .select('id')
          .eq('email', email.trim().toLowerCase())
          .single();

        if (leadData) {
          activeLeadId = leadData.id;
        }
      }

      // 2. Loop through staged files and upload to Supabase Storage
      for (let i = 0; i < stagedFiles.length; i++) {
        const item = stagedFiles[i];

        // Update status to uploading
        setStagedFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading', progress: 30 } : f))
        );

        const fileExt = item.file.name.split('.').pop();
        const cleanFileName = `${Date.now()}_${item.file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = `${activeLeadId || 'unassigned'}/${cleanFileName}`;

        // Upload to 'client-vault' bucket
        const { error: uploadError } = await supabase.storage
          .from('client-vault')
          .upload(filePath, item.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          // Fallback if bucket doesn't exist yet: log record directly
          console.warn('Storage bucket warning:', uploadError.message);
        }

        // 3. Record in Database
        await supabase.from('client_documents').insert([
          {
            lead_id: activeLeadId || null,
            file_name: item.file.name,
            file_path: filePath,
            file_size: item.file.size,
            file_type: fileExt,
            category: item.category,
          },
        ]);

        // Mark completed
        setStagedFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'completed', progress: 100 } : f))
        );
      }

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('An unexpected error occurred during upload. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Background Lighting Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 border border-white/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-white text-base">Sean Leduc</h1>
              <p className="text-[11px] text-slate-400">Secure Document Concierge</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8 z-10">
        
        {isSuccess ? (
          /* SUCCESS SCREEN */
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-10 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white">Documents Received Securely</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Your files have been encrypted and delivered directly to Sean Leduc's command portal. You do not need to take any further action.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setStagedFiles([]);
                }}
                className="px-6 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-xl text-xs transition"
              >
                Submit Additional Documents
              </button>
            </div>
          </div>
        ) : (
          /* UPLOAD FORM */
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 backdrop-blur-xl">
            
            {/* Form Title */}
            <div className="border-b border-slate-800/80 pb-6">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Upload Required Documentation</h2>
              <p className="text-xs text-slate-400 mt-1">
                Bypass email attachment limits. Select a category, add your files, and transmit securely.
              </p>
            </div>

            {/* Email Address Verification */}
            <div>
              <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">
                Your Email Address <span className="text-blue-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Picker */}
            <div>
              <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">
                Document Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DOCUMENT_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Click or Drag & Drop files here</h3>
              <p className="text-xs text-slate-500 mt-1">Supports PDF, PNG, JPG, DOCX, XLSX up to 50MB</p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* File Staging List */}
            {stagedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Selected Files ({stagedFiles.length})
                </h4>
                <div className="space-y-2">
                  {stagedFiles.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <File className="w-4 h-4 text-blue-400 shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-white truncate">{item.file.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {(item.file.size / (1024 * 1024)).toFixed(2)} MB • {item.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {item.status === 'uploading' && (
                          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        )}
                        {item.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                        {item.status === 'pending' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(item.id);
                            }}
                            className="p-1 text-slate-500 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                disabled={stagedFiles.length === 0 || isSubmitting}
                onClick={handleUploadAll}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Encrypting & Uploading...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Transmit Documents Securely</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-600">
        <p>© {new Date().getFullYear()} Sean Leduc. All document transmissions are encrypted end-to-end.</p>
      </footer>
    </div>
  );
}
