'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  Send,
  Github,
  Linkedin,
  Twitter,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePortfolioContent } from '@/hooks/usePortfolioContent';
import { submitContact } from '@/lib/api';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactSection() {
  const { personal, websiteText } = usePortfolioContent();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastMailto, setLastMailto] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!formData.name.trim()) {
      errs.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      errs.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      errs.subject = 'Subject must be at least 3 characters';
    }

    if (!formData.message.trim()) {
      errs.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await submitContact(formData);
    } catch {
      // Backend offline or running on static GitHub Pages
    }

    // Persist locally for the Admin Inbox to inspect
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('mukesh_portfolio_inbox') || '[]');
        stored.unshift({
          id: `local-msg-${Date.now()}`,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          read: false,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('mukesh_portfolio_inbox', JSON.stringify(stored.slice(0, 50)));
      } catch {
        // storage quota fallback
      }
    }

    const mailto = `mailto:${personal.email}?subject=${encodeURIComponent(
      formData.subject
    )}&body=${encodeURIComponent(
      `Hi Mukesh,\n\n${formData.message}\n\nFrom: ${formData.name} (${formData.email})`
    )}`;
    setLastMailto(mailto);

    toast.success(
      'Message saved to your browser storage. Click below to email Mukesh directly.',
      {
        duration: 6000,
        style: {
          background: '#1A1A26',
          color: '#F8FAFC',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        },
      }
    );
    setSubmitSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(personal.email);
    setCopiedEmail(true);
    toast.success('Email address copied to clipboard!', {
      duration: 2500,
      style: {
        background: '#1A1A26',
        color: '#F8FAFC',
        border: '1px solid rgba(34, 211, 238, 0.3)',
      },
    });
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <section id="contact" className="py-20 sm:py-28 relative">
      <Toaster position="bottom-right" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Connect"
          title="Get In Touch"
          subtitle="Have a question, an internship opportunity, or want to collaborate on a data or software project? Let's talk!"
          align="center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto">
          {/* Left Column: Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col justify-between space-y-8"
          >
            <Card
              variant="glass"
              padding="lg"
              hoverLift={false}
              className="border-border/80 h-full flex flex-col justify-between relative overflow-hidden"
            >
              {/* Animated Floating Envelope Icon Graphic */}
              <div className="relative mb-6">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent p-0.5 shadow-xl shadow-primary/20"
                >
                  <div className="w-full h-full rounded-2xl bg-surface flex items-center justify-center text-accent">
                    <Mail className="w-8 h-8" />
                  </div>
                </motion.div>
                <div className="absolute top-2 left-14 w-28 h-28 bg-primary/20 rounded-full blur-2xl -z-10 pointer-events-none" />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold font-display text-foreground tracking-tight mb-2">
                    Let&apos;s build something great together.
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    I am actively seeking software engineering internships, research roles, and collaborative projects in data analytics, Python, and AI.
                  </p>
                </div>

                {/* Contact Points */}
                <div className="space-y-4">
                  {/* Email row with Copy button */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-elevated/80 border border-border/80">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono uppercase text-muted block">
                          Email
                        </span>
                        <a
                          href={`mailto:${personal.email}`}
                          className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                        >
                          {personal.email}
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={copyEmailToClipboard}
                      className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
                      title="Copy email to clipboard"
                    >
                      {copiedEmail ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Location row */}
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-elevated/80 border border-border/80">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase text-muted block">
                        Location
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {personal.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-8 border-t border-border/40 mt-6">
                <span className="text-xs font-mono uppercase tracking-wider text-muted block mb-3">
                  Connect on Socials
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href={personal.socialLinks?.github || 'https://github.com/Mukeshpramanik'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl glass-card text-muted hover:text-white hover:border-primary/50 hover:scale-105 transition-all"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href={personal.socialLinks?.linkedin || 'https://linkedin.com/in/mukesh-pramanik'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl glass-card text-muted hover:text-accent hover:border-accent/50 hover:scale-105 transition-all"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href={personal.socialLinks?.twitter || 'https://twitter.com/mukeshpramanik'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl glass-card text-muted hover:text-primary hover:border-primary/50 hover:scale-105 transition-all"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <Card
              variant="glass"
              padding="lg"
              hoverLift={false}
              className="border-border/80 shadow-xl"
            >
              <div className="mb-6 space-y-2">
                <h3 className="text-xl font-bold font-display text-foreground tracking-tight">
                  Send a Message
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Compose your message below. Because this site is hosted statically with a ₹0 budget, submissions are saved to your browser&apos;s local storage and can be dispatched directly to Mukesh via your email client.
                </p>
              </div>

              {submitSuccess && (
                <div className="p-4 mb-6 rounded-2xl bg-primary/10 border border-primary/30 text-foreground space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Message Saved in Your Browser</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Your message draft is stored in your browser&apos;s local storage. On static GitHub Pages, messages do <strong>not</strong> reach Mukesh automatically. Please click the button below to send your message directly via email!
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={lastMailto || `mailto:${personal.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-md hover:opacity-95 transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Open in Email App & Send</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(false)}
                      className="px-3 py-2 rounded-xl text-xs text-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Johnson"
                    error={errors.name}
                    disabled={isSubmitting}
                  />

                  <Input
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@example.com"
                    error={errors.email}
                    disabled={isSubmitting}
                  />
                </div>

                <Input
                  label="Subject *"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Internship Inquiry / Collaboration"
                  error={errors.subject}
                  disabled={isSubmitting}
                />

                <Input
                  label="Message *"
                  name="message"
                  inputType="textarea"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  error={errors.message}
                  disabled={isSubmitting}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting}
                  rightIcon={<Send className="w-4 h-4 ml-1" />}
                  className="shadow-primary/30 glow-primary"
                >
                  Send Message
                </Button>

                <p className="text-[11px] text-muted text-center pt-1 leading-relaxed">
                  <span className="text-accent font-medium">Static Site Delivery:</span> Submitting saves a draft in your browser&apos;s local storage and offers a 1-click email action to dispatch directly to Mukesh.
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
