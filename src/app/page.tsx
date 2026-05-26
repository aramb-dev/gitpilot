'use client';

import {
  ArrowRight,
  Clock,
  GitBranch,
  Layers,
  Monitor,
  MousePointer2,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

export default function Home() {
  const handleSignIn = () => {
    void signIn('github', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-mono">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#000_1px,#000_2px)]" />

      {/* Header */}
      <header className="border-b border-[#333]">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <Monitor className="w-6 h-6 text-[#00ff00]" />
            <span className="text-lg font-bold tracking-tight">[GitPilot]</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8 text-sm">
            <Link href="#features" className="text-[#888] hover:text-white transition-colors">
              ./features
            </Link>
            <Link href="#faq" className="text-[#888] hover:text-white transition-colors">
              ./faq
            </Link>
          </nav>
          <Button
            type="button"
            onClick={handleSignIn}
            className="bg-[#00ff00] text-black hover:bg-[#00cc00] font-mono text-sm font-bold"
          >
              <GithubIcon className="w-4 h-4 mr-2" />
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-24 border-b border-[#1a1a1a]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl">
              <p className="text-[#00ff00] text-sm mb-6">$ ./init_landing.sh</p>
              <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                <span className="text-white">GITHUB</span>
                <span className="text-[#666]">_</span>
                <span className="text-[#00ff00]">AUTOMATION</span>
                <br />
                <span className="text-[#666]">//</span>{' '}
                <span className="text-white">GUI_FOR_REPOS</span>
              </h1>
              <p className="text-lg text-[#888] mb-10 max-w-2xl leading-relaxed font-mono">
                &gt; Visual dashboard for bulk repository management.
                <br />
                &gt; Click less. Automate more.
                <br />
                &gt; Beautiful interface for GitHub workflows.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={handleSignIn}
                  className="bg-white text-black hover:bg-[#ccc] font-mono text-sm px-6 py-6"
                >
                  &gt; LAUNCH_DASHBOARD
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="border-[#333] hover:bg-[#1a1a1a] font-mono text-sm px-6 py-6"
                >
                  cat README.md
                </Button>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="mt-20 bg-[#0d0d0d] border border-[#333] rounded overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#333] bg-[#0a0a0a]">
                <div className="w-3 h-3 rounded-full bg-[#333]" />
                <span className="text-xs text-[#666]">GitPilot Dashboard</span>
              </div>
              <div className="p-6">
                {/* Toolbar */}
                <div className="flex gap-2 mb-4 pb-4 border-b border-[#333]">
                  <div className="flex-1 h-8 bg-[#1a1a1a] rounded border border-[#333] flex items-center px-3 text-xs text-[#666]">
                    <MousePointer2 className="w-3 h-3 mr-2" />
                    Search repositories...
                  </div>
                  <div className="px-4 h-8 bg-[#00ff00] text-black text-xs font-bold rounded flex items-center">
                    Bulk Action
                  </div>
                </div>
                {/* Repo grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    'frontend',
                    'backend',
                    'api',
                    'docs',
                    'cli-tool',
                    'design',
                    'tests',
                    'scripts',
                  ].map((repo, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#1a1a1a] border border-[#333] rounded hover:border-[#00ff00] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white">{repo}</span>
                        <input type="checkbox" className="accent-[#00ff00]" />
                      </div>
                      <span className="text-xs text-[#666]">
                        public • {Math.floor(Math.random() * 50) + 1} stars
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 border-b border-[#1a1a1a]">
          <div className="container mx-auto px-6">
            <div className="mb-16">
              <p className="text-[#666] text-sm mb-4">/* FEATURE_SET */</p>
              <h2 className="text-2xl md:text-4xl font-bold text-white">const features = [</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-px bg-[#333] border border-[#333]">
              {[
                {
                  icon: Layers,
                  title: 'BULK_REPOS',
                  desc: 'Select multiple repos. Click once. Apply changes instantly.',
                  code: 'Click to select • Apply action',
                },
                {
                  icon: Monitor,
                  title: 'VISUAL_DASHBOARD',
                  desc: 'Beautiful unified interface for all your repositories.',
                  code: 'Grid view • List view • Filters',
                },
                {
                  icon: GitBranch,
                  title: 'ISSUE_PR_CTRL',
                  desc: 'Drag to select issues. Bulk label, assign, close.',
                  code: 'Multi-select • Batch operations',
                },
                {
                  icon: Shield,
                  title: 'SECURITY',
                  desc: 'GitHub OAuth. Minimal permissions. No code storage.',
                  code: "security.level = 'max'",
                },
                {
                  icon: Clock,
                  title: 'SCHEDULED',
                  desc: '[Roadmap] Set recurring jobs with a visual scheduler UI. Not yet available.',
                  code: 'status: roadmap',
                },
                {
                  icon: ArrowRight,
                  title: 'CLI_INTERFACE',
                  desc: '[Roadmap] Command-line interface for power users who live in the terminal.',
                  code: 'status: roadmap',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-[#0a0a0a] p-8 hover:bg-[#0f0f0f] transition-colors group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 border border-[#333] flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-[#00ff00]" />
                    </div>
                    <code className="text-xs text-[#666] bg-[#1a1a1a] px-2 py-1 group-hover:text-[#00ff00] transition-colors">
                      {feature.code}
                    </code>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#888]">{feature.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-2xl md:text-4xl font-bold text-white mt-8">];</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24">
          <div className="container mx-auto px-6 max-w-3xl">
            <p className="text-[#666] text-sm mb-8">/* FAQ_MODULE */</p>
            <p className="text-2xl md:text-3xl font-bold text-white mb-12">const faq = [</p>
            <Accordion type="single" collapsible className="space-y-px">
              {[
                {
                  q: 'is_gitpilot_secure',
                  a: 'true. GitHub OAuth. No password storage. Minimal permissions. Code never stored.',
                },
                {
                  q: 'handle_failure',
                  a: 'Jobs continue on failure. Detailed error reports returned. Retry specific failed repos from UI.',
                },
                {
                  q: 'org_support',
                  a: 'true. Grant GitHub App org access. Bulk actions on admin repos from one dashboard.',
                },
                {
                  q: 'cli_available',
                  a: 'roadmap. CLI is planned but not yet built. Star the repo on GitHub to follow progress.',
                },
              ].map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-t border-b border-[#333] bg-[#0a0a0a]"
                >
                  <AccordionTrigger className="px-6 py-5 font-mono text-sm text-left hover:no-underline hover:text-[#00ff00]">
                    <span className="text-[#666]">"{item.q}"</span>:
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 font-mono text-sm text-[#888]">
                    "{item.a}",
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="text-2xl md:text-3xl font-bold text-white mt-4">];</p>
          </div>
        </section>

        {/* Roadmap Banner */}
        <section className="py-16 border-y border-[#1a1a1a] bg-[#0d0d0d]">
          <div className="container mx-auto px-6 text-center">
            <p className="text-[#666] text-sm mb-4">/* ROADMAP */</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              <span className="text-[#00ff00]">&gt;</span> UPCOMING_FEATURES
              <span className="text-[#666]">: </span>
              <span className="text-yellow-500">PLANNED</span>
            </h2>
            <p className="text-[#888] max-w-lg mx-auto">
              CLI interface and scheduled bulk operations are on the roadmap. Star the repo on GitHub
              to follow progress.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 border-t border-[#1a1a1a] bg-[#0d0d0d]">
          <div className="container mx-auto px-6 text-center">
            <p className="text-[#00ff00] text-sm mb-6">$ ./start.sh</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">&gt; READY_TO_BEGIN?</h2>
            <p className="text-[#888] mb-10 max-w-xl mx-auto">
              Stop clicking. Start automating. Your GitHub workflow awaits.
            </p>
            <Button
              onClick={handleSignIn}
              className="bg-[#00ff00] text-black hover:bg-[#00cc00] font-mono text-sm font-bold px-8 py-6"
            >
              <GithubIcon className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#333] py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#666] font-mono">
          <p>// © 2025 GitPilot</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[#00ff00] transition-colors">
              PRIVACY_PROTOCOL
            </Link>
            <Link href="#" className="hover:text-[#00ff00] transition-colors">
              TERMS_OF_SERVICE
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
