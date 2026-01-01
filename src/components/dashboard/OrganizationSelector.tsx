"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, AlertCircle, ExternalLink, RotateCw } from "lucide-react";
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
  const [manualOrg, setManualOrg] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    async function fetchOrgs() {
        setLoading(true);
        try {
            const res = await fetch("/api/github/orgs");
            if (!res.ok) throw new Error("Failed to fetch organizations");
            const data = await res.json();
            
            // Load selection and manually added orgs from localStorage
            const savedSelected = localStorage.getItem("selected_orgs");
            const savedManual = localStorage.getItem("manual_orgs");
            
            let allOrgs = [...data];
            if (savedManual) {
                const manual = JSON.parse(savedManual) as Organization[];
                // Avoid duplicates
                const manualToAdd = manual.filter(m => !allOrgs.find(o => o.login === m.login));
                allOrgs = [...allOrgs, ...manualToAdd];
            }

            setOrganizations(allOrgs);
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

  const handleAddManual = async () => {
    if (!manualOrg.trim()) return;
    setSearching(true);
    try {
        const res = await fetch(`/api/github/orgs?name=${manualOrg.trim()}`);
        if (!res.ok) throw new Error("Org not found");
        const org = await res.json();
        
        setOrganizations(prev => {
            if (prev.find(o => o.login === org.login)) return prev;
            const updated = [...prev, org];
            // Save to manual list
            const manual = JSON.parse(localStorage.getItem("manual_orgs") || "[]");
            if (!manual.find((m: any) => m.login === org.login)) {
                localStorage.setItem("manual_orgs", JSON.stringify([...manual, org]));
            }
            return updated;
        });
        setManualOrg("");
    } catch (err) {
        alert("Organization not found or access denied.");
    } finally {
        setSearching(false);
    }
  };

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
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center justify-between">
            <p className="text-gray-400 text-sm">
                Select the organizations you want to manage in your dashboard.
            </p>
            <div className="flex space-x-2">
                <Input 
                    placeholder="Add org by name..."
                    value={manualOrg}
                    onChange={(e) => setManualOrg(e.target.value)}
                    className="h-9 w-48 bg-gray-700 border-gray-600"
                    onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
                />
                <Button size="sm" onClick={handleAddManual} disabled={searching}>
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
            </div>
        </div>
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
                    <a 
                        href="https://github.com/settings/applications" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center hover:underline text-white font-medium"
                    >
                        Check GitHub Permissions <ExternalLink className="ml-1 w-3 h-3" />
                    </a>
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