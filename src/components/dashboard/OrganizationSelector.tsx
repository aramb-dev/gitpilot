"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

  useEffect(() => {
    // Placeholder for fetching organizations
    // This will be replaced in the next task
    async function fetchOrgs() {
        setLoading(true);
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockOrgs: Organization[] = [
            { id: 1, login: "org1", avatar_url: "", description: "Description 1" },
            { id: 2, login: "org2", avatar_url: "", description: "Description 2" },
        ];
        setOrganizations(mockOrgs);
        setLoading(false);

        // Load selection from localStorage for now
        const saved = localStorage.getItem("selected_orgs");
        if (saved) {
            setSelectedOrgs(JSON.parse(saved));
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
  };

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem("selected_orgs", JSON.stringify(selectedOrgs));
    setTimeout(() => setSaving(false), 500);
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
      <CardContent className="space-y-4">
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
                <div className="w-8 h-8 rounded bg-gray-600 flex-shrink-0" />
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

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Selection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
