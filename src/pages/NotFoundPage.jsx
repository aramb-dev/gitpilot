import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Github } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const NotFoundPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-primary mb-4">
          <svg
            className="mx-auto h-24 w-24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
          Page Not Found
        </h2>

        <p className="mb-8 text-slate-600 dark:text-slate-400">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={user ? "/dashboard" : "/"}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            {user ? (
              <>
                <Home className="mr-2 h-5 w-5" />
                Go to Dashboard
              </>
            ) : (
              <>
                <Home className="mr-2 h-5 w-5" />
                Go to Home
              </>
            )}
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </button>
        </div>

        {!user && (
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="mb-4 text-slate-600 dark:text-slate-400">
              New to GitPilot?
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#24292e] hover:bg-[#2c3136] text-white font-medium transition-colors"
            >
              <Github className="mr-2 h-5 w-5" />
              Sign in with GitHub
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFoundPage;
