'use client'

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Github,
  ArrowRight,
  Monitor,
  Shield,
  GitBranch,
  Clock,
  Layers,
  MousePointer2
} from "lucide-react";

export default function Home() {
  const handleSignIn = () => {
    void signIn("github", { callbackUrl: "/dashboard" });
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
            <Link href="#features" className="text-[#888] hover:text-white transition-colors">./features</Link>
            <Link href="#faq" className="text-[#888] hover:text-white transition-colors">./faq</Link>
          </nav>
          <Button
            type="button"
            onClick={handleSignIn}
            className="bg-[#00ff00] text-black hover:bg-[#00cc00] font-mono text-sm font-bold"
          >
            <Github className="w-4 h-4 mr-2" />
            GITHUB_LOGIN
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
                <span className="text-[#666]">//</span> <span className="text-white">GUI_FOR_REPOS</span>
              </h1>
              <p className="text-lg text-[#888] mb-10 max-w-2xl leading-relaxed font-mono">
                &gt; Visual dashboard for bulk repository management.<br />
                &gt; Click less. Automate more.<br />
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
                  {['frontend', 'backend', 'api', 'docs', 'cli-tool', 'design', 'tests', 'scripts'].map((repo, i) => (
                    <div key={i} className="p-3 bg-[#1a1a1a] border border-[#333] rounded hover:border-[#00ff00] transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white">{repo}</span>
                        <input type="checkbox" className="accent-[#00ff00]" />
                      </div>
                      <span className="text-xs text-[#666]">public • {Math.floor(Math.random() * 50) + 1} stars</span>
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
              <h2 className="text-2xl md:text-4xl font-bold text-white">
                const features = [
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-px bg-[#333] border border-[#333]">
              {[
                { icon: Layers, title: "BULK_REPOS", desc: "Select multiple repos. Click once. Apply changes instantly.", code: "Click to select • Apply action" },
                { icon: Monitor, title: "VISUAL_DASHBOARD", desc: "Beautiful unified interface for all your repositories.", code: "Grid view • List view • Filters" },
                { icon: GitBranch, title: "ISSUE_PR_CTRL", desc: "Drag to select issues. Bulk label, assign, close.", code: "Multi-select • Batch operations" },
                { icon: Shield, title: "SECURITY", desc: "GitHub OAuth. Minimal permissions. No code storage.", code: "security.level = 'max'" },
                { icon: Clock, title: "SCHEDULED", desc: "Set recurring jobs with visual scheduler UI.", code: "Cron UI • One-click setup" },
                { icon: ArrowRight, title: "CLI_SOON", desc: "Command-line interface coming soon for power users.", code: "Coming soon • Join waitlist" },
              ].map((feature, i) => (
                <div key={i} className="bg-[#0a0a0a] p-8 hover:bg-[#0f0f0f] transition-colors group">
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
                { q: "is_gitpilot_secure", a: "true. GitHub OAuth. No password storage. Minimal permissions. Code never stored." },
                { q: "handle_failure", a: "Jobs continue on failure. Detailed error reports returned. Retry specific failed repos from UI." },
                { q: "org_support", a: "true. Grant GitHub App org access. Bulk actions on admin repos from one dashboard." },
                { q: "cli_available", a: "soon. CLI is in development. Join waitlist for early access when it launches." },
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-t border-b border-[#333] bg-[#0a0a0a]">
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

        {/* CLI Coming Soon Banner */}
        <section className="py-16 border-y border-[#1a1a1a] bg-[#0d0d0d]">
          <div className="container mx-auto px-6 text-center">
            <p className="text-[#666] text-sm mb-4">/* ROADMAP */</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              <span className="text-[#00ff00]">&gt;</span> CLI_INTERFACE
              <span className="text-[#666]">: </span>
              <span className="text-yellow-500">DEV_IN_PROGRESS</span>
            </h2>
            <p className="text-[#888] max-w-lg mx-auto">
              Power user? We're building a full-featured CLI. Join the waitlist to be notified when it launches.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 border-t border-[#1a1a1a] bg-[#0d0d0d]">
          <div className="container mx-auto px-6 text-center">
            <p className="text-[#00ff00] text-sm mb-6">$ ./start.sh</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              &gt; READY_TO_BEGIN?
            </h2>
            <p className="text-[#888] mb-10 max-w-xl mx-auto">
              Stop clicking. Start automating. Your GitHub workflow awaits.
            </p>
            <Button
              onClick={handleSignIn}
              className="bg-[#00ff00] text-black hover:bg-[#00cc00] font-mono text-sm font-bold px-8 py-6"
            >
              <Github className="w-4 h-4 mr-2" />
              LAUNCH_DASHBOARD
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#333] py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#666] font-mono">
          <p>// © 2025 GitPilot</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[#00ff00] transition-colors">PRIVACY_PROTOCOL</Link>
            <Link href="#" className="hover:text-[#00ff00] transition-colors">TERMS_OF_SERVICE</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
