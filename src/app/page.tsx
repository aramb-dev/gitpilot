'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Github,
  Send,
  BookLock,
  LayoutDashboard,
  Users,
  GitPullRequestDraft,
  ShieldCheck,
  Clock,
  CheckCircle
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117] bg-opacity-80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Send className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">GitPilot</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-400 hover:text-white transition">Features</Link>
            <Link href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</Link>
            <Link href="#faq" className="text-gray-400 hover:text-white transition">FAQ</Link>
          </nav>
          <Button variant="outline" className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold border-gray-700">
            <Github className="w-4 h-4" />
            <span>Sign in with GitHub</span>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 text-center">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                Your <span className="gradient-text">Command Center</span> for GitHub
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Manage dozens of repositories, issues, and pull requests in bulk. Stop the repetitive clicks,
                start the automation.
              </p>
              <div className="flex justify-center items-center space-x-4">
                <Button className="cta-button text-white font-bold py-3 px-8 rounded-lg text-lg">
                  Get Started for Free
                </Button>
              </div>
            </div>

            {/* Product Mockup */}
            <div className="mt-16 mx-auto max-w-6xl p-2 rounded-xl gradient-border">
              <div className="bg-[#0d1117] rounded-lg shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="w-full h-96 bg-[#0d1117] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <LayoutDashboard className="w-24 h-24 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">GitPilot Dashboard UI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-black bg-opacity-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Tired of Repetitive GitHub Tasks?</h2>
              <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">
                GitPilot automates the manual work, so you can focus on what matters: building.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card p-8 rounded-xl transform hover:scale-105 transition-transform duration-300">
                <div className="feature-icon w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <BookLock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Bulk Repository Actions</h3>
                <p className="text-gray-400">
                  Make dozens of repositories private or public, archive old projects, or clean up your account
                  with bulk deletion in just a few clicks.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-8 rounded-xl transform hover:scale-105 transition-transform duration-300">
                <div className="feature-icon w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Powerful Dashboard</h3>
                <p className="text-gray-400">
                  Instantly search, filter, and select from all your personal and organization repositories
                  in a single, unified interface.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-8 rounded-xl transform hover:scale-105 transition-transform duration-300">
                <div className="feature-icon w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Team Management</h3>
                <p className="text-gray-400">
                  Onboard new team members or manage access by adding or removing collaborators across
                  multiple repositories at once. (Coming soon)
                </p>
              </div>

              {/* Feature 4 */}
              <div className="card p-8 rounded-xl transform hover:scale-105 transition-transform duration-300">
                <div className="feature-icon w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <GitPullRequestDraft className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Bulk Issue & PR Control</h3>
                <p className="text-gray-400">
                  Add labels, assignees, or close stale issues and pull requests across all your projects
                  to maintain a clean workflow.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="card p-8 rounded-xl transform hover:scale-105 transition-transform duration-300">
                <div className="feature-icon w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Secure by Design</h3>
                <p className="text-gray-400">
                  We use GitHub OAuth and request minimal permissions. We never store your code,
                  only the metadata needed to perform actions.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="card p-8 rounded-xl transform hover:scale-105 transition-transform duration-300">
                <div className="feature-icon w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Scheduled Actions</h3>
                <p className="text-gray-400">
                  Set up recurring jobs to automatically archive inactive repositories or clean up stale
                  pull requests, keeping your GitHub organized effortlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Simple, Transparent Pricing</h2>
              <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">
                Choose the plan that fits your needs. Free for personal use, forever.
              </p>
            </div>
            <div className="flex flex-col lg:flex-row justify-center gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="card p-8 rounded-xl border-2 border-gray-700 w-full lg:w-1/2">
                <h3 className="text-2xl font-bold text-white">Pilot</h3>
                <p className="text-gray-400 mt-2 mb-6">For individual developers and small projects.</p>
                <p className="text-5xl font-extrabold text-white mb-6">Free</p>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Manage personal repositories
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    All core bulk repo actions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    10 bulk jobs per month
                  </li>
                </ul>
                <Button className="mt-8 w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold">
                  Get Started
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="card p-8 rounded-xl border-2 border-blue-500 w-full lg:w-1/2 relative">
                <div className="absolute top-0 right-8 -mt-4 bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-bold text-white">Commander</h3>
                <p className="text-gray-400 mt-2 mb-6">For professional teams and organizations.</p>
                <p className="text-5xl font-extrabold text-white mb-1">$12</p>
                <p className="text-gray-400 font-medium -mt-4 mb-6">per user / month</p>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Manage organization repositories
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Unlimited bulk jobs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Bulk collaborator management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Scheduled actions & audit logs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Priority support
                  </li>
                </ul>
                <Button className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold">
                  Start Pro Trial
                </Button>
              </div>
            </div>
            <p className="text-center text-gray-400 mt-8">
              Need custom integrations or SSO? <Link href="#" className="text-blue-400 hover:underline">Contact us for an Enterprise plan</Link>.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-black bg-opacity-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-6">
              <AccordionItem value="item-1" className="card rounded-lg p-6 border-0">
                <AccordionTrigger className="font-semibold text-lg text-white">
                  Is GitPilot secure?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 mt-4">
                  Absolutely. Security is our top priority. We use GitHub&apos;s official OAuth app for
                  authentication, which means we never see or store your GitHub password. We only request the
                  minimum permissions necessary to perform actions on your behalf and we never clone or store
                  your source code.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="card rounded-lg p-6 border-0">
                <AccordionTrigger className="font-semibold text-lg text-white">
                  What happens when a bulk action fails?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 mt-4">
                  GitPilot is designed for resilience. If an action on a specific repository fails (e.g., due
                  to permissions), the bulk job will continue with the rest of the repositories. You&apos;ll
                  receive a detailed report of which actions succeeded and which failed, along with the error
                  message from GitHub, so you can easily debug and retry.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="card rounded-lg p-6 border-0">
                <AccordionTrigger className="font-semibold text-lg text-white">
                  Can I use this for my company&apos;s GitHub organization?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 mt-4">
                  Yes! The Commander plan is built specifically for teams and organizations. You&apos;ll need to
                  grant the GitPilot GitHub App access to your organization, and then you can perform bulk
                  actions on any repositories you have administrative access to.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Reclaim Your Time and Tame GitHub</h2>
            <p className="text-lg text-gray-400 mt-4 mb-8 max-w-2xl mx-auto">
              Get back to coding. Let GitPilot handle the administrative overhead.
            </p>
            <Button className="cta-button text-white font-bold py-4 px-10 rounded-lg text-xl">
              Sign Up with GitHub for Free
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400">&copy; 2025 GitPilot. All rights reserved.</p>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="#" className="text-gray-500 hover:text-white transition">Privacy Policy</Link>
            <Link href="#" className="text-gray-500 hover:text-white transition">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
