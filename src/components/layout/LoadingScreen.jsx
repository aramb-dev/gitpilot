import React from "react";
import { Github } from "lucide-react";
import { Spinner } from "../common/Spinner";

/**
 * Full screen loading component
 */
const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center">
        <div className="mb-6 flex items-center">
          <Github className="h-10 w-10 text-primary animate-pulse" />
          <span className="ml-2 text-2xl font-bold text-slate-900 dark:text-white">
            GitPilot
          </span>
        </div>

        <Spinner size="xl" className="text-primary mb-4" />

        <p className="text-lg text-slate-600 dark:text-slate-300">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
