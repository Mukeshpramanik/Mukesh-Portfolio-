import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { AskMukeshAI } from '@/components/ui/AskMukeshAI';
import './globals.css';

// Offline-safe font variable fallbacks
const inter = { variable: '--font-sans' };
const spaceGrotesk = { variable: '--font-display' };
const jetbrainsMono = { variable: '--font-mono' };

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0F' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://mukeshpramanik.github.io/Mukesh-Portfolio-'
  ),
  title: {
    default: 'Mukesh Pramanik | B.Tech CSE | Data Analytics & Python Developer',
    template: '%s | Mukesh Pramanik',
  },
  verification: {
    google: '84DggSOTmG8nbIbuFJsn8_Qba7_DguoT7gHHJ-gb-Wk',
  },
  description:
    'Portfolio of Mukesh Pramanik — B.Tech Computer Science Engineering student (2023–2027) focused on Data Analytics, Python, AI/ML, and Software Development.',
  keywords: [
    'Mukesh Pramanik',
    'B.Tech CSE',
    'Computer Science Engineering',
    'Data Analytics',
    'Python',
    'SQL',
    'Pandas',
    'Excel',
    'Power BI',
    'Machine Learning',
    'Portfolio',
  ],
  authors: [{ name: 'Mukesh Pramanik', url: 'https://github.com/Mukeshpramanik' }],
  creator: 'Mukesh Pramanik',
  publisher: 'Mukesh Pramanik',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mukeshpramanik.github.io/Mukesh-Portfolio-',
    title: 'Mukesh Pramanik | B.Tech CSE | Data Analytics & Python Developer',
    description:
      'Portfolio of Mukesh Pramanik — B.Tech Computer Science Engineering student (2023–2027) focused on Data Analytics, Python, AI/ML, and Software Development.',
    siteName: 'Mukesh Pramanik Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mukesh Pramanik Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mukesh Pramanik | B.Tech CSE | Data Analytics & Python Developer',
    description:
      'Portfolio of Mukesh Pramanik — B.Tech Computer Science Engineering student (2023–2027) focused on Data Analytics, Python, AI/ML, and Software Development.',
    images: ['/og-image.png'],
    creator: '@mukeshpramanik',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var t = localStorage.getItem('portfolio-theme') || localStorage.getItem('theme');
                if (t === 'dark') t = 'dark-premium';
                else if (t === 'light') t = 'minimal-light';
                var valid = ['dark-premium','minimal-light','purple-glass','cyberpunk-neon','ocean-blue','emerald-green','sunset','nord-arctic','dracula','midnight-black','rose-gold','forest-green','solarized','lavender-dream','monochrome','warm-sand','royal-purple','crimson-red','mint-fresh','amoled-black'];
                if (!t || valid.indexOf(t) === -1) {
                  t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'minimal-light' : 'dark-premium';
                }
                document.documentElement.setAttribute('data-theme', t);
                var lights = ['minimal-light','rose-gold','lavender-dream','warm-sand','mint-fresh'];
                if (lights.indexOf(t) !== -1) {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch(e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/30 selection:text-foreground">
        <ThemeProvider>
          {children}
          <CommandPalette />
          <ScrollToTop />
          <AskMukeshAI />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              className: '!bg-surface !text-foreground !border !border-border !shadow-xl !backdrop-blur-xl',
              style: {
                background: 'var(--surface)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
