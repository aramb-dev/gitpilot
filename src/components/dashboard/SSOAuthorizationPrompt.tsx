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
    <div className="bg-yellow-900/5 border border-yellow-900/50 p-4 font-mono">
      <div className="flex items-start gap-3">
        <div className="p-1.5 border border-yellow-900/50 bg-yellow-900/20 flex-shrink-0">
          <Shield className="w-4 h-4 text-yellow-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold uppercase tracking-tighter text-yellow-500">
            // SSO_AUTHORIZATION_REQUIRED
          </h4>
          <p className="text-xs text-[#888] mt-1">
            &gt; The organization <strong className="text-white">{orgName || orgLogin}</strong>{' '}
            requires SAML single sign-on.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a
              href={ssoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-yellow-600 hover:bg-yellow-700 text-white font-bold transition-all"
            >
              AUTHORIZE_SSO
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs text-[#666] hover:text-white transition-colors"
              >
                [dismiss]
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
