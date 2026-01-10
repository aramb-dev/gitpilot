'use client';

import { ExternalLink, Shield } from 'lucide-react';

interface SSOAuthorizationPromptProps {
  orgLogin: string;
  orgName?: string;
  onDismiss?: () => void;
}

export function SSOAuthorizationPrompt({
  orgLogin,
  orgName,
  onDismiss,
}: SSOAuthorizationPromptProps) {
  const ssoUrl = `https://github.com/orgs/${encodeURIComponent(orgLogin)}/sso`;

  return (
    <div className="bg-yellow-900/10 border border-yellow-800/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-yellow-900/30 rounded-full flex-shrink-0">
          <Shield className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-yellow-400">
            SSO Authorization Required
          </h4>
          <p className="text-sm text-gray-400 mt-1">
            The organization <strong className="text-white">{orgName || orgLogin}</strong> requires 
            SAML single sign-on. You need to authorize GitPilot to access this organization.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <a
              href={ssoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
            >
              Authorize SSO
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
