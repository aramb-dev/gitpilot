"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RotateCw } from "lucide-react";
import { signIn } from "next-auth/react";

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
    async function fetchData() {
        setLoading(true);
        try {
            const [orgsRes, prefsRes] = await Promise.all([
                fetch("/api/github/orgs"),
                fetch("/api/preferences")
            ]);

            if (!orgsRes.ok) throw new Error("Failed to fetch organizations");
            if (!prefsRes.ok) throw new Error("Failed to fetch preferences");

            const orgsData = await orgsRes.json();
            const prefsData = await prefsRes.json();

            setOrganizations(orgsData);
            if (prefsData.selectedOrgs) {
                setSelectedOrgs(prefsData.selectedOrgs);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  const toggleOrg = (login: string) => {
    setSelectedOrgs(prev =>
      prev.includes(login)
        ? prev.filter(o => o !== login)
        : [...prev, login]
    );
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
        const res = await fetch("/api/preferences", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                selectedOrgs: selectedOrgs,
            }),
        });

        if (!res.ok) throw new Error("Failed to save preferences");
        
        setSuccess(true);
    } catch (error) {
        console.error(error);
    } finally {
        setSaving(false);
    }
  };

  const handleReconnect = () => {
    signIn("github", { callbackUrl: "/dashboard/settings" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 font-mono">
        <div className="flex items-center gap-3 text-[#00ff00]">
          <span className="w-5 h-5 border-2 border-[#00ff00]/30 border-t-[#00ff00] animate-spin"></span>
          <span className="text-sm font-bold uppercase tracking-widest">loading_orgs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] border border-[#333] p-6 font-mono">
      <p className="text-[#666] text-sm mb-6">
        &gt; select organizations to manage in your dashboard
      </p>

      {/* Troubleshooting Alert */}
      <div className="p-4 bg-[#00ff00]/5 border border-[#00ff00]/30 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-[#00ff00]" />
          <span className="text-sm font-medium text-[#00ff00]">not seeing all your organizations?</span>
        </div>
        <p className="text-xs text-[#666] mb-3">
          some organizations require explicit <span className="text-white">Third-party application access</span> via GitHub settings.
        </p>
        <button
            onClick={handleReconnect}
            className="flex items-center hover:underline text-white text-sm font-medium"
        >
            &gt; reconnect_with_github <RotateCw className="ml-1 w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2 mb-6">
        {organizations.map((org) => (
          <div key={org.id} className="flex items-center space-x-3 p-3 hover:bg-[#1a1a1a] transition-colors">
            <Checkbox
                id={`org-${org.id}`}
                checked={selectedOrgs.includes(org.login)}
                onCheckedChange={() => toggleOrg(org.login)}
                className="accent-[#00ff00]"
            />
            <label
                htmlFor={`org-${org.id}`}
                className="flex items-center space-x-3 cursor-pointer flex-1"
            >
                {org.avatar_url ? (
                  <img src={org.avatar_url} alt={org.login} className="w-8 h-8 border border-[#333] flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 border border-[#333] bg-[#1a1a1a] flex-shrink-0" />
                )}
                <div>
                    <div className="text-white font-medium">{org.login}</div>
                    {org.description && (
                        <div className="text-[#666] text-xs">{org.description}</div>
                    )}
                </div>
            </label>
          </div>
        ))}
        {organizations.length === 0 && (
          <p className="text-[#666] text-sm italic py-4">no organizations found.</p>
        )}
      </div>

      <div className="pt-4 flex items-center justify-end space-x-4 border-t border-[#333]">
        {success && (
            <span className="text-[#00ff00] text-sm font-medium">saved successfully</span>
        )}
        <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1a1a1a] text-[#00ff00] border border-[#333] hover:bg-[#00ff00]/10 hover:border-[#00ff00] font-mono text-sm h-9"
        >
            {saving ? "saving..." : "save_selection"}
        </Button>
      </div>
    </div>
  );
}
