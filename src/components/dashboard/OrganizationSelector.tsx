"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RotateCw } from "lucide-react";
import { signIn } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Organization {
  id: number;
  login: string;
  avatar_url: string;
  description: string;
}

export function OrganizationSelector() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchOrgs() {
        setLoading(true);
        try {
            const res = await fetch("/api/github/orgs");
            if (!res.ok) throw new Error("Failed to fetch organizations");
            const data = await res.json();
            
            // Load selection from localStorage
            const savedSelected = localStorage.getItem("selected_orgs");
            
            setOrganizations(data);
            if (savedSelected) {
                setSelectedOrgs(JSON.parse(savedSelected));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    fetchOrgs();
  }, []);

  const toggleOrg = (login: string) => {
    setSelectedOrgs(prev => 
      prev.includes(login) 
        ? prev.filter(o => o !== login) 
        : [...prev, login]
    );
    setSuccess(false);
  };

  const handleSave = () => {
    setSaving(true);
    setSuccess(false);
    localStorage.setItem("selected_orgs", JSON.stringify(selectedOrgs));
    setTimeout(() => {
        setSaving(false);
        setSuccess(true);
    }, 500);
  };

  const handleReconnect = () => {
    signIn("github", { callbackUrl: "/dashboard/settings" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#58a6ff]" />
      </div>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">
          GitHub Organizations
        </CardTitle>
        <p className="text-gray-400 text-sm">
            Select the organizations you want to manage in your dashboard.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Troubleshooting Alert */}
        <Alert className="bg-blue-900/20 border-blue-900 text-blue-100">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not seeing all your organizations?</AlertTitle>
            <AlertDescription className="mt-2 text-sm text-blue-200/80">
                <p className="mb-2">
                    Some organizations require you to explicitly grant <strong>Third-party application access</strong>.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                    <button 
                        onClick={handleReconnect}
                        className="flex items-center hover:underline text-white font-medium text-left"
                    >
                        Reconnect with GitHub <RotateCw className="ml-1 w-3 h-3" />
                    </button>
                </div>
            </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {organizations.map((org) => (
            <div key={org.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
              <Checkbox 
                id={`org-${org.id}`}
                checked={selectedOrgs.includes(org.login)}
                onCheckedChange={() => toggleOrg(org.login)}
              />
              <label 
                htmlFor={`org-${org.id}`}
                className="flex items-center space-x-3 cursor-pointer flex-1"
              >
                {org.avatar_url ? (
                  <img src={org.avatar_url} alt={org.login} className="w-8 h-8 rounded flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded bg-gray-600 flex-shrink-0" />
                )}
                <div>
                    <div className="text-white font-medium">{org.login}</div>
                    {org.description && (
                        <div className="text-gray-400 text-xs">{org.description}</div>
                    )}
                </div>
              </label>
            </div>
          ))}
          {organizations.length === 0 && (
            <p className="text-gray-400 text-sm italic py-4">No organizations found.</p>
          )}
        </div>

        <div className="pt-4 flex items-center justify-end space-x-4">
          {success && (
            <span className="text-green-500 text-sm font-medium">Selection saved!</span>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Selection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
