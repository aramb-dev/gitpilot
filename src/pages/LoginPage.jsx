import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Github, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInWithGitHub, loading, error } = useAuthStore();
  const [loginError, setLoginError] = useState(null);

  // Check if there's an error from the callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorMsg = params.get("error");
    if (errorMsg) {
      setLoginError(decodeURIComponent(errorMsg));
    }
  }, [location]);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleGitHubLogin = async () => {
    try {
      await signInWithGitHub();
    } catch (err) {
      setLoginError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome to GitPilot
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Sign in to start managing your GitHub repositories
          </p>
        </div>

        {(error || loginError) && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error || loginError}</span>
          </div>
        )}

        <button
          onClick={handleGitHubLogin}
          disabled={loading}
          className="w-full flex items-center justify-center py-3 px-4 bg-[#24292e] hover:bg-[#2c3136] text-white rounded-md font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            <span className="flex items-center">
              <Github className="mr-2 h-5 w-5" />
              Sign in with GitHub
            </span>
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            By signing in, you agree to our
            <a href="#" className="text-primary hover:underline ml-1">
              Terms of Service
            </a>
            <span className="mx-1">and</span>
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <h2 className="font-medium text-slate-900 dark:text-white mb-2">
              GitPilot needs these GitHub permissions:
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Read and write access to repositories</li>
              <li>Delete access to repositories (for bulk deletion)</li>
              <li>Read access to organization information</li>
              <li>Read access to user information</li>
            </ul>
            <p className="mt-2">
              We only request permissions that are necessary for GitPilot to
              function properly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
