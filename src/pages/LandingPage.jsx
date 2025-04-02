import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Github,
  Lock,
  Trash2,
  Settings,
  RefreshCw,
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                Manage GitHub repositories{" "}
                <span className="text-primary">at scale</span>
              </h1>
              <p className="text-xl mb-8 text-slate-600 dark:text-slate-300">
                GitPilot helps you perform bulk operations on your GitHub
                repositories, saving time and streamlining your workflow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-white font-medium text-lg hover:bg-primary/90 transition-colors"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-slate-300 dark:border-slate-700 font-medium text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="lg:w-1/2 lg:pl-16">
              <div className="rounded-xl shadow-2xl bg-white dark:bg-slate-800 overflow-hidden">
                <div className="p-1 bg-slate-100 dark:bg-slate-700">
                  <div className="flex space-x-2 px-3 py-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-6">
                  <img
                    src="/dashboard-preview.png"
                    alt="GitPilot Dashboard Preview"
                    className="rounded-md shadow-inner"
                    // Placeholder if image isn't available
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23f0f0f0%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23999%22%20font-family%3D%22Arial%2Csans-serif%22%20font-size%3D%2216%22%20text-anchor%3D%22middle%22%20x%3D%22200%22%20y%3D%22150%22%3EDashboard%20Preview%3C%2Ftext%3E%3C%2Fsvg%3E";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Streamline Your GitHub Management
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-md border border-gray-100 dark:border-slate-700">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                Bulk Visibility Changes
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Change multiple repositories from public to private (or vice
                versa) with just a few clicks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-md border border-gray-100 dark:border-slate-700">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Trash2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                Bulk Repository Deletion
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Clean up your GitHub account by removing multiple repositories
                at once.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-md border border-gray-100 dark:border-slate-700">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                Bulk Settings Management
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Update settings across multiple repositories simultaneously,
                saving valuable time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-slate-900 dark:text-white">
            Choose Your Plan
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-md border border-gray-100 dark:border-slate-700">
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                Free Plan
              </h3>
              <p className="text-primary text-3xl font-bold mb-4">$0</p>
              <p className="text-slate-600 dark:text-slate-300 mb-8">
                Perfect for individual developers
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <RefreshCw className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Personal repository management
                  </span>
                </li>
                <li className="flex items-center">
                  <RefreshCw className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Basic filters
                  </span>
                </li>
                <li className="flex items-center">
                  <RefreshCw className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Limited operations
                  </span>
                </li>
              </ul>

              <Link
                to="/login"
                className="block text-center py-3 px-6 rounded-md border-2 border-primary text-primary font-medium hover:bg-primary/5 transition-colors w-full"
              >
                Get Started
              </Link>
            </div>

            {/* Paid Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-md border-2 border-primary relative">
              <div className="absolute -top-4 right-4 bg-primary text-white text-sm font-medium py-1 px-3 rounded-full">
                Popular
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                Pro Plan
              </h3>
              <p className="text-primary text-3xl font-bold mb-4">
                $12<span className="text-base font-normal">/month</span>
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-8">
                For teams and organizations
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <RefreshCw className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Organization repository management
                  </span>
                </li>
                <li className="flex items-center">
                  <RefreshCw className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Advanced filters
                  </span>
                </li>
                <li className="flex items-center">
                  <RefreshCw className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Unlimited operations
                  </span>
                </li>
                <li className="flex items-center">
                  <RefreshCw className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Priority support
                  </span>
                </li>
              </ul>

              <Link
                to="/login"
                className="block text-center py-3 px-6 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors w-full"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to streamline your GitHub workflow?
          </h2>
          <p className="text-xl mb-10 text-white/80">
            Join thousands of developers who use GitPilot to manage their GitHub
            repositories efficiently.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-white text-primary font-medium text-lg hover:bg-gray-100 transition-colors"
          >
            <Github className="mr-2 h-5 w-5" />
            Sign in with GitHub
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 lg:px-24 bg-slate-900 text-white/70">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>
              &copy; {new Date().getFullYear()} GitPilot. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
