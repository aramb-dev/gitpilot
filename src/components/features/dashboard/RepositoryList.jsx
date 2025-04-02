import React, { useState, useEffect } from "react";
import { useRepositories } from "../../../hooks/useRepositories";
import RepositoryCard from "./RepositoryCard";
import RepositoryFilters from "./RepositoryFilters";
import BulkActionBar from "./BulkActionBar";
import EmptyState from "./EmptyState";
import { Pagination } from "../../common/Pagination";
import { Spinner } from "../../common/Spinner";
import { AlertTriangle } from "lucide-react";
import { Button } from "../../common/Button";

const RepositoryList = () => {
  const {
    filteredRepositories,
    selectedRepositories,
    loading,
    error,
    toggleRepositorySelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isSomeSelected,
    handleFilterChange,
    filters,
    fetchRepositories,
  } = useRepositories();

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastRepo = currentPage * itemsPerPage;
  const indexOfFirstRepo = indexOfLastRepo - itemsPerPage;
  const currentRepositories = filteredRepositories.slice(
    indexOfFirstRepo,
    indexOfLastRepo
  );
  const totalPages = Math.ceil(filteredRepositories.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Error loading repositories
        </h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => fetchRepositories(true)}>Try Again</Button>
      </div>
    );
  }

  if (filteredRepositories.length === 0) {
    return (
      <EmptyState
        filters={filters}
        onClearFilters={() => {
          Object.keys(filters).forEach((key) => handleFilterChange(key, ""));
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <RepositoryFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <BulkActionBar
        selectedCount={selectedRepositories.length}
        totalCount={filteredRepositories.length}
        isAllSelected={isAllSelected}
        isSomeSelected={isSomeSelected}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        selectedRepositories={selectedRepositories
          .map((id) => filteredRepositories.find((repo) => repo.id === id))
          .filter(Boolean)}
      />

      <div className="space-y-4">
        {currentRepositories.map((repository) => (
          <RepositoryCard
            key={repository.id}
            repository={repository}
            isSelected={selectedRepositories.includes(repository.id)}
            onToggleSelection={() => toggleRepositorySelection(repository.id)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default RepositoryList;
