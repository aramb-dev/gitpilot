import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../../common/Card";
import { Button } from "../../common/Button";
import { Alert } from "../../common/Alert";
import { Select } from "../../common/Select";
import { Save, Check } from "lucide-react";

/**
 * User preferences settings form
 * Allows configuring application behavior
 */
const PreferencesForm = () => {
  const [preferences, setPreferences] = useState({
    defaultView: "list",
    resultsPerPage: "20",
    confirmBulkActions: true,
    showArchivedRepos: false,
    defaultSortOrder: "updated",
    defaultVisibility: "last-used",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // In a real implementation, this would save to the user's preferences in Firebase
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API call

      // Update success state
      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes
  const handleChange = (name, value) => {
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name) => {
    setPreferences((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>User Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        {saveSuccess && (
          <Alert variant="success" title="Preferences Saved" className="mb-4">
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              Your preferences have been successfully saved.
            </div>
          </Alert>
        )}

        {error && (
          <Alert
            variant="error"
            title="Error Saving Preferences"
            className="mb-4"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="defaultView"
                  className="block text-sm font-medium mb-1"
                >
                  Default Repository View
                </label>
                <Select
                  id="defaultView"
                  value={preferences.defaultView}
                  onChange={(e) => handleChange("defaultView", e.target.value)}
                >
                  <option value="list">List View</option>
                  <option value="grid">Grid View</option>
                  <option value="compact">Compact List</option>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="resultsPerPage"
                  className="block text-sm font-medium mb-1"
                >
                  Results Per Page
                </label>
                <Select
                  id="resultsPerPage"
                  value={preferences.resultsPerPage}
                  onChange={(e) =>
                    handleChange("resultsPerPage", e.target.value)
                  }
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="defaultSortOrder"
                  className="block text-sm font-medium mb-1"
                >
                  Default Sort Order
                </label>
                <Select
                  id="defaultSortOrder"
                  value={preferences.defaultSortOrder}
                  onChange={(e) =>
                    handleChange("defaultSortOrder", e.target.value)
                  }
                >
                  <option value="updated">Last Updated</option>
                  <option value="created">Created Date</option>
                  <option value="name">Repository Name</option>
                  <option value="stars">Stars</option>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="defaultVisibility"
                  className="block text-sm font-medium mb-1"
                >
                  Default Visibility for New Repositories
                </label>
                <Select
                  id="defaultVisibility"
                  value={preferences.defaultVisibility}
                  onChange={(e) =>
                    handleChange("defaultVisibility", e.target.value)
                  }
                >
                  <option value="last-used">Remember Last Used</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="confirmBulkActions"
                  checked={preferences.confirmBulkActions}
                  onChange={() => handleCheckboxChange("confirmBulkActions")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="confirmBulkActions"
                  className="ml-2 block text-sm"
                >
                  Confirm before executing bulk actions
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showArchivedRepos"
                  checked={preferences.showArchivedRepos}
                  onChange={() => handleCheckboxChange("showArchivedRepos")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="showArchivedRepos"
                  className="ml-2 block text-sm"
                >
                  Show archived repositories in lists by default
                </label>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Preferences
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PreferencesForm;
