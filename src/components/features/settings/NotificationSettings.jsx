import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../../common/Card";
import { Button } from "../../common/Button";
import { Alert } from "../../common/Alert";
import { Save, BellRing, Mail, Check } from "lucide-react";

/**
 * Notification preferences settings
 * Configures how the user receives updates and alerts
 */
const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    email: {
      bulkOperationComplete: true,
      operationFailure: true,
      weeklyDigest: false,
      newFeatures: true,
    },
    browser: {
      bulkOperationComplete: true,
      operationFailure: true,
      rateLimit: true,
    },
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
      setError(err.message || "Failed to save notification settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggling a notification setting
  const handleToggle = (channel, setting) => {
    setNotifications((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [setting]: !prev[channel][setting],
      },
    }));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {saveSuccess && (
          <Alert
            variant="success"
            title="Notification Settings Saved"
            className="mb-4"
          >
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              Your notification preferences have been successfully saved.
            </div>
          </Alert>
        )}

        {error && (
          <Alert variant="error" title="Error Saving Settings" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium flex items-center mb-4">
                <Mail className="h-5 w-5 mr-2" />
                Email Notifications
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="email-bulkOperationComplete"
                      className="text-sm font-medium"
                    >
                      Bulk operation completed
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Receive an email when a bulk operation is completed
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="email-bulkOperationComplete"
                      className="sr-only peer"
                      checked={notifications.email.bulkOperationComplete}
                      onChange={() =>
                        handleToggle("email", "bulkOperationComplete")
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="email-operationFailure"
                      className="text-sm font-medium"
                    >
                      Operation failures
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Receive an email when an operation fails
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="email-operationFailure"
                      className="sr-only peer"
                      checked={notifications.email.operationFailure}
                      onChange={() => handleToggle("email", "operationFailure")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="email-weeklyDigest"
                      className="text-sm font-medium"
                    >
                      Weekly digest
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Receive a weekly summary of your repository activities
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="email-weeklyDigest"
                      className="sr-only peer"
                      checked={notifications.email.weeklyDigest}
                      onChange={() => handleToggle("email", "weeklyDigest")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="email-newFeatures"
                      className="text-sm font-medium"
                    >
                      New features and updates
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Receive emails about new GitPilot features and updates
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="email-newFeatures"
                      className="sr-only peer"
                      checked={notifications.email.newFeatures}
                      onChange={() => handleToggle("email", "newFeatures")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium flex items-center mb-4">
                <BellRing className="h-5 w-5 mr-2" />
                Browser Notifications
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="browser-bulkOperationComplete"
                      className="text-sm font-medium"
                    >
                      Bulk operation completed
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Show a browser notification when a bulk operation is
                      completed
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="browser-bulkOperationComplete"
                      className="sr-only peer"
                      checked={notifications.browser.bulkOperationComplete}
                      onChange={() =>
                        handleToggle("browser", "bulkOperationComplete")
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="browser-operationFailure"
                      className="text-sm font-medium"
                    >
                      Operation failures
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Show a browser notification when an operation fails
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="browser-operationFailure"
                      className="sr-only peer"
                      checked={notifications.browser.operationFailure}
                      onChange={() =>
                        handleToggle("browser", "operationFailure")
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="browser-rateLimit"
                      className="text-sm font-medium"
                    >
                      API rate limit warnings
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Show a notification when GitHub API rate limits are close
                      to exhaustion
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="browser-rateLimit"
                      className="sr-only peer"
                      checked={notifications.browser.rateLimit}
                      onChange={() => handleToggle("browser", "rateLimit")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Notification Settings
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

export default NotificationSettings;
