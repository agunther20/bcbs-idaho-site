'use client';

import { useVoiceSessionStore } from '@/lib/stores/voice-session-store';
import { ArrowRight, Shield, Heart, Users, Building2 } from 'lucide-react';

const agentName = process.env.NEXT_PUBLIC_AGENT_NAME || 'Blue Cross of Idaho';

export function WelcomeLanding() {
  const connect = useVoiceSessionStore((s) => s.connect);
  const sessionState = useVoiceSessionStore((s) => s.sessionState);

  const isConnecting = sessionState === 'connecting';

  const quickLinks = [
    {
      icon: Heart,
      title: 'Individual & Family',
      desc: 'ACA plans from Bronze to Gold — find coverage that fits your life.',
    },
    {
      icon: Users,
      title: 'Medicare',
      desc: 'Medicare Advantage & Supplement plans for Idaho residents.',
    },
    {
      icon: Building2,
      title: 'Employer Plans',
      desc: 'Small and large group health insurance for Idaho businesses.',
    },
  ];

  return (
    <div className="min-h-dvh lg:h-dvh lg:overflow-hidden grid grid-rows-[auto_1fr_auto] p-3 md:p-6 lg:p-8">
      {/* Header — BCBS Idaho top-left */}
      <header className="flex items-center gap-3">
        <Shield className="w-6 h-6" style={{ color: '#0072CE' }} />
        <span
          className="font-hero text-lg md:text-xl font-semibold tracking-tight"
          style={{ color: '#002855' }}
        >
          {agentName}
        </span>
      </header>

      {/* Content — left-aligned, vertically centered */}
      <main className="flex items-center">
        <div className="max-w-3xl space-y-8">
          {/* Badge pill */}
          <div
            className="animate-slide-in-left"
            style={{ animationDelay: '0.1s' }}
          >
            <span
              className="inline-block rounded-full px-4 py-1.5 text-xs font-data tracking-[0.15em] uppercase backdrop-blur-sm border"
              style={{
                background: 'rgba(0, 114, 206, 0.08)',
                borderColor: 'rgba(0, 114, 206, 0.2)',
                color: '#0072CE',
              }}
            >
              Blue Cross of Idaho &middot; Your Health Plan Guide
            </span>
          </div>

          {/* Title */}
          <h1
            className="animate-slide-in-left font-hero text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight"
            style={{ animationDelay: '0.25s', color: '#002855' }}
          >
            Find Your{' '}
            <span style={{ color: '#0072CE' }}>
              Perfect Plan
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="animate-slide-in-left text-base sm:text-lg md:text-xl max-w-lg"
            style={{ animationDelay: '0.4s', color: '#4a6a8a' }}
          >
            Explore coverage options, compare plans, and get instant answers about your health insurance — powered by AI.
          </p>

          {/* START CONVERSATION button */}
          <div
            className="animate-slide-in-left"
            style={{ animationDelay: '0.55s' }}
          >
            <button
              onClick={connect}
              disabled={isConnecting}
              className="start-button inline-flex items-center gap-3 disabled:opacity-60"
            >
              {isConnecting ? 'CONNECTING...' : 'TALK TO OUR AI GUIDE'}
              {!isConnecting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick-link cards */}
          <div
            className="animate-slide-in-left grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4"
            style={{ animationDelay: '0.7s' }}
          >
            {quickLinks.map((link) => (
              <div
                key={link.title}
                className="bcbs-card cursor-default"
              >
                <link.icon
                  className="w-6 h-6 mb-2"
                  style={{ color: '#0072CE' }}
                />
                <h3
                  className="font-hero text-sm font-semibold mb-1"
                  style={{ color: '#002855' }}
                >
                  {link.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#4a6a8a' }}>
                  {link.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between text-[10px] sm:text-xs font-data uppercase tracking-widest" style={{ color: '#4a6a8a' }}>
        <span>BLUE CROSS OF IDAHO</span>
        <span>AI-POWERED PLAN GUIDE</span>
      </footer>
    </div>
  );
}
