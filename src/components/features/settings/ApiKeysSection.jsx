import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../common/Card";
import { Button } from "../../common/Button";
import { Input } from "../../common/Input";
import { Alert } from "../../common/Alert";
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  RotateCw,
  AlertTriangle,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useGitHubApi } from "../../../hooks/useGitHubApi";
import { getGitHubToken } from "../../../services/auth";

/**
 * GitHub API keys management section
 * Displays the user's GitHub token information
 */
const ApiKeysSection = () => {
  const [token, setToken] = useState(null);
  const [tokenDisplay, setTokenDisplay] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch user's GitHub token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        const githubToken = await getGitHubToken();

        if (githubToken) {
          setToken(githubToken);

          // Create masked version of token
          const firstChars = githubToken.substring(0, 4);
          const lastChars = githubToken.substring(githubToken.length - 4);
          const maskedToken = `${firstChars}${"•".repeat(20)}${lastChars}`;
          setTokenDisplay(maskedToken);
        }
      } catch (err) {
        setError("Failed to load GitHub token information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  // Get token scopes and info using GitHub API
  const {
    data: rateLimit,
    error: apiError,
    loading: apiLoading,
  } = useGitHubApi("/rate_limit", {}, true);

  // Copy token to clipboard
  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard
        .writeText(token)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(() => {
          setError("Failed to copy token to clipboard");
        });
    }
  };

  // Toggle token visibility
  const toggleShowToken = () => {
    setShowToken(!showToken);
  };

  // Generate scopes list from token info
  const getScopes = () => {
    if (!token) return [];

    // In a real implementation, these would come from the token's scope
    return [
      { name: "repo", description: "Full control of private repositories" },
      {
        name: "user:email",
        description: "Access user email addresses (read-only)",
      },
      { name: "delete_repo", description: "Delete repositories" },
    ];
  };

  const scopes = getScopes();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>GitHub API Token</CardTitle>
        <CardDescription>
          GitPilot uses your GitHub OAuth token to perform actions on your
          behalf.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="error" title="Error" className="mb-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="py-4 text-muted-foreground text-center">
            Loading token information...
          </div>
        ) : token ? (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                <Key className="h-4 w-4 inline mr-2" />
                OAuth Access Token
              </label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  value={showToken ? token : tokenDisplay}
                  disabled
                  className="pr-20"
                />
                <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleShowToken}
                    className="h-7 w-7 p-0"
                    title={showToken ? "Hide token" : "Show token"}
                  >
                    {showToken ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyToken}
                    className="h-7 w-7 p-0"
                    title="Copy token"
                  >
                    {copySuccess ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This token grants access to your GitHub account. Never share it
                with anyone.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Token Permissions</h3>
              <div className="border rounded-md divide-y">
                {scopes.map((scope) => (
                  <div key={scope.name} className="flex items-start p-3">
                    <Lock className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-medium">{scope.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {scope.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {rateLimit && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">API Rate Limits</h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Core API</span>
                    <span className="text-sm font-medium">
                      {rateLimit.resources?.core?.remaining || 0} /{" "}
                      {rateLimit.resources?.core?.limit || 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{
                        width: `${(rateLimit.resources?.core?.remaining / rateLimit.resources?.core?.limit) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Resets in{" "}
                    {rateLimit.resources?.core?.reset
                      ? new Date(
                          rateLimit.resources.core.reset * 1000
                        ).toLocaleTimeString()
                      : "unknown"}
                  </p>
                </div>
              </div>
            )}

            <Alert variant="warning" className="mb-4">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm">
                    Revoking access will permanently remove GitPilot's ability
                    to interact with your GitHub repositories.
                  </p>
                  <p className="text-sm mt-1">
                    You can restore access anytime by logging in with GitHub
                    again.
                  </p>
                </div>
              </div>
            </Alert>

            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              Revoke GitHub Access
            </Button>
          </>
        ) : (
          <div className="text-center p-6">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No GitHub token found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find a valid GitHub token for your account. You may
              need to reconnect with GitHub.
            </p>
            <Button>
              <Github className="h-4 w-4 mr-2" />
              Connect GitHub Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiKeysSection;
