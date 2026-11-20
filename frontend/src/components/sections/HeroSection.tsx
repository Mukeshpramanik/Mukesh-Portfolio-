'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Sparkles,
  Send,
  Terminal,
  Code2,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { profileData } from '@/data/profile';
import { usePortfolioContent } from '@/hooks/usePortfolioContent';
import { useThemeStore } from '@/stores/theme-store';

const defaultRoles = [
  'B.Tech CSE Student',
  'Data Analytics Enthusiast',
  'Python Developer',
  'Machine Learning Explorer',
];

export function HeroSection() {
  const { personal, websiteText } = usePortfolioContent();
  const { themeConfig } = useThemeStore();
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeRoles = useMemo(() => {
    return personal?.tagline
      ? [personal.tagline, 'Data Analytics Enthusiast', 'Python Developer', 'Machine Learning Explorer']
      : defaultRoles;
  }, [personal?.tagline]);

  // Typewriter effect
  useEffect(() => {
    const currentRole = activeRoles[currentRoleIndex] || activeRoles[0];
    const typingSpeed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentRole.length) {
          setDisplayedText(currentRole.slice(0, displayedText.length + 1));
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(currentRole.slice(0, displayedText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentRoleIndex((prev) => (prev + 1) % activeRoles.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentRoleIndex, activeRoles]);

  // Subtle interactive canvas background particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      dx: number;
      dy: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = [
      themeConfig.colors.primary,
      themeConfig.colors.primaryLight,
      themeConfig.colors.accent,
      themeConfig.colors.accentLight,
    ];
    const particleCount = Math.min(50, Math.floor(width / 30));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(
            particles[i].x - particles[j].x,
            particles[i].y - particles[j].y
          );
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `${themeConfig.colors.primary}20`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and move particles
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [themeConfig]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12"
    >
      {/* Background Canvas Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none z-0" />

      {/* Decorative Animated Glowing Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/5 w-80 h-80 rounded-full bg-primary/15 blur-[120px] pointer-events-none -z-10"
        animate={{
          scale: [1, 1.25, 1],
          x: [0, 30, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-accent/15 blur-[140px] pointer-events-none -z-10"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Geometric Badges (Decorative) */}
      <motion.div
        className="hidden lg:flex absolute top-1/3 left-12 xl:left-24 items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-card text-xs font-mono text-accent border-accent/30 shadow-lg shadow-accent/10 pointer-events-none"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Database className="w-4 h-4 text-accent" />
        <span>Data Analytics</span>
      </motion.div>

      <motion.div
        className="hidden lg:flex absolute bottom-1/3 right-12 xl:right-24 items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-card text-xs font-mono text-primary border-primary/30 shadow-lg shadow-primary/10 pointer-events-none"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <Code2 className="w-4 h-4 text-primary" />
        <span>Python Developer</span>
      </motion.div>

      {/* Fixed/Desktop Side Social Links */}
      <motion.aside
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        aria-label="Social media links"
        className="hidden xl:flex fixed left-8 bottom-1/3 z-30 flex-col items-center gap-4"
      >
        <a
          href={personal.socialLinks?.github || profileData.socialLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
          className="p-2.5 rounded-xl glass-card text-muted hover:text-white hover:border-violet-500/50 hover:scale-110 transition-all duration-200"
        >
          <Github className="w-4 h-4" />
        </a>
        <a
          href={personal.socialLinks?.linkedin || profileData.socialLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn Profile"
          className="p-2.5 rounded-xl glass-card text-muted hover:text-cyan-400 hover:border-cyan-500/50 hover:scale-110 transition-all duration-200"
        >
          <Linkedin className="w-4 h-4" />
        </a>
        <a
          href={personal.socialLinks?.twitter || profileData.socialLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter Profile"
          className="p-2.5 rounded-xl glass-card text-muted hover:text-violet-400 hover:border-violet-500/50 hover:scale-110 transition-all duration-200"
        >
          <Twitter className="w-4 h-4" />
        </a>
        <a
          href={`mailto:${personal.email || profileData.email}`}
          aria-label="Send Email"
          className="p-2.5 rounded-xl glass-card text-muted hover:text-cyan-400 hover:border-cyan-500/50 hover:scale-110 transition-all duration-200"
        >
          <Mail className="w-4 h-4" />
        </a>
        <div className="w-px h-16 bg-gradient-to-b from-border to-transparent mt-2" />
      </motion.aside>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
        {/* Status Chip */}
        {personal.availableForHire !== false && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide bg-primary/10 text-primary border border-primary/25 mb-6 shadow-inner"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
            Available for Opportunities &amp; Internships
          </motion.div>
        )}

        {/* Personal Profile Photograph Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mx-auto mb-6 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 group select-none"
        >
          {/* Ambient Glow */}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-primary via-primary-light to-accent opacity-70 blur-xl group-hover:opacity-95 transition-opacity duration-500 animate-pulse-glow" />

          {/* Border Ring Frame */}
          <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-primary via-primary-light to-accent shadow-2xl shadow-primary/25">
            <div className="w-full h-full rounded-full bg-surface overflow-hidden flex items-center justify-center border border-white/10 relative">
              {personal.avatarUrl ? (
                <img
                  src={personal.avatarUrl}
                  alt={personal.name || profileData.name || 'Mukesh Pramanik'}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface relative">
                  <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                  <span className="text-4xl sm:text-5xl font-extrabold font-display gradient-text tracking-tighter">
                    MP
                  </span>
                  <span className="text-[10px] font-mono text-accent uppercase tracking-widest mt-0.5">
                    {personal.name || profileData.name || 'Mukesh'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Online Active Indicator Dot */}
          {personal.availableForHire !== false && (
            <div
              className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 border-2 border-surface shadow-md flex items-center justify-center"
              title="Available for opportunities"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
          )}
        </motion.div>

        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-base sm:text-lg md:text-xl font-mono text-cyan-400 mb-3 tracking-wider"
        >
          {websiteText.heroGreeting || "Hello, I'm"}
        </motion.p>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display tracking-tight leading-none mb-6"
        >
          <span className="gradient-text drop-shadow-sm">
            {personal.name || profileData.name}
          </span>
        </motion.h1>

        {/* Typewriter Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="min-h-[2.5rem] flex items-center justify-center mb-6"
        >
          <div className="text-lg sm:text-2xl md:text-3xl font-medium text-foreground/90 font-mono flex items-center">
            <span>{displayedText}</span>
            <span className="inline-block w-0.5 h-6 sm:h-8 ml-1 bg-cyan-400 animate-pulse" />
          </div>
        </motion.div>

        {/* Summary Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="text-sm sm:text-base md:text-lg text-muted max-w-2xl mx-auto leading-relaxed mb-10"
        >
          {personal.bio || profileData.bio}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button
            size="lg"
            variant="primary"
            onClick={() => scrollTo('projects')}
            rightIcon={<Sparkles className="w-4 h-4 ml-1" />}
            className="w-full sm:w-auto glow-primary"
          >
            {websiteText.heroCtaWork || 'View My Work'}
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => scrollTo('contact')}
            leftIcon={<Send className="w-4 h-4 mr-1 text-accent" />}
            className="w-full sm:w-auto hover:border-accent/40"
          >
            {websiteText.heroCtaContact || 'Get in Touch'}
          </Button>

          <Button
            size="lg"
            variant="outline"
            href="/terminal"
            leftIcon={<Terminal className="w-4 h-4 mr-1 text-primary" />}
            className="w-full sm:w-auto font-mono text-xs hover:border-primary/50"
          >
            {websiteText.heroCtaTerminal || 'Launch Terminal'}
          </Button>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.button
        onClick={() => scrollTo('about')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        aria-label="Scroll to about section"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-muted hover:text-cyan-400 transition-colors focus:outline-none group cursor-pointer"
      >
        <span className="text-[11px] font-mono tracking-widest uppercase mb-1.5 opacity-60 group-hover:opacity-100">
          Scroll Down
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="p-1 rounded-full border border-border group-hover:border-cyan-400/50"
        >
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.button>
    </section>
  );
}

export default HeroSection;
