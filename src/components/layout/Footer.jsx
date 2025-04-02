import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Mail } from 'lucide-react';

/**
 * Footer component
 * @param {boolean} minimal - Whether to show minimal footer (used in auth pages)
 */
const Footer = ({ minimal = false }) => {
  const currentYear = new Date().getFullYear();

  // Minimal footer for auth pages
  if (minimal) {
    return (
      <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {currentYear} GitPilot. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  // Full footer for main layout
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center">
              <Github className="h-6 w-6 text-primary" />
              <span className="ml-2 text-xl font-semibold text-slate-900 dark:text-white">
                GitPilot
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              Efficient bulk management solution for GitHub repositories.
            </p>
          </div>

          {/* Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/docs" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary">
                  API
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary">
                  Guides
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/about" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {currentYear} GitPilot. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://github.com" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://twitter.com" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="mailto:info@gitpilot.com" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
