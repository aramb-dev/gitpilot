import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { revokeGitHubAccess } from "../services/auth";
import {
  Save,
  Moon,
  Sun,
  Github,
  LogOut,
  AlertTriangle,
  Check,
} from "lucide-react";

const SettingsPage = () => {
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme, addToast } = useUiStore();

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
    },
    preferences: {
      showArchivedRepos: false,
      defaultVisibility: "last-used",
      bulkOperationConfirmation: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle form input changes
  const handleSettingChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    setLoading(true);
    setSaveSuccess(false);

    try {
      // This would actually save to Firebase in a real implementation
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API call

      addToast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
        type: "success",
      });

      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      addToast({
        title: "Error saving settings",
        description: error.message || "Please try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle GitHub account disconnect
  const handleDisconnectGitHub = async () => {
    if (
      window.confirm(
        "Are you sure you want to disconnect your GitHub account? This will revoke GitPilot's access to your GitHub account."
      )
    ) {
      try {
        setLoading(true);
        await revokeGitHubAccess();
        await signOut();
      } catch (error) {
        addToast({
          title: "Error disconnecting account",
          description: error.message || "Please try again later.",
          type: "error",
        });
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Profile
          </h2>
        </div>

        <div className="p-6">
          {user && (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-20 h-20 rounded-full"
              />

              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {user.displayName}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {user.email}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleDisconnectGitHub}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    Disconnect GitHub
                  </button>

                  <button
                    onClick={signOut}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-900 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Notifications
          </h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium text-slate-900 dark:text-white">
                  Email Notifications
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Receive email notifications about completed bulk operations
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notifications.email}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "email",
                      e.target.checked
                    )
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 dark:peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium text-slate-900 dark:text-white">
                  Browser Notifications
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Show browser notifications when bulk operations complete
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notifications.browser}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "browser",
                      e.target.checked
                    )
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 dark:peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Preferences
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium text-slate-900 dark:text-white">
                Show Archived Repositories
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Include archived repositories in repository lists
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.preferences.showArchivedRepos}
                onChange={(e) =>
                  handleSettingChange(
                    "preferences",
                    "showArchivedRepos",
                    e.target.checked
                  )
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 dark:peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="space-y-2">
            <h3 className="text-md font-medium text-slate-900 dark:text-white">
              Default Visibility for New Repositories
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Choose the default visibility option when changing repository
              visibility
            </p>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  name="defaultVisibility"
                  value="last-used"
                  checked={
                    settings.preferences.defaultVisibility === "last-used"
                  }
                  onChange={() =>
                    handleSettingChange(
                      "preferences",
                      "defaultVisibility",
                      "last-used"
                    )
                  }
                />
                <span className="ml-2 text-slate-700 dark:text-slate-300">
                  Remember last used
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  name="defaultVisibility"
                  value="private"
                  checked={settings.preferences.defaultVisibility === "private"}
                  onChange={() =>
                    handleSettingChange(
                      "preferences",
                      "defaultVisibility",
                      "private"
                    )
                  }
                />
                <span className="ml-2 text-slate-700 dark:text-slate-300">
                  Private
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  name="defaultVisibility"
                  value="public"
                  checked={settings.preferences.defaultVisibility === "public"}
                  onChange={() =>
                    handleSettingChange(
                      "preferences",
                      "defaultVisibility",
                      "public"
                    )
                  }
                />
                <span className="ml-2 text-slate-700 dark:text-slate-300">
                  Public
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium text-slate-900 dark:text-white">
                Confirm Bulk Operations
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Show confirmation dialog before executing bulk operations
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.preferences.bulkOperationConfirmation}
                onChange={(e) =>
                  handleSettingChange(
                    "preferences",
                    "bulkOperationConfirmation",
                    e.target.checked
                  )
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 dark:peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Appearance
          </h2>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium text-slate-900 dark:text-white">
                Dark Mode
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Toggle between light and dark theme
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4 mr-2" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" /> Dark Mode
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-red-200 dark:border-red-900/50 mb-6">
        <div className="p-4 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-t-lg">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </h2>
        </div>

        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            These actions are destructive and cannot be undone.
          </p>

          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to delete your account? This action cannot be undone."
                )
              ) {
                // In a real implementation, this would call a function to delete the user's account
                addToast({
                  title: "Account deletion initiated",
                  description: "Your account will be deleted within 24 hours.",
                  type: "info",
                });
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-900 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
            saveSuccess
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-primary hover:bg-primary/90 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Saving...
            </span>
          ) : saveSuccess ? (
            <span className="flex items-center">
              <Check className="mr-2 h-4 w-4" />
              Saved
            </span>
          ) : (
            <span className="flex items-center">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
