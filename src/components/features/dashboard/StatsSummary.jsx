import React from "react";
import { Card, CardContent } from "../../common/Card";
import {
  ShieldCheck,
  Lock,
  Unlock,
  Archive,
  GitFork,
  Star,
  AlertTriangle,
} from "lucide-react";

const StatsSummary = ({ repositories, loading, error }) => {
  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!repositories || repositories.length === 0) {
      return {
        total: 0,
        private: 0,
        public: 0,
        forks: 0,
        archived: 0,
        stars: 0,
      };
    }

    return {
      total: repositories.length,
      private: repositories.filter((repo) => repo.private).length,
      public: repositories.filter((repo) => !repo.private).length,
      forks: repositories.filter((repo) => repo.fork).length,
      archived: repositories.filter((repo) => repo.archived).length,
      stars: repositories.reduce((acc, repo) => acc + repo.stargazers_count, 0),
    };
  }, [repositories]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
        <CardContent className="p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-400">
                Error loading statistics
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Total Repositories
              </p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
            <ShieldCheck className="h-8 w-8 text-primary opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Private Repositories
              </p>
              <h3 className="text-2xl font-bold">{stats.private}</h3>
            </div>
            <Lock className="h-8 w-8 text-amber-500 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Public Repositories
              </p>
              <h3 className="text-2xl font-bold">{stats.public}</h3>
            </div>
            <Unlock className="h-8 w-8 text-green-500 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Stars Received
              </p>
              <h3 className="text-2xl font-bold">{stats.stars}</h3>
            </div>
            <Star className="h-8 w-8 text-yellow-500 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Forked Repositories
              </p>
              <h3 className="text-2xl font-bold">{stats.forks}</h3>
            </div>
            <GitFork className="h-8 w-8 text-blue-500 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Archived Repositories
              </p>
              <h3 className="text-2xl font-bold">{stats.archived}</h3>
            </div>
            <Archive className="h-8 w-8 text-slate-500 opacity-80" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSummary;
