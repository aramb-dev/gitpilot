import React from "react";
import { FolderSearch, Github, RefreshCw, Filter } from "lucide-react";
import { Button } from "../../common/Button";
import { Card, CardContent } from "../../common/Card";

const EmptyState = ({ filters, onClearFilters }) => {
  // Check if we have active filters
  const hasFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "search" && value) return true;
    if (key !== "search" && value !== "all") return true;
    return false;
  });

  return (
    <Card className="w-full bg-slate-50 dark:bg-slate-800/50">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {hasFilters ? (
          <>
            <FolderSearch className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No repositories found
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              We couldn't find any repositories matching your current filters.
              Try adjusting your search or filters to see more results.
            </p>
            <Button onClick={onClearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </>
        ) : (
          <>
            <Github className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No repositories yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              You don't have any GitHub repositories yet, or we couldn't access
              them. Create a repository on GitHub or check your permissions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.open("https://github.com/new", "_blank")}
              >
                Create Repository on GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
