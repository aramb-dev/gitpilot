import React, { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "../../common/Card";
import { Button } from "../../common/Button";
import { Input } from "../../common/Input";
import { Alert } from "../../common/Alert";
import UserAvatar from "../auth/UserAvatar";
import { Github, Save, User, Mail } from "lucide-react";

/**
 * Profile settings section
 * Displays and allows editing of user profile information
 */
const ProfileSection = () => {
  const { user, githubUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
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
      // In a real implementation, this would call a Firebase function
      // to update the user's display name
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API call

      // Update success state
      setSaveSuccess(true);
      setIsEditing(false);

      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex flex-col items-center">
            <UserAvatar user={user} size="xl" />
            {githubUser && (
              <div className="mt-4 flex flex-col items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Github className="h-4 w-4 mr-1" />
                  <span>Connected with GitHub</span>
                </div>
                {githubUser.login && (
                  <a
                    href={`https://github.com/${githubUser.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-1"
                  >
                    @{githubUser.login}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex-1">
            {saveSuccess && (
              <Alert variant="success" title="Profile Updated" className="mb-4">
                Your profile has been successfully updated.
              </Alert>
            )}

            {error && (
              <Alert
                variant="error"
                title="Error Saving Profile"
                className="mb-4"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium mb-1"
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Display Name
                  </label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      required
                    />
                  ) : (
                    <div className="text-base py-2 px-3 border border-transparent">
                      {user?.displayName || "Not set"}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </label>
                  <div className="text-base py-2 px-3 border border-transparent bg-slate-50 dark:bg-slate-800">
                    {user?.email || "No email available"}
                    <span className="text-xs ml-2 text-muted-foreground">
                      (Cannot be changed)
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" /> Save
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
