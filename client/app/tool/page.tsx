'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Image as ImageIcon, Download, Settings, Info, Loader2, Globe, FileText, Tags, Plus, ArrowRight, X, Save, RefreshCcw, Layers, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSession, signIn } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/Tool/ImageUploader';

const MapSelector = dynamic(() => import('@/components/Tool/MapSelector'), { 
  ssr: false,
  loading: () => <div className="h-[500px] bg-slate-900 animate-pulse rounded-3xl" />
});

import Link from 'next/link';
import { decimalToDMS } from '@/lib/coords';
import { cn } from '@/lib/utils';

interface MetadataFields {
  lat: number;
  lng: number;
  alt: string;
  headline: string;
  description: string;
  keywords: string;
}

export default function ToolPage() {
  const { data: session } = useSession();
  const { openSignIn } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [existingGeotags, setExistingGeotags] = useState<string>('none');
  const [metadata, setMetadata] = useState<MetadataFields>({
    lat: 0,
    lng: 0,
    alt: '0',
    headline: '',
    description: '',
    keywords: '',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isFetchingElevation, setIsFetchingElevation] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [isZip, setIsZip] = useState(false);

  const currentFile = selectedFiles[currentFileIndex];
  const currentPreview = currentFile ? URL.createObjectURL(currentFile) : null;

  // 1. Auto Elevation Lookup when location changes
  useEffect(() => {
    if (location) {
      setMetadata(prev => ({ ...prev, lat: location.lat, lng: location.lng }));
      fetchElevation(location.lat, location.lng);
    }
  }, [location]);

  const fetchElevation = async (lat: number, lng: number) => {
    setIsFetchingElevation(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/geotag/elevation?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        setMetadata(prev => ({ ...prev, alt: data.elevation.toString() }));
      }
    } catch (err) {
      console.error('Elevation fetch failed:', err);
    } finally {
      setIsFetchingElevation(false);
    }
  };

  const handleFilesSelected = async (files: File[]) => {
    setSelectedFiles(files);
    setShowEditor(true);
    if (files.length > 0) {
      extractMetadata(files[0]);
    }
  };

  const extractMetadata = async (file: File) => {
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/geotag/extract-metadata`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.lat && data.lng) {
          setLocation({ lat: data.lat, lng: data.lng });
          setExistingGeotags(`${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}`);
        } else {
          setExistingGeotags('none');
        }
        setMetadata({
          lat: data.lat || 0,
          lng: data.lng || 0,
          alt: data.alt?.toString() || '0',
          headline: data.headline || '',
          description: data.description || '',
          keywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : (data.keywords || ''),
        });
      }
    } catch (error) {
      console.error('Extraction error:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleWriteTags = async () => {
    if (selectedFiles.length === 0 || !location) return;

    // Authentication Gate
    if (!session) {
      openSignIn();
      return;
    }
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      // Handle bulk images
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      formData.append('lat', metadata.lat.toString());
      formData.append('lng', metadata.lng.toString());
      formData.append('alt', metadata.alt);
      formData.append('headline', metadata.headline);
      formData.append('description', metadata.description);
      formData.append('keywords', metadata.keywords);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/geotag/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process images');

      const data = await response.json();
      
      if (data.isZip) {
        setProcessedFileUrl(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${data.zipUrl}`);
        setIsZip(true);
        alert(`Bulk processing complete! ${selectedFiles.length} images are ready in a ZIP file.`);
      } else {
        setProcessedFileUrl(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${data.files[0].downloadUrl}`);
        setIsZip(false);
        alert('Tags written successfully! You can now download the PNG.');
      }
      
      setExistingGeotags(`${metadata.lat.toFixed(6)}, ${metadata.lng.toFixed(6)}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process images.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedFileUrl) {
      const a = document.createElement('a');
      a.href = processedFileUrl;
      if (isZip) {
        a.download = `geotagged-batch-${Date.now()}.zip`;
      } else {
        const originalName = currentFile?.name || 'geotagged-image';
        const fileName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        a.download = `${fileName}-geotagged.png`;
      }
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setShowEditor(false);
    setLocation(null);
    setProcessedFileUrl(null);
    setIsZip(false);
    setMetadata({
      lat: 0,
      lng: 0,
      alt: '0',
      headline: '',
      description: '',
      keywords: '',
    });
  };

  const handleManualCoordChange = (type: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (type === 'lat') {
        setLocation(prev => ({ lat: numValue, lng: prev?.lng || 0 }));
      } else {
        setLocation(prev => ({ lat: prev?.lat || 0, lng: numValue }));
      }
    }
  };

  const showExistingOnMap = () => {
    if (existingGeotags !== 'none') {
      const [lat, lng] = existingGeotags.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        setLocation({ lat, lng });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-[calc(100-200px)]">
      <AnimatePresence mode="wait">
        {!showEditor ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="text-center mb-12">
              <h1 className="text-5xl font-extrabold mb-4 tracking-tight">GeoTag <span className="text-gradient">Studio</span></h1>
              <p className="text-muted-foreground text-xl">Upload one or more images to start bulk tagging</p>
            </div>
            <div className="w-full max-w-3xl">
              <ImageUploader onFilesSelected={handleFilesSelected} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Map Section */}
            <section className="glass-card rounded-[2.5rem] p-4 flex flex-col gap-4">
              <MapSelector 
                onLocationChange={(lat, lng) => setLocation({ lat, lng })} 
                lat={location?.lat || 0}
                lng={location?.lng || 0}
              />
              {/* Coordinate Inputs directly under map */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 pb-2">
                <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-inner">
                  <div className="px-4 py-3 bg-slate-800 text-xs font-bold text-muted-foreground border-r border-white/10">Lat</div>
                  <input
                    type="number"
                    step="any"
                    value={location?.lat || ''}
                    onChange={(e) => handleManualCoordChange('lat', e.target.value)}
                    placeholder="0.000000"
                    className="w-full px-4 py-3 bg-transparent text-sm text-white outline-none"
                  />
                </div>
                <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-inner">
                  <div className="px-4 py-3 bg-slate-800 text-xs font-bold text-muted-foreground border-r border-white/10">Lon</div>
                  <input
                    type="number"
                    step="any"
                    value={location?.lng || ''}
                    onChange={(e) => handleManualCoordChange('lng', e.target.value)}
                    placeholder="0.000000"
                    className="w-full px-4 py-3 bg-transparent text-sm text-white outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Editor Layout: Image Left, Fields Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Image Preview / Batch List */}
              <div className="lg:col-span-4">
                <section className="glass-card rounded-[2.5rem] p-6 h-full flex flex-col">
                  <div className="aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-black/20 flex items-center justify-center border border-white/5 relative">
                    {currentPreview ? (
                      <img src={currentPreview} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-white/20" />
                    )}
                    {isExtracting && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground truncate mb-2">
                    {selectedFiles.length > 1 ? `${selectedFiles.length} images selected (Batch Mode)` : currentFile?.name}
                  </div>
                  <div className="mt-auto space-y-4">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Status</div>
                      <div className="text-xs text-white">
                        {isExtracting ? 'Analyzing metadata...' : selectedFiles.length > 1 ? 'Ready for bulk tagging' : 'Ready for tagging'}
                      </div>
                    </div>
                    {selectedFiles.length > 1 && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] text-blue-300 font-bold uppercase tracking-tighter">Bulk processing active</span>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Fields Section */}
              <div className="lg:col-span-8">
                <section className="glass-card rounded-[2.5rem] p-8 md:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Existing Geotags */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex justify-between">
                        Existing Geotags 
                        <button 
                          onClick={showExistingOnMap}
                          className="text-primary cursor-pointer hover:underline disabled:opacity-30"
                          disabled={existingGeotags === 'none'}
                        >
                          show
                        </button>
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={existingGeotags}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white/50 outline-none"
                      />
                    </div>

                    {/* Keywords */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        Keywords and Tags <Info className="w-3 h-3" />
                      </label>
                      <input
                        type="text"
                        placeholder="Tag 1, Tag 2..."
                        value={metadata.keywords}
                        onChange={(e) => setMetadata(prev => ({ ...prev, keywords: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                      />
                    </div>

                    {/* New Geotags (DMS Display) */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Geotags (DMS)</label>
                      <input
                        type="text"
                        readOnly
                        value={location ? `${decimalToDMS(location.lat, true)} | ${decimalToDMS(location.lng, false)}` : ''}
                        placeholder="Click on the map..."
                        className="w-full px-4 py-3 bg-primary/5 border border-primary/20 rounded-2xl text-xs text-primary font-bold outline-none"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        Description / Alternative Text <Info className="w-3 h-3" />
                      </label>
                      <input
                        type="text"
                        placeholder="Brief description..."
                        value={metadata.description}
                        onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                      />
                    </div>

                    {/* Altitude */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                        Altitude (meters)
                        {isFetchingElevation && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={metadata.alt}
                          onChange={(e) => setMetadata(prev => ({ ...prev, alt: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Zap className={cn("w-4 h-4 transition-colors", isFetchingElevation ? "text-primary animate-pulse" : "text-muted-foreground")} />
                        </div>
                      </div>
                    </div>

                    {/* Headline */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">IPTC Headline</label>
                      <input
                        type="text"
                        value={metadata.headline}
                        onChange={(e) => setMetadata(prev => ({ ...prev, headline: e.target.value }))}
                        placeholder="Photo title..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-10 flex flex-wrap gap-4">
                    <button
                      onClick={handleWriteTags}
                      disabled={isProcessing || !location}
                      className="flex-1 min-w-[200px] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      {selectedFiles.length > 1 ? `Write Bulk Tags (${selectedFiles.length})` : 'Write EXIF Tags'}
                    </button>
                    
                    <button
                      onClick={handleDownload}
                      disabled={!processedFileUrl}
                      className="flex-1 min-w-[200px] py-4 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Download className="w-5 h-5" />
                      {isZip ? 'Download ZIP' : 'Download PNG'}
                    </button>

                    <button
                      onClick={handleClear}
                      className="px-10 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <RefreshCcw className="w-5 h-5" />
                      Clear
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
