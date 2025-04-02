import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../../common/Card";
import { Button } from "../../common/Button";
import { Modal, ConfirmationModal } from "../../common/Modal";
import { Alert } from "../../common/Alert";
import { AlertTriangle, Trash2, LogOut, ArchiveX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { revokeGitHubAccess } from "../../../services/auth";

/**
 * Danger zone component for destructive account actions
 */
const DangerZone = () => {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [clearDataModalOpen, setClearDataModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle GitHub access revocation
  const handleRevokeAccess = async () => {
    setLoading(true);
    setError(null);

    try {
      await revokeGitHubAccess();
      await signOut();
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to revoke GitHub access");
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call a Firebase function to delete the user's account
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      await signOut();
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setLoading(false);
      setDeleteModalOpen(false);
    }
  };

  // Handle clearing application data
  const handleClearData = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would clear the user's data from Firebase
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setClearDataModalOpen(false);
      setLoading(false);
      window.location.reload(); // Refresh the page to show cleared data
    } catch (err) {
      setError(err.message || "Failed to clear application data");
      setLoading(false);
      setClearDataModalOpen(false);
    }
  };

  return (
    <>
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/50">
          <CardTitle className="text-red-700 dark:text-red-400 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {error && (
            <Alert variant="error" title="Error" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="border border-red-200 dark:border-red-900/50 rounded-md p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-medium">Revoke GitHub Access</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Remove GitPilot's access to your GitHub account. You can
                  reconnect anytime.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30 sm:w-auto"
                onClick={() => setRevokeModalOpen(true)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Revoke Access
              </Button>
            </div>
          </div>

          <div className="border border-red-200 dark:border-red-900/50 rounded-md p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-medium">
                  Clear Application Data
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Reset all application settings and cached data. Your GitHub
                  repositories won't be affected.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30 sm:w-auto"
                onClick={() => setClearDataModalOpen(true)}
              >
                <ArchiveX className="h-4 w-4 mr-2" />
                Clear Data
              </Button>
            </div>
          </div>

          <div className="border border-red-200 dark:border-red-900/50 rounded-md p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-medium">Delete Account</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your GitPilot account and all associated
                  data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                className="sm:w-auto"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revoke GitHub Access Modal */}
      <ConfirmationModal
        isOpen={revokeModalOpen}
        onClose={() => setRevokeModalOpen(false)}
        onConfirm={handleRevokeAccess}
        title="Revoke GitHub Access"
        confirmText="Revoke Access"
        confirmVariant="destructive"
        isLoading={loading}
      >
        <Alert
          variant="warning"
          title="You are about to revoke GitPilot's access to your GitHub account"
          className="mb-4"
        >
          <p className="mt-2">
            After revoking access, GitPilot will no longer be able to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Access your repositories</li>
            <li>Perform bulk operations</li>
            <li>Manage your GitHub settings</li>
          </ul>
          <p className="mt-2">
            You will be signed out and will need to sign in again to reconnect
            your GitHub account.
          </p>
        </Alert>
      </ConfirmationModal>

      {/* Clear Data Modal */}
      <ConfirmationModal
        isOpen={clearDataModalOpen}
        onClose={() => setClearDataModalOpen(false)}
        onConfirm={handleClearData}
        title="Clear Application Data"
        confirmText="Clear Data"
        confirmVariant="destructive"
        isLoading={loading}
      >
        <Alert
          variant="warning"
          title="You are about to clear all application data"
          className="mb-4"
        >
          <p className="mt-2">
            This will reset all your GitPilot settings and clear any cached
            data, including:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>User preferences</li>
            <li>Filter settings</li>
            <li>Saved views and reports</li>
          </ul>
          <p className="mt-2">
            Your GitHub repositories and account won't be affected, but you'll
            need to reconfigure your preferences.
          </p>
        </Alert>
      </ConfirmationModal>

      {/* Delete Account Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Your Account"
        confirmText="Delete Account"
        confirmVariant="destructive"
        isLoading={loading}
      >
        <Alert
          variant="error"
          title="This action cannot be undone"
          className="mb-4"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>
              Your account and all associated data will be permanently deleted.
            </span>
          </div>
        </Alert>

        <p className="mb-4">Once you delete your GitPilot account:</p>

        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>All your GitPilot settings and preferences will be lost</li>
          <li>Your account information will be removed from our database</li>
          <li>You'll lose access to any paid features you've purchased</li>
        </ul>

        <p className="mb-4">
          Your GitHub repositories and account won't be affected. You can always
          create a new GitPilot account in the future.
        </p>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              required
            />
            <span className="ml-2 text-sm">
              I understand that this action cannot be undone
            </span>
          </label>
        </div>
      </ConfirmationModal>
    </>
  );
};

export default DangerZone;
