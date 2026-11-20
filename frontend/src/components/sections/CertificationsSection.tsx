'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, Calendar, CheckCircle, ShieldCheck } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { certificationsData } from '@/data/profile';
import type { Certification } from '@/types';
import { usePortfolioContent } from '@/hooks/usePortfolioContent';

export interface CertificationsSectionProps {
  initialCertifications?: Certification[];
  showEmptyPlaceholder?: boolean;
}

export function CertificationsSection({
  initialCertifications,
  showEmptyPlaceholder = false,
}: CertificationsSectionProps) {
  const { certifications: synchronizedCertifications } = usePortfolioContent();
  const activeCertifications = synchronizedCertifications && synchronizedCertifications.length > 0 ? synchronizedCertifications : (initialCertifications || certificationsData);
  const hasCertifications =
    activeCertifications && activeCertifications.length > 0;

  if (!hasCertifications && !showEmptyPlaceholder) {
    return null;
  }

  return (
    <section id="certifications" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Credentials"
          title="Certifications & Badges"
          subtitle="Verified coursework and industry certifications across Python programming, SQL, and data science."
          align="center"
        />

        {hasCertifications ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {activeCertifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card
                  variant="glass"
                  padding="md"
                  hoverLift={true}
                  className="h-full flex flex-col justify-between group border-border/80 hover:border-primary/40"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        <Award className="w-5 h-5" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        {cert.date}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-display text-foreground tracking-tight group-hover:text-primary transition-colors mb-1">
                      {cert.title}
                    </h3>
                    <p className="text-sm font-medium text-accent mb-4 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{cert.issuer}</span>
                    </p>
                  </div>

                  {cert.credentialUrl && (
                    <div className="pt-3 border-t border-border/40">
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <span>Verify Credential</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-center glass-card p-8 sm:p-10 border-border/80">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold font-display text-foreground mb-2">
              Certifications in Progress
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Currently pursuing industry-standard certifications in Data Analytics, Python Programming, and Machine Learning. Verified credentials will be posted here once earned.
            </p>
            <Button variant="outline" href="#skills" size="md">
              View Verified Skills
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default CertificationsSection;
