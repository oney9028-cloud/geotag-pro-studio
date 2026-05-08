'use client';

import { motion } from 'framer-motion';
import { MapPin, Upload, Globe, Shield, Zap, ChevronRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4" />
              <span>v2.0 is now live with Bulk Processing</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
            >
              Master Your Image <br />
              <span className="text-gradient">Geolocation</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl"
            >
              Embed precise GPS metadata into your photos with our professional-grade tool. 
              Perfect for SEO, real estate, and digital archiving.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link href="/tool">
                <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold transition-all shadow-2xl shadow-primary/40 flex items-center gap-2 group">
                  Start Tagging Now
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="#features">
                <button className="px-8 py-4 glass hover:bg-white/10 text-white rounded-2xl text-lg font-bold transition-all">
                  See Features
                </button>
              </Link>
            </motion.div>

            {/* Mockup / Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-20 w-full max-w-5xl glass-card rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)]"
            >
              <div className="h-10 bg-slate-800/50 border-b border-white/10 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <div className="ml-4 text-xs text-muted-foreground font-medium">geotag-pro.app/tool</div>
              </div>
              <div className="p-8 md:p-12 bg-slate-950/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-white/5">
                    <Upload className="w-12 h-12 text-primary mb-4 opacity-50" />
                    <p className="text-sm font-medium text-muted-foreground">Drop your images here</p>
                  </div>
                  <div className="aspect-square rounded-2xl bg-slate-900 border border-white/10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-primary/50">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 glass p-3 rounded-xl text-[10px] font-mono">
                      <div>Lat: 40.7128 N</div>
                      <div>Lng: 74.0060 W</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-24 bg-slate-950/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for Geotagging</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for speed and precision. Our platform handles the technical details so you can focus on your work.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: "Precision Mapping", desc: "Interactive map interface for pinpoint accuracy down to the meter." },
              { icon: Zap, title: "Bulk Processing", desc: "Tag hundreds of images in seconds. No more manual one-by-one editing." },
              { icon: Shield, title: "Privacy First", desc: "Images are processed securely and metadata is handled with care." },
              { icon: Globe, title: "Global Search", desc: "Find any location on earth instantly with our advanced search." },
              { icon: ImageIcon, title: "EXIF Preservation", desc: "Keep all your original camera settings while adding GPS data." },
              { icon: Shield, title: "Cloud Backup", desc: "Optional cloud storage for your tagged images and history." }
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl glass border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
