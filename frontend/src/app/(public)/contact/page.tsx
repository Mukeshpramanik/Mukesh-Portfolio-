import React from 'react';
import { PageTransition } from '@/components/layout/PageTransition';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ContactSection } from '@/components/sections/ContactSection';
import { Card } from '@/components/ui/Card';
import { MapPin, Globe, Clock, ShieldCheck, Mail, Send } from 'lucide-react';

export const metadata = {
  title: 'Contact',
  description:
    'Get in touch with Mukesh Pramanik — B.Tech CSE student, data analytics enthusiast, and Python developer.',
};

export default function ContactPage() {
  return (
    <PageTransition>
      <div className="py-24 sm:py-32 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Contact Section */}
          <ContactSection />

          {/* Location & Availability Information Cards */}
          <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              variant="glass"
              padding="md"
              hoverLift={true}
              className="border-border/80"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground font-display text-sm">
                    Geographic Base
                  </h4>
                  <p className="text-xs text-muted font-mono">India</p>
                </div>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Open to on-site opportunities in India as well as remote internships worldwide.
              </p>
            </Card>

            <Card
              variant="glass"
              padding="md"
              hoverLift={true}
              className="border-border/80"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground font-display text-sm">
                    Time Zone
                  </h4>
                  <p className="text-xs text-accent font-mono">IST (UTC +5:30)</p>
                </div>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Flexible working hours with convenient overlap for US, EU, and APAC team collaborations.
              </p>
            </Card>

            <Card
              variant="glass"
              padding="md"
              hoverLift={true}
              className="border-border/80"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground font-display text-sm">
                    Response Window
                  </h4>
                  <p className="text-xs text-emerald-400 font-mono">Within 24 Hours</p>
                </div>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Direct emails reach Mukesh promptly. Please send directly via email to ensure message delivery on this static site.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
