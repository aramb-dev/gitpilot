import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../../common/Card";
import { Check, X } from "lucide-react";

/**
 * Plan comparison component
 * Shows feature comparison between free and paid plans
 */
const PlanComparison = () => {
  // Plan features from your personal knowledge base
  const features = [
    {
      name: "Repository Management",
      free: "Personal repositories only",
      pro: "Organization repositories",
      category: "core",
    },
    {
      name: "Repository Filters",
      free: "Basic",
      pro: "Advanced",
      category: "core",
    },
    {
      name: "Number of Operations",
      free: "Limited",
      pro: "Unlimited",
      category: "core",
    },
    {
      name: "Support",
      free: "Standard",
      pro: "Priority",
      category: "support",
    },
    {
      name: "Team permission management",
      free: false,
      pro: true,
      category: "advanced",
    },
    {
      name: "Scheduled operations",
      free: false,
      pro: true,
      category: "advanced",
    },
    {
      name: "Detailed audit logs",
      free: false,
      pro: true,
      category: "advanced",
    },
    {
      name: "Bulk visibility changes",
      free: true,
      pro: true,
      category: "core",
    },
    {
      name: "Bulk repository deletion",
      free: true,
      pro: true,
      category: "core",
    },
  ];

  // Group features by category
  const coreFeatures = features.filter((f) => f.category === "core");
  const advancedFeatures = features.filter((f) => f.category === "advanced");
  const supportFeatures = features.filter((f) => f.category === "support");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Features</th>
                <th className="text-center py-3 px-4 font-medium">Free Plan</th>
                <th className="text-center py-3 px-4 font-medium">Pro Plan</th>
              </tr>
            </thead>
            <tbody>
              {/* Core Features */}
              <tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                <td className="py-2 px-4 font-medium" colSpan={3}>
                  Core Features
                </td>
              </tr>
              {coreFeatures.map((feature, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4">{feature.name}</td>
                  <td className="text-center py-3 px-4">
                    {feature.free === true ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : feature.free === false ? (
                      <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-auto" />
                    ) : (
                      <span className="text-sm">{feature.free}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {feature.pro === true ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : feature.pro === false ? (
                      <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-auto" />
                    ) : (
                      <span className="text-sm">{feature.pro}</span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Advanced Features */}
              <tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                <td className="py-2 px-4 font-medium" colSpan={3}>
                  Advanced Features
                </td>
              </tr>
              {advancedFeatures.map((feature, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4">{feature.name}</td>
                  <td className="text-center py-3 px-4">
                    {feature.free === true ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : feature.free === false ? (
                      <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-auto" />
                    ) : (
                      <span className="text-sm">{feature.free}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {feature.pro === true ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : feature.pro === false ? (
                      <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-auto" />
                    ) : (
                      <span className="text-sm">{feature.pro}</span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Support Features */}
              <tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                <td className="py-2 px-4 font-medium" colSpan={3}>
                  Support
                </td>
              </tr>
              {supportFeatures.map((feature, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4">{feature.name}</td>
                  <td className="text-center py-3 px-4">
                    {feature.free === true ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : feature.free === false ? (
                      <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-auto" />
                    ) : (
                      <span className="text-sm">{feature.free}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {feature.pro === true ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : feature.pro === false ? (
                      <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mx-auto" />
                    ) : (
                      <span className="text-sm">{feature.pro}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanComparison;
