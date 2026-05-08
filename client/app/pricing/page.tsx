'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Shield, Globe, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      desc: "Perfect for occasional users",
      features: [
        "Up to 5 images per batch",
        "Basic GPS tagging",
        "Map selection tool",
        "Standard processing speed",
        "No registration required"
      ],
      button: "Start for Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      desc: "For photographers and SEO pros",
      features: [
        "Unlimited batch processing",
        "Advanced EXIF editing",
        "Reverse geocoding",
        "Priority processing queue",
        "Image history & storage",
        "API access (Coming soon)"
      ],
      button: "Get Pro Access",
      popular: true
    },
    {
      name: "Team",
      price: "$49",
      period: "/month",
      desc: "For agencies and teams",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Shared image library",
        "Custom branding",
        "White-label exports",
        "Dedicated support"
      ],
      button: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Simple, Transparent <span className="text-gradient">Pricing</span></h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose the plan that fits your needs. No hidden fees, cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative rounded-3xl p-8 flex flex-col ${
              plan.popular 
                ? "bg-primary/10 border-2 border-primary shadow-[0_0_40px_rgba(59,130,246,0.15)] scale-105 z-10" 
                : "glass border-white/5"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-widest">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              <p className="text-sm text-muted-foreground">{plan.desc}</p>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              {plan.features.map((feature, fIdx) => (
                <div key={fIdx} className="flex items-start gap-3">
                  <div className={`mt-1 p-0.5 rounded-full ${plan.popular ? "bg-primary text-white" : "bg-white/10 text-white"}`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Link href={plan.name === "Free" ? "/tool" : "#"}>
              <button className={`w-full py-4 rounded-2xl font-bold transition-all ${
                plan.popular 
                  ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25" 
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}>
                {plan.button}
              </button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
