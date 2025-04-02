import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Lock,
  Unlock,
  Trash2,
  CheckSquare,
  SquareSlash,
  Settings,
  MoreHorizontal,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Star,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";
import { useUiStore } from "../store/uiStore";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    repositories,
    filteredRepositories,
    selectedRepositories,
    fetchRepositories,
    fetchOrganizations,
    toggleRepositorySelection,
    selectAllRepositories,
    clearSelection,
    setFilter,
    filters,
    repositoriesLoading,
    repositoriesError,
    organizations,
  } = useUserStore();

  const { openModal } = useUiStore();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch repositories and organizations when component mounts
  useEffect(() => {
    fetchRepositories();
    fetchOrganizations();
  }, [fetchRepositories, fetchOrganizations]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setFilter("search", e.target.value);
  };

  // Open bulk visibility modal
  const handleBulkVisibilityChange = (makePrivate) => {
    if (selectedRepositories.length === 0) {
      return;
    }

    openModal("bulkVisibility", {
      repositories: filteredRepositories.filter((repo) =>
        selectedRepositories.includes(repo.id)
      ),
      makePrivate,
    });
  };

  // Open bulk delete modal
  const handleBulkDelete = () => {
    if (selectedRepositories.length === 0) {
      return;
    }

    openModal("bulkDelete", {
      repositories: filteredRepositories.filter((repo) =>
        selectedRepositories.includes(repo.id)
      ),
    });
  };

  // Toggle all repositories selection
  const handleToggleSelectAll = () => {
    if (selectedRepositories.length === filteredRepositories.length) {
      clearSelection();
    } else {
      selectAllRepositories();
    }
  };

  // Check if all repositories are selected
  const allSelected =
    filteredRepositories.length > 0 &&
    selectedRepositories.length === filteredRepositories.length;

  // Check if some repositories are selected
  const someSelected =
    selectedRepositories.length > 0 &&
    selectedRepositories.length < filteredRepositories.length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your GitHub repositories
        </p>
      </div>

      {/* Repository Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Repositories
          </h3>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            {repositoriesLoading ? "..." : repositories.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Private Repositories
          </h3>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            {repositoriesLoading
              ? "..."
              : repositories.filter((repo) => repo.private).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Organizations
          </h3>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            {organizations.length}
          </p>
        </div>
      </div>

      {/* Repository Management Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Repository Management
          </h2>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Visibility Filter */}
            <select
              value={filters.visibility}
              onChange={(e) => setFilter("visibility", e.target.value)}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 text-slate-900 dark:text-white"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            {/* Owner Filter */}
            <select
              value={filters.owner}
              onChange={(e) => setFilter("owner", e.target.value)}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 text-slate-900 dark:text-white"
            >
              <option value="all">All Owners</option>
              <option value="user">Personal</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.login}>
                  {org.login}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => setFilter("type", e.target.value)}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 text-slate-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="sources">Sources</option>
              <option value="forks">Forks</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="p-4 flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggleSelectAll}
            className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            {allSelected ? (
              <>
                <SquareSlash className="h-4 w-4 mr-2" /> Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" /> Select All
              </>
            )}
          </button>

          <button
            onClick={() => handleBulkVisibilityChange(true)}
            disabled={selectedRepositories.length === 0}
            className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="h-4 w-4 mr-2" /> Make Private
          </button>

          <button
            onClick={() => handleBulkVisibilityChange(false)}
            disabled={selectedRepositories.length === 0}
            className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Unlock className="h-4 w-4 mr-2" /> Make Public
          </button>

          <button
            onClick={handleBulkDelete}
            disabled={selectedRepositories.length === 0}
            className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-900 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
          </button>

          <div className="ml-auto text-sm text-slate-500 dark:text-slate-400">
            {selectedRepositories.length} of {filteredRepositories.length}{" "}
            selected
          </div>
        </div>
      </div>

      {/* Repository List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Repositories{" "}
            {filteredRepositories.length > 0 &&
              `(${filteredRepositories.length})`}
          </h2>
        </div>

        {repositoriesLoading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Loading repositories...
            </p>
          </div>
        ) : repositoriesError ? (
          <div className="p-6 text-center text-red-600 dark:text-red-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{repositoriesError}</p>
            <button
              onClick={() => fetchRepositories(true)}
              className="mt-2 text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredRepositories.length === 0 ? (
          <div className="p-6 text-center text-slate-600 dark:text-slate-400">
            <p>No repositories found matching your filters.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilter("search", "");
              }}
              className="mt-2 text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="p-4 w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary dark:bg-slate-700"
                    />
                  </th>
                  <th className="p-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Repository
                  </th>
                  <th className="p-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Visibility
                  </th>
                  <th className="p-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Owner
                  </th>
                  <th className="p-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Updated
                  </th>
                  <th className="p-4 text-sm font-medium text-slate-500 dark:text-slate-400 w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredRepositories.map((repo) => (
                  <tr
                    key={repo.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedRepositories.includes(repo.id)}
                        onChange={() => toggleRepositorySelection(repo.id)}
                        className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary dark:bg-slate-700"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {repo.name}
                        </div>
                        {repo.stargazers_count > 0 && (
                          <div className="ml-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
                            <Star className="h-3.5 w-3.5 mr-1 fill-current text-yellow-400" />
                            {repo.stargazers_count}
                          </div>
                        )}
                      </div>
                      {repo.description && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-md">
                          {repo.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {repo.private ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                          <Unlock className="h-3 w-3 mr-1" />
                          Public
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <img
                          src={repo.owner.avatar_url}
                          alt={repo.owner.login}
                          className="h-5 w-5 rounded-full mr-2"
                        />
                        <span className="text-slate-900 dark:text-white">
                          {repo.owner.login}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(repo.updated_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            // Detail view or individual actions would go here
                          }}
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <MoreHorizontal className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page 1 of 1
          </span>
          <button className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
