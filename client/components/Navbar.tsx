'use client';

import Link from 'next/link';
import { MapPin, Image as ImageIcon, Shield, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

import { useSession, signOut } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { data: session } = useSession();
  const { openSignIn } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary rounded-lg group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">GeoTag<span className="text-primary">Pro</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/tool" className="text-sm font-medium hover:text-primary transition-colors">Tool</Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
          <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">Blog</Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-muted-foreground hidden sm:block">
                Hi, {session.user?.name}
              </span>
              <button 
                onClick={() => signOut()}
                className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={openSignIn}
                className="hidden sm:block text-sm font-medium hover:text-primary transition-colors"
              >
                Sign In
              </button>
              <Link href="/tool">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-primary/25"
                >
                  Get Started
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
