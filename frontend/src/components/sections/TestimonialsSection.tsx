'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, MessageSquare, Star } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { testimonialsData } from '@/data/profile';
import type { Testimonial } from '@/types';

export interface TestimonialsSectionProps {
  initialTestimonials?: Testimonial[];
  showEmptyPlaceholder?: boolean;
}

export function TestimonialsSection({
  initialTestimonials = testimonialsData,
  showEmptyPlaceholder = false,
}: TestimonialsSectionProps) {
  const hasTestimonials =
    initialTestimonials && initialTestimonials.length > 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play carousel
  useEffect(() => {
    if (!hasTestimonials || isPaused || initialTestimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % initialTestimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [hasTestimonials, isPaused, initialTestimonials.length]);

  if (!hasTestimonials && !showEmptyPlaceholder) {
    return null;
  }

  const prevSlide = () => {
    if (!hasTestimonials) return;
    setCurrentIndex(
      (prev) => (prev - 1 + initialTestimonials.length) % initialTestimonials.length
    );
  };

  const nextSlide = () => {
    if (!hasTestimonials) return;
    setCurrentIndex((prev) => (prev + 1) % initialTestimonials.length);
  };

  const current = hasTestimonials ? initialTestimonials[currentIndex] : null;

  return (
    <section id="testimonials" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Endorsements"
          title="Testimonials & Recommendations"
          subtitle="Feedback from professors, mentors, and collaborative project teammates."
          align="center"
        />

        {hasTestimonials && current ? (
          <div
            className="max-w-3xl mx-auto relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id ?? currentIndex}
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <Card
                  variant="glass"
                  padding="xl"
                  hoverLift={false}
                  className="relative border-border/80 text-center shadow-xl p-8 sm:p-12"
                >
                  <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />

                  <p className="text-base sm:text-xl text-foreground/90 font-normal leading-relaxed italic mb-8">
                    &ldquo;{current.content}&rdquo;
                  </p>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5 mb-3 shadow-md">
                      <div className="w-full h-full rounded-full bg-surface flex items-center justify-center font-bold text-sm text-foreground">
                        {current.name.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <h4 className="font-bold text-foreground text-base tracking-tight font-display">
                      {current.name}
                    </h4>
                    <p className="text-xs text-muted font-mono mt-0.5">
                      {current.role} • <span className="text-accent">{current.company}</span>
                    </p>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Slider Controls */}
            {initialTestimonials.length > 1 && (
              <div className="flex items-center justify-between mt-6 px-4">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="p-2 rounded-xl glass-card text-muted hover:text-foreground hover:border-primary/50 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {initialTestimonials.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentIndex
                          ? 'w-6 bg-primary'
                          : 'w-2 bg-border hover:bg-muted'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={nextSlide}
                  className="p-2 rounded-xl glass-card text-muted hover:text-foreground hover:border-primary/50 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-center glass-card p-8 sm:p-10 border-border/80">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold font-display text-foreground mb-2">
              Teammate & Mentor Endorsements
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Testimonials from collaborative academic projects and mentors will be displayed here soon as reviews are submitted.
            </p>
            <Button variant="outline" href="#contact" size="md">
              Leave a Message
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialsSection;
